# 07 · Contratos de API

Base URL: `/api/v1`. JSON en **camelCase** (ADR-004; reemplaza el snake_case de los ejemplos de la idea original). Fechas en ISO-8601 UTC. IDs UUID v4.

El contrato ejecutable es OpenAPI (`/api/docs`). Los tipos compartidos front/back viven en `packages/contracts`.

## 1. Envelope de respuesta

**Éxito**
```json
{
  "success": true,
  "code": "CHECK_IN_SUCCESS",
  "message": "Bienvenido/a al Coca-Cola Experience",
  "data": { },
  "meta": { "requestId": "b1f3…" }
}
```
**Error**
```json
{
  "success": false,
  "code": "BENEFIT_ALREADY_REDEEMED",
  "message": "El usuario ya retiró su muestra de esta actividad a las 20:45:12.",
  "details": { "lastClaimAt": "2026-10-02T23:45:12Z" },
  "meta": { "requestId": "b1f3…" }
}
```
**Listas paginadas** (cursor): `data: { items: [...], nextCursor: "…" | null }`, parámetros `?limit=50&cursor=…`.

`code` es estable y es lo que el frontend usa para decidir UI; `message` es informativo.

## 2. Autenticación

| Tipo | Cómo | Claims |
|------|------|--------|
| Admin | `Authorization: Bearer <access>` (15 min) + cookie `refresh_token` (7 días) | `sub`, `role: ADMIN`, `adminRole` |
| Staff | `Authorization: Bearer <staffToken>` (hasta `endsAt + 2h`) | `sub` (staffAccessId), `role: STAFF`, `eventId`, `canCheckIn`, `allowedActivityIds` |
| Webhook Meta | Header `X-Hub-Signature-256` (HMAC con App Secret) | — |
| SSE | `?access_token=<token de 60 s>` obtenido de `POST /auth/sse-ticket` | — |

## 3. Catálogo de códigos

| Código | HTTP | Semáforo | Mensaje (es) |
|--------|------|----------|--------------|
| `OK` | 200/201 | — | Éxito genérico (lecturas y CRUD) |
| `SYNC_COMPLETED` | 200 | — | Sincronización offline procesada (ver resultados por escaneo) |
| `CHECK_IN_SUCCESS` | 200 | 🟢 | Bienvenido/a {firstName} |
| `SAMPLING_CLAIMED` | 201 | 🟢 | Entrega aprobada: {product} ({n} de {max}) |
| `ALREADY_CHECKED_IN` | 409 | 🟡 | Asistencia ya registrada a las {time} |
| `NOT_CHECKED_IN` | 409 | 🟡 | Debe pasar primero por el acceso |
| `BENEFIT_ALREADY_REDEEMED` | 409 | 🔴 | Beneficio ya canjeado a las {time} |
| `QR_INVALID` | 404 | 🔴 | Código no reconocido |
| `QR_WRONG_EVENT` | 422 | 🔴 | Este pase es de otro evento |
| `REGISTRATION_CANCELLED` | 422 | 🔴 | Inscripción cancelada |
| `EVENT_NOT_ACTIVE` | 422 | 🔴 | El evento no está activo |
| `ACTIVITY_NOT_ALLOWED` | 403 | 🔴 | Actividad no habilitada para este acceso |
| `PRODUCT_NOT_IN_ACTIVITY` | 422 | 🔴 | Producto no disponible en esta actividad |
| `VALIDATION_ERROR` | 400 | — | Datos inválidos (`details.fields`) |
| `INVALID_CREDENTIALS` | 401 | — | Credenciales inválidas |
| `UNAUTHENTICATED` | 401 | — | Sesión expirada |
| `FORBIDDEN` | 403 | — | Sin permisos |
| `STAFF_ACCESS_REVOKED` | 401 | — | Acceso revocado |
| `TOO_MANY_ATTEMPTS` | 429 | — | Demasiados intentos, espera {minutes} min |
| `RATE_LIMITED` | 429 | — | Demasiadas solicitudes |
| `NOT_FOUND` | 404 | — | Recurso no encontrado |
| `EVENT_CODE_TAKEN` | 409 | — | El código de evento ya existe |
| `EVENT_NOT_EDITABLE` | 409 | — | No se puede editar en el estado actual |
| `EVENT_NOT_PUBLISHABLE` | 422 | — | Faltan actividades o datos para publicar |
| `INVALID_STATE_TRANSITION` | 409 | — | Transición de estado no permitida |
| `PRODUCT_SKU_TAKEN` | 409 | — | SKU duplicado |
| `FEEDBACK_NOT_REPROCESSABLE` | 409 | — | Solo se reprocesa feedback FAILED |
| `IDEMPOTENCY_CONFLICT` | 409 | — | `clientScanId` reutilizado con otro contenido |
| `INTERNAL_ERROR` | 500 | — | Error inesperado |

> **Nota:** la idea original usaba `403` para beneficio canjeado. Se usa `409 Conflict` porque es un conflicto con el estado del recurso, no un problema de permisos (ADR-004). El frontend decide por `code`, no por status.

## 4. Endpoints

### 4.1 Auth
| Método | Ruta | Rol | Descripción | Historia |
|--------|------|-----|-------------|----------|
| POST | `/auth/admin/login` | público | `{ email, password }` → `{ accessToken, admin }` + cookie | US-07 |
| POST | `/auth/refresh` | cookie | Rota refresh token → `{ accessToken }` | US-07 |
| POST | `/auth/logout` | ADMIN | Invalida refresh | — |
| POST | `/auth/staff/login` | público | `{ eventCode, pin }` → `{ staffToken, event, staffAccess, activities[] }` | US-09 |
| GET | `/auth/me` | ADMIN/STAFF | Principal actual | — |
| POST | `/auth/sse-ticket` | ADMIN | Token de 60 s para SSE | US-32 |

### 4.2 Eventos y actividades
| Método | Ruta | Rol | Descripción | Historia |
|--------|------|-----|-------------|----------|
| GET | `/events?status=&from=&to=&cursor=` | ADMIN | Listado | US-02 |
| POST | `/events` | BRAND_MANAGER+ | Crear (DRAFT) | US-01 |
| GET | `/events/:id` | ADMIN | Detalle con actividades, políticas, campaña | US-02 |
| PATCH | `/events/:id` | BRAND_MANAGER+ | Editar (según estado) | US-02 |
| POST | `/events/:id/publish` · `/start` · `/complete` · `/cancel` | BRAND_MANAGER+ | Transiciones | US-03 |
| GET | `/events/:id/activities` | ADMIN | Listado | US-04 |
| POST | `/events/:id/activities` | BRAND_MANAGER+ | `{ name, category, maxClaimsPerUser, productIds[] }` | US-04 |
| PATCH | `/activities/:id` | BRAND_MANAGER+ | Editar / activar / desactivar | US-04 |
| DELETE | `/activities/:id` | BRAND_MANAGER+ | Borra o desactiva si tiene interacciones | US-04 |
| PUT | `/events/:id/coupon-campaign` | BRAND_MANAGER+ | Crear/actualizar campaña | US-06 |

### 4.3 Catálogo
| Método | Ruta | Rol | Historia |
|--------|------|-----|----------|
| GET | `/products` | ADMIN | US-05 |
| POST | `/products` | BRAND_MANAGER+ | US-05 |
| PATCH | `/products/:id` | BRAND_MANAGER+ | US-05 |

### 4.4 Staff
| Método | Ruta | Rol | Descripción | Historia |
|--------|------|-----|-------------|----------|
| GET | `/events/:id/staff-accesses` | ADMIN | Listado (sin PIN) | US-08 |
| POST | `/events/:id/staff-accesses` | BRAND_MANAGER+ | `{ label, canCheckIn, allowedActivityIds[] }` → incluye `pin` **solo en esta respuesta** | US-08 |
| POST | `/staff-accesses/:id/revoke` | BRAND_MANAGER+ | Revoca | US-08 |

### 4.5 Escaneo (PWA)
| Método | Ruta | Rol | Historia |
|--------|------|-----|----------|
| POST | `/scan/check-in` | STAFF (`canCheckIn`) | US-17, US-18 |
| POST | `/scan/sampling` | STAFF | US-21, US-22 |
| GET | `/scan/offline-manifest?since=` | STAFF | US-19 |
| POST | `/scan/sync` | STAFF | US-19 |
| GET | `/scan/search?phoneSuffix=1234` | STAFF | US-20 |
| POST | `/scan/manual-check-in` | STAFF | US-20 |
| GET | `/scan/history?limit=20` | STAFF | US-23 |

**`POST /scan/check-in`**
```json
// request
{
  "qrToken": "cei1.3fa85f64….Qm9fX2…",
  "clientScanId": "6a1c2a8e-0f6e-4b5e-9d0c-1f2e3d4c5b6a",
  "scannedAt": "2026-10-02T21:45:00Z"
}
// 200
{
  "success": true,
  "code": "CHECK_IN_SUCCESS",
  "message": "Bienvenido/a Valentina",
  "data": {
    "registrationId": "…",
    "firstName": "Valentina",
    "checkInAt": "2026-10-02T21:45:00Z",
    "isRecurrent": true
  }
}
// 409
{ "success": false, "code": "ALREADY_CHECKED_IN", "message": "Asistencia ya registrada a las 19:22", "details": { "checkInAt": "2026-10-02T22:22:10Z" } }
```
> El `eventId` ya no viaja en el body: se toma del token de staff (evita que un promotor opere en otro evento).

**`POST /scan/sampling`**
```json
// request
{
  "qrToken": "cei1.…",
  "activityId": "8b7d9834-3112-4f81-a9bc-3b1a2f64c110",
  "productId": "c0a8012e-…",
  "clientScanId": "…",
  "scannedAt": "2026-10-02T22:15:30Z"
}
// 201
{
  "success": true,
  "code": "SAMPLING_CLAIMED",
  "message": "Entrega aprobada: Coca-Cola Zero Azúcar 350ml (1 de 1)",
  "data": {
    "interactionId": "…",
    "firstName": "Valentina",
    "product": { "id": "…", "name": "Coca-Cola Zero Azúcar 350ml" },
    "claimNumber": 1,
    "maxClaims": 1,
    "scannedAt": "2026-10-02T22:15:30Z"
  }
}
```

**`GET /scan/offline-manifest`**
```json
{ "success": true, "code": "OK", "data": {
  "eventId": "…", "generatedAt": "…",
  "entries": [ { "qrHash": "9f2c…", "firstName": "Valentina", "status": "REGISTERED", "checkInAt": null } ]
} }
```

**`POST /scan/sync`**
```json
// request
{ "scans": [ { "qrToken": "cei1.…", "clientScanId": "…", "scannedAt": "…" } ] }
// 200
{ "success": true, "code": "SYNC_COMPLETED", "data": {
  "accepted": 48, "duplicates": 1, "conflicts": 1, "rejected": 0,
  "results": [ { "clientScanId": "…", "code": "ALREADY_CHECKED_IN", "checkInAt": "…" } ]
} }
```

### 4.6 Inscripciones, feedback y cupones (Admin)
| Método | Ruta | Rol | Historia |
|--------|------|-----|----------|
| GET | `/events/:id/registrations?status=&q=&cursor=` | ADMIN | — |
| GET | `/events/:id/feedback?status=&minSentiment=&maxSentiment=&productId=&purchaseIntent=&topic=&cursor=` | ADMIN | US-28 |
| GET | `/feedback/:id` | ADMIN | US-28 |
| GET | `/feedback/:id/audio` | ADMIN | US-28 — redirige a URL firmada de 5 min |
| POST | `/feedback/:id/reprocess` | BRAND_MANAGER+ | US-27 |
| GET | `/events/:id/coupons?status=&cursor=` | ADMIN | US-31 |
| GET | `/events/:id/coupons/export.csv` | ADMIN | US-31 |
| POST | `/participants/:id/anonymize` | SUPER_ADMIN | US-37 |

Ejemplo de ítem de feedback:
```json
{
  "id": "…",
  "status": "COMPLETED",
  "participant": { "firstName": "Valentina", "ageRange": "AGE_25_34", "city": "Ñuñoa", "phoneLast4": "5678" },
  "inputType": "AUDIO",
  "audioDurationSec": 22,
  "transcription": "Me encantó la Zero de vainilla, es súper refrescante…",
  "sentimentScore": 5,
  "likesProduct": true,
  "purchaseIntent": true,
  "keyTopics": ["sabor", "refrescante", "música"],
  "executiveQuote": "La Zero de vainilla es súper refrescante, la compraría para el asado.",
  "receivedAt": "…",
  "processedAt": "…"
}
```

### 4.7 Analítica
| Método | Ruta | Rol | Historia |
|--------|------|-----|----------|
| GET | `/events/:id/metrics` | ADMIN | US-32 — snapshot de KPIs |
| GET | `/events/:id/metrics/timeseries?bucket=15m&metric=check_ins\|claims` | ADMIN | US-33 |
| GET | `/events/:id/live` (SSE) | ADMIN (ticket) | US-32 |
| GET | `/analytics/events-comparison?eventIds=a,b,c` | ADMIN | US-34 |

**`GET /events/:id/metrics` → `data`**
```json
{
  "registered": 4210, "attended": 3120, "attendanceRate": 74.11,
  "attendanceGoal": 4000, "goalProgress": 78.0,
  "recurrentAttendees": 640, "recurrenceRate": 20.51,
  "engagedAttendees": 2780, "engagementRate": 89.10,
  "claimsByProduct": [ { "productId": "…", "name": "Coca-Cola Zero 350ml", "claims": 1830 } ],
  "blockedFraudAttempts": 57,
  "feedback": { "requested": 2900, "completed": 610, "responseRate": 21.03, "avgSentiment": 4.21, "purchaseIntentRate": 63.4 },
  "couponsIssued": 540,
  "updatedAt": "…"
}
```

**SSE `/events/:id/live`**
```text
event: snapshot
data: { …mismo objeto de /metrics… }

event: delta
data: { "type": "checked_in", "at": "…", "isRecurrent": true }

event: delta
data: { "type": "benefit_rejected", "at": "…", "activityId": "…", "reason": "BENEFIT_ALREADY_REDEEMED" }

event: delta
data: { "type": "detractor_alert", "feedbackId": "…", "sentimentScore": 1, "quote": "…" }
```

### 4.8 Webhooks WhatsApp
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/webhooks/whatsapp` | Verificación de Meta (`hub.mode`, `hub.verify_token`, `hub.challenge`) |
| POST | `/webhooks/whatsapp` | Mensajes y estados. Valida firma, encola en `whatsapp-inbound` y responde **200 en < 200 ms** siempre (salvo firma inválida → 401) |
| POST | `/dev/whatsapp/simulate` | Solo `NODE_ENV=development`: simula mensaje entrante y devuelve las respuestas del bot (US-42) |

Payload de referencia (audio entrante, Meta Cloud API):
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "field": "messages",
      "value": {
        "messaging_product": "whatsapp",
        "metadata": { "phone_number_id": "1234567890" },
        "contacts": [{ "wa_id": "56912345678", "profile": { "name": "Valentina" } }],
        "messages": [{
          "id": "wamid.HBgL…",
          "from": "56912345678",
          "timestamp": "1759441500",
          "type": "audio",
          "audio": { "id": "media_audio_id_99812", "mime_type": "audio/ogg; codecs=opus", "voice": true }
        }]
      }
    }]
  }]
}
```

### 4.9 Sistema
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Liveness + readiness (DB, Redis) |
| GET | `/api/docs` | Swagger UI (no producción) |
