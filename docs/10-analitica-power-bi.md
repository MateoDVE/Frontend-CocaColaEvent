# 10 · Analítica y Power BI

## 1. Diccionario de métricas

Todas las métricas se calculan **por evento** salvo que se indique otra cosa. Un "asistente" es una inscripción `ATTENDED`.

| Métrica | Fórmula | Notas |
|---------|---------|-------|
| Inscritos | `count(registrations WHERE status IN (REGISTERED, ATTENDED))` | Excluye canceladas |
| Asistentes | `count(registrations WHERE status = ATTENDED)` | |
| Tasa de asistencia % | `asistentes / inscritos × 100` | |
| Avance de meta % | `asistentes / attendanceGoal × 100` | |
| Asistentes recurrentes | asistentes cuyo participante tiene `isRecurrent = true` | BR-REG-07 |
| Tasa de recurrencia % | `recurrentes / asistentes × 100` | |
| Asistentes con interacción | `count(DISTINCT registrationId)` en `interactions` | |
| Engagement % | `con interacción / asistentes × 100` | |
| Muestras entregadas | `count(interactions)` en actividades `SAMPLING` | Por producto |
| Intentos de fraude bloqueados | eventos `benefit.rejected` con `BENEFIT_ALREADY_REDEEMED` | Desde `audit_logs` |
| Tasa de respuesta de feedback % | `feedback COMPLETED / feedback solicitados × 100` | |
| Sentimiento promedio | `avg(sentimentScore)` de feedback `COMPLETED` | Escala 1–5 |
| Índice de sentimiento (0–100) | `(avgSentiment − 1) × 25` | **Corrige** la idea original (`×20` da rango 20–100) |
| Net Sentiment Score | `% (score ≥ 4) − % (score ≤ 2)` | Rango −100…100. **No es NPS** (NPS requiere la pregunta de recomendación 0–10) |
| Intención de compra % | `feedback con purchaseIntent / feedback COMPLETED × 100` | La idea original dividía por asistentes; se reporta también esa variante como "intención sobre asistentes" |
| Cupones emitidos | `count(coupons)` | |

## 2. Esquema `analytics` (vistas para BI)

Las vistas viven en el esquema `analytics`; el usuario `bi_reader` solo tiene permisos allí. **Ninguna vista expone nombre ni teléfono** (BR-PRV-04).

> ⚠️ **Corrección importante sobre la idea original:** `vw_event_performance` hacía `LEFT JOIN` de registros con `interactions` y `feedback` en la misma consulta. Como cada inscripción puede tener varias interacciones, las filas se multiplican (*fan-out*) y `COUNT(er.id)` inflaba inscritos y asistentes, además de ponderar mal el promedio de sentimiento. Las vistas siguientes agregan cada tabla por separado en CTEs antes de unirlas.

### 2.1 `analytics.vw_event_performance`
```sql
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE OR REPLACE VIEW analytics.vw_event_performance AS
WITH reg AS (
  SELECT r.event_id,
         COUNT(*) FILTER (WHERE r.status IN ('REGISTERED','ATTENDED'))           AS total_registered,
         COUNT(*) FILTER (WHERE r.status = 'ATTENDED')                            AS total_attended,
         COUNT(*) FILTER (WHERE r.status = 'ATTENDED' AND p.is_recurrent)         AS recurrent_attendees
  FROM event_registrations r
  JOIN participants p ON p.id = r.participant_id
  GROUP BY r.event_id
),
inter AS (
  SELECT r.event_id,
         COUNT(DISTINCT i.registration_id) AS attendees_with_interactions,
         COUNT(i.id)                       AS total_interactions
  FROM interactions i
  JOIN event_registrations r ON r.id = i.registration_id
  GROUP BY r.event_id
),
fb AS (
  SELECT r.event_id,
         COUNT(*)                                                    AS feedback_requested,
         COUNT(*) FILTER (WHERE f.status = 'COMPLETED')              AS feedback_completed,
         AVG(f.sentiment_score) FILTER (WHERE f.status = 'COMPLETED') AS avg_sentiment,
         COUNT(*) FILTER (WHERE f.status = 'COMPLETED' AND f.sentiment_score >= 4) AS promoters,
         COUNT(*) FILTER (WHERE f.status = 'COMPLETED' AND f.sentiment_score <= 2) AS detractors,
         COUNT(*) FILTER (WHERE f.status = 'COMPLETED' AND f.purchase_intent)      AS with_purchase_intent
  FROM feedback f
  JOIN event_registrations r ON r.id = f.registration_id
  GROUP BY r.event_id
),
cp AS (
  SELECT r.event_id, COUNT(*) AS coupons_issued
  FROM coupons c JOIN event_registrations r ON r.id = c.registration_id
  GROUP BY r.event_id
)
SELECT
  e.id                         AS event_id,
  e.public_code,
  e.name                       AS event_name,
  e.type                       AS event_type,
  e.status                     AS event_status,
  e.city                       AS event_city,
  (e.starts_at AT TIME ZONE e.timezone)::date AS event_date,
  e.capacity,
  e.attendance_goal,
  COALESCE(reg.total_registered, 0)      AS total_registered,
  COALESCE(reg.total_attended, 0)        AS total_attended,
  ROUND(100.0 * reg.total_attended / NULLIF(reg.total_registered, 0), 2)    AS attendance_rate_pct,
  ROUND(100.0 * reg.total_attended / NULLIF(e.attendance_goal, 0), 2)       AS goal_progress_pct,
  COALESCE(reg.recurrent_attendees, 0)   AS recurrent_attendees,
  ROUND(100.0 * reg.recurrent_attendees / NULLIF(reg.total_attended, 0), 2) AS recurrence_rate_pct,
  COALESCE(inter.attendees_with_interactions, 0) AS attendees_with_interactions,
  ROUND(100.0 * inter.attendees_with_interactions / NULLIF(reg.total_attended, 0), 2) AS engagement_rate_pct,
  COALESCE(inter.total_interactions, 0)  AS total_interactions,
  COALESCE(fb.feedback_requested, 0)     AS feedback_requested,
  COALESCE(fb.feedback_completed, 0)     AS feedback_completed,
  ROUND(100.0 * fb.feedback_completed / NULLIF(fb.feedback_requested, 0), 2) AS feedback_response_rate_pct,
  ROUND(fb.avg_sentiment, 2)             AS avg_sentiment,
  ROUND((fb.avg_sentiment - 1) * 25, 1)  AS sentiment_index_0_100,
  ROUND(100.0 * (fb.promoters - fb.detractors) / NULLIF(fb.feedback_completed, 0), 1) AS net_sentiment_score,
  COALESCE(fb.with_purchase_intent, 0)   AS with_purchase_intent,
  ROUND(100.0 * fb.with_purchase_intent / NULLIF(fb.feedback_completed, 0), 2) AS purchase_intent_rate_pct,
  COALESCE(cp.coupons_issued, 0)         AS coupons_issued
FROM events e
LEFT JOIN reg   ON reg.event_id   = e.id
LEFT JOIN inter ON inter.event_id = e.id
LEFT JOIN fb    ON fb.event_id    = e.id
LEFT JOIN cp    ON cp.event_id    = e.id
WHERE e.status <> 'DRAFT';
```

### 2.2 `analytics.vw_product_sampling`
```sql
CREATE OR REPLACE VIEW analytics.vw_product_sampling AS
WITH s AS (
  SELECT a.event_id, i.product_id, i.registration_id, COUNT(*) AS samples
  FROM interactions i
  JOIN activities a ON a.id = i.activity_id
  WHERE a.category = 'SAMPLING' AND i.product_id IS NOT NULL
  GROUP BY a.event_id, i.product_id, i.registration_id
)
SELECT
  s.event_id,
  pr.id          AS product_id,
  pr.sku,
  pr.name        AS product_name,
  pr.brand_line,
  SUM(s.samples)                       AS total_samples_delivered,
  COUNT(*)                             AS unique_consumers_sampled,
  COUNT(f.id) FILTER (WHERE f.status = 'COMPLETED')                     AS consumers_with_feedback,
  ROUND(AVG(f.sentiment_score) FILTER (WHERE f.status = 'COMPLETED'), 2) AS avg_sentiment_of_samplers,
  COUNT(*) FILTER (WHERE f.likes_product)   AS liked_product,
  COUNT(*) FILTER (WHERE f.purchase_intent) AS with_purchase_intent
FROM s
JOIN products pr ON pr.id = s.product_id
LEFT JOIN feedback f ON f.registration_id = s.registration_id
GROUP BY s.event_id, pr.id, pr.sku, pr.name, pr.brand_line;
```
> El sentimiento es por **consumidor** (cada consumidor pesa 1 por producto), no por muestra. Si probó varios productos, su feedback se atribuye a cada uno; para atribución exacta usar `feedback.ai_metadata->'productsMentioned'` (vista 2.4).

### 2.3 `analytics.vw_hourly_flow`
```sql
CREATE MATERIALIZED VIEW analytics.mv_hourly_flow AS
SELECT r.event_id,
       date_trunc('hour', r.check_in_at) + floor(extract(minute FROM r.check_in_at) / 15) * interval '15 min' AS bucket,
       'CHECK_IN' AS kind, COUNT(*) AS total
FROM event_registrations r WHERE r.check_in_at IS NOT NULL
GROUP BY 1, 2
UNION ALL
SELECT a.event_id,
       date_trunc('hour', i.scanned_at) + floor(extract(minute FROM i.scanned_at) / 15) * interval '15 min',
       'CLAIM', COUNT(*)
FROM interactions i JOIN activities a ON a.id = i.activity_id
GROUP BY 1, 2;

CREATE UNIQUE INDEX ON analytics.mv_hourly_flow (event_id, bucket, kind);
-- Refrescada cada 5 min por RefreshMaterializedViewsJob:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.mv_hourly_flow;
```

### 2.4 `analytics.vw_feedback_insights` (sin PII)
```sql
CREATE OR REPLACE VIEW analytics.vw_feedback_insights AS
SELECT
  f.id AS feedback_id,
  r.event_id,
  p.age_range,
  p.city,
  p.is_recurrent,
  f.input_type,
  f.sentiment_score,
  f.likes_product,
  f.purchase_intent,
  f.key_topics,
  f.ai_metadata -> 'productsMentioned' AS products_mentioned,
  f.ai_metadata -> 'flavorAttributes'  AS flavor_attributes,
  f.executive_quote,
  f.processed_at
FROM feedback f
JOIN event_registrations r ON r.id = f.registration_id
JOIN participants p ON p.id = r.participant_id
WHERE f.status = 'COMPLETED' AND p.anonymized_at IS NULL;
```

### 2.5 `analytics.vw_audience_demographics`
```sql
CREATE OR REPLACE VIEW analytics.vw_audience_demographics AS
SELECT r.event_id, p.age_range, p.city, r.status,
       COUNT(*) AS participants,
       COUNT(*) FILTER (WHERE p.marketing_consent) AS with_marketing_consent
FROM event_registrations r
JOIN participants p ON p.id = r.participant_id
GROUP BY r.event_id, p.age_range, p.city, r.status;
```

### 2.6 Permisos
```sql
CREATE ROLE bi_reader LOGIN PASSWORD :'BI_READER_PASSWORD';
GRANT USAGE ON SCHEMA analytics TO bi_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO bi_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT SELECT ON TABLES TO bi_reader;
```

## 3. Modelo en Power BI
- **Conexión:** DirectQuery para `vw_event_performance` (datos en vivo); Import con refresh programado cada 30 min para `vw_feedback_insights`, `vw_audience_demographics` y `mv_hourly_flow` (mejor rendimiento).
- **Relaciones:** `vw_event_performance[event_id]` (dimensión de evento) 1→* con el resto por `event_id`.
- **Tabla de fechas** propia marcada como tabla de fechas, relacionada con `event_date`.

### 3.1 Medidas DAX
```dax
Attendance Rate % =
DIVIDE ( SUM ( vw_event_performance[total_attended] ), SUM ( vw_event_performance[total_registered] ) ) * 100

Sentiment Index (0-100) =
VAR AvgS =
    DIVIDE (
        SUMX ( vw_event_performance, vw_event_performance[avg_sentiment] * vw_event_performance[feedback_completed] ),
        SUM ( vw_event_performance[feedback_completed] )
    )
RETURN ( AvgS - 1 ) * 25

Purchase Intent % =
DIVIDE ( SUM ( vw_event_performance[with_purchase_intent] ), SUM ( vw_event_performance[feedback_completed] ) ) * 100

Purchase Intent over Attendees % =
DIVIDE ( SUM ( vw_event_performance[with_purchase_intent] ), SUM ( vw_event_performance[total_attended] ) ) * 100

Feedback Response Rate % =
DIVIDE ( SUM ( vw_event_performance[feedback_completed] ), SUM ( vw_event_performance[feedback_requested] ) ) * 100
```
> El promedio de sentimiento entre varios eventos se **pondera por cantidad de feedback** (no promedio de promedios), corrigiendo la medida de la idea original.

### 3.2 Páginas sugeridas del reporte
1. **Resumen ejecutivo:** KPIs, comparativo por evento, tendencia mensual.
2. **Audiencia:** demografía, ciudades, recurrencia, consentimiento de marketing.
3. **Producto:** muestras por SKU, sentimiento e intención de compra por producto, atributos de sabor (nube de palabras).
4. **Voz del consumidor:** temas, citas ejecutivas, detractores.
5. **Operación:** flujo por 15 min, fraude bloqueado, rendimiento por stand.
