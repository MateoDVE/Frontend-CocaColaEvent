
Proyecto: **Coca-Cola Event Intelligence** — plataforma phygital (WhatsApp + PWA staff + dashboard + IA) para eventos.

## Fuente de verdad
- `docs/` es la especificación vigente. Leer `docs/README.md` (índice) antes de implementar.
- Reglas de negocio: `docs/02-logica-de-negocio.md` (IDs `BR-xxx`). Historias: `docs/03-historias-de-usuario.md` (IDs `US-xxx`).
- `COCA_COLA_EVENT_INTELLIGENCE.md` es la idea original; si contradice `docs/`, prevalece `docs/` (ver `docs/13-decisiones-de-arquitectura.md`).

## Stack
- Backend: NestJS 11 + Prisma + PostgreSQL 16 + BullMQ/Redis → `apps/api`
- Frontend: React 18 + Vite + TanStack Query + Tailwind/shadcn + PWA → `apps/web`
- Tipos compartidos: `packages/contracts` (enums, códigos de error, schemas zod). No duplicar tipos.

## Reglas al programar
- Backend por capas por módulo: `domain` (sin Nest/Prisma) ← `application` (casos de uso + puertos) ← `infrastructure` (adaptadores) / `presentation` (controllers). Ver `docs/04-arquitectura-backend-nestjs.md`.
- Frontend: `app → pages → features → entities → shared`; una feature no importa otra. Ver `docs/05-arquitectura-frontend-react.md`.
- Referenciar reglas en código y tests: `// BR-SAM-05`, `it('BR-SAM-05: …')`.
- API: camelCase, envelope `{ success, code, message, data }`; el front decide por `code` (`docs/07-contratos-api.md`).
- Código en inglés; textos de usuario en español desde catálogos.
- Nunca loguear teléfonos, tokens QR ni transcripciones.
- Si cambias una regla, contrato o decisión, actualiza el documento de `docs/` correspondiente en el mismo cambio.
- No implementar preguntas abiertas (`❓ PENDIENTE`, sección 9 de `02-logica-de-negocio.md`) sin decisión; usar el default documentado.
