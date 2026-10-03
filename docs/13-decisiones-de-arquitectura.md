# 13 · Registro de Decisiones de Arquitectura (ADR)

Formato corto: contexto → decisión → consecuencias. Estado: ✅ Aceptada · 🔄 Propuesta · ❌ Reemplazada. Para cambiar una decisión, agregar un ADR nuevo que la reemplace (no editar el original).

---

### ADR-001
**Backend en NestJS con arquitectura por capas (hexagonal) dentro de un monolito modular** · ✅ · 2026-10-02

- **Contexto:** La idea original recomendaba FastAPI o NestJS. El equipo eligió NestJS. Hay reglas de negocio críticas (antifraude, consentimiento) y varias integraciones externas (WhatsApp, OpenAI, storage).
- **Decisión:** NestJS 11 + TypeScript. Cada módulo de negocio con capas `domain / application / infrastructure / presentation` y puertos para todo IO. Un solo repositorio desplegable con dos modos de proceso (`api`, `worker`).
- **Consecuencias:** + Reglas testeables sin framework; + proveedores intercambiables (Meta↔Twilio, OpenAI↔otro); + un solo lenguaje con el frontend y tipos compartidos. − Más archivos/boilerplate que un CRUD directo; se acepta por la criticidad del dominio. El procesamiento de audio se hace con SDKs HTTP (no requiere Python).

### ADR-002
**Frontend en React + Vite (SPA) en una sola app con áreas admin y staff** · ✅ · 2026-10-02

- **Contexto:** La idea original proponía Next.js. El proyecto define React. Admin y PWA son apps internas autenticadas: no se necesita SSR ni SEO.
- **Decisión:** React 18 + Vite + React Router + TanStack Query + Tailwind/shadcn + `vite-plugin-pwa`. Una sola app con code-splitting por área.
- **Consecuencias:** + Despliegue estático simple; + PWA ligera. − Si en el futuro se requiere una landing pública con SEO, se hará como app separada.

### ADR-003
**PostgreSQL + Prisma; vistas SQL para BI en esquema `analytics`** · ✅ · 2026-10-02

- **Decisión:** Prisma para el modelo transaccional; restricciones y vistas con migraciones SQL crudas. Power BI accede solo al esquema `analytics` con un rol de solo lectura.
- **Consecuencias:** + Tipado fuerte; + BI aislado de cambios internos. − Las vistas deben mantenerse al cambiar el esquema (test de migración que hace `SELECT` de cada vista).

### ADR-004
**Convenciones de API: camelCase, envelope con `code`, 409 para conflictos de estado** · ✅ · 2026-10-02

- **Contexto:** La idea original usaba snake_case y `403` para beneficio ya canjeado.
- **Decisión:** JSON camelCase (consistente con TypeScript en ambos extremos). Envelope `{ success, code, message, data|details, meta }`. `409` para `ALREADY_CHECKED_IN`, `BENEFIT_ALREADY_REDEEMED` (conflicto de estado), `403` solo para permisos. El cliente decide la UI por `code`.
- **Consecuencias:** Los ejemplos de la idea original quedan como referencia histórica; el contrato vigente es [07](./07-contratos-api.md).

### ADR-005
**Antifraude garantizado en base de datos con `claim_number`** · ✅ · 2026-10-02

- **Contexto:** La idea proponía `UNIQUE(registration_id, activity_id)`, que solo sirve si `max_claims_per_user = 1`.
- **Decisión:** Columna `claim_number` (1..max) con `UNIQUE(registration_id, activity_id, claim_number)` + `SELECT … FOR UPDATE` sobre la inscripción.
- **Consecuencias:** + Correcto para cualquier máximo y bajo concurrencia. − Requiere calcular `claim_number` en el dominio.

### ADR-006
**Offline solo para check-in; sampling requiere conexión (MVP)** · ✅ · 2026-10-02

- **Contexto:** Recintos con conectividad inestable. Sampling offline en varios dispositivos no puede garantizar "una muestra por persona" sin coordinación.
- **Decisión:** Check-in offline con manifiesto local + cola + sync ("el primer `scannedAt` gana"). Sampling bloqueado sin red.
- **Consecuencias:** + Antifraude intacto. − Stands de sampling necesitan conectividad (recomendar router 4G). Revisitar si Q-06 cambia.

### ADR-007
**IA detrás de puertos; modelos configurables; Structured Outputs + validación zod** · ✅ · 2026-10-02

- **Decisión:** `SpeechToText` y `FeedbackAnalyzer` como puertos; OpenAI `whisper-1` y `gpt-4o-mini` por defecto vía env. Prompts versionados en código y salida completa guardada en `ai_metadata` con `model` y `promptVersion`.
- **Consecuencias:** + Se puede cambiar de modelo/proveedor y comparar versiones de prompt. − Se necesita la suite de fixtures para detectar regresiones.

### ADR-008
**Eventos de dominio en proceso + BullMQ para efectos con reintento; Outbox diferido** · ✅ · 2026-10-02

- **Decisión:** Eventos de dominio publicados tras el commit con `@nestjs/event-emitter`; los handlers que hacen IO externo encolan jobs en BullMQ (reintentos, backoff).
- **Consecuencias:** + Simple. − Si el proceso cae entre commit y encolado se puede perder un efecto (ej. mensaje). Mitigación: jobs de reconciliación (ej. inscripciones sin `qrImageKey` → reenviar). Si se vuelve un problema, adoptar patrón *Transactional Outbox*.

### ADR-009
**Tiempo real con SSE + Redis Pub/Sub** · ✅ · 2026-10-02

- **Contexto:** La idea mencionaba SSE o WebSockets. El dashboard solo recibe datos.
- **Decisión:** SSE (unidireccional, reconexión nativa, pasa por proxies HTTP). Redis Pub/Sub para fan-out entre instancias.
- **Consecuencias:** + Simple. − Autenticación por ticket en query string (corto plazo) porque `EventSource` no envía headers.

### ADR-010
**El participante no tiene cuenta: identidad = número de WhatsApp** · ✅ · 2026-10-02

- **Decisión:** Sin login para participantes; la identidad la verifica WhatsApp. El QR firmado es la credencial en terreno.
- **Consecuencias:** + Cero fricción. − Si alguien pierde su teléfono, el staff usa búsqueda manual (US-20).
