# 12 · Guía de Desarrollo

## 1. Monorepo

**pnpm workspaces + Turborepo.**

```text
cocacola-event-intelligence/
├── apps/
│   ├── api/                  # NestJS (HTTP + worker)
│   └── web/                  # React + Vite (admin + PWA staff)
├── packages/
│   ├── contracts/            # tipos, enums, códigos de error, esquemas zod compartidos
│   ├── eslint-config/
│   └── tsconfig/
├── docs/                     # esta documentación
├── docker-compose.yml        # postgres, redis, minio (S3 local)
├── turbo.json
├── pnpm-workspace.yaml
├── .env.example
├── CLAUDE.md
└── README.md
```

### `packages/contracts`
Fuente única de: enums (`EventStatus`, `RegistrationStatus`, …), `ErrorCode` + mensajes es, tipos de request/response, `FeedbackAnalysisSchema`. Lo consumen `api` (DTOs implementan estos tipos) y `web`. **Nunca** duplicar estos tipos en una app.

## 2. Versiones

| Herramienta | Versión |
|-------------|---------|
| Node.js | 22 LTS |
| pnpm | 9+ |
| TypeScript | 5.x, `strict: true` |
| NestJS | 11 |
| Prisma | 6 |
| PostgreSQL | 16 |
| Redis | 7 |
| React | 18 |
| Vite | 6 |

## 3. Setup local

```bash
pnpm install
cp .env.example .env              # completar secretos
docker compose up -d              # postgres:5432, redis:6379, minio:9000
pnpm --filter api prisma migrate dev
pnpm --filter api prisma db seed
pnpm dev                          # api :3000 (+ worker) · web :5173
```

| URL | Qué |
|-----|-----|
| http://localhost:5173/admin | Dashboard (admin@local.test) |
| http://localhost:5173/staff | PWA staff (código `LOLLA26`, PIN `123456`) |
| http://localhost:3000/api/docs | Swagger |
| http://localhost:5173/admin/dev/whatsapp | Simulador de WhatsApp |

Para probar el webhook real de Meta en local: `ngrok http 3000` y configurar la URL en Meta Developers.

## 4. Variables de entorno

### API (`apps/api/.env`)
| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `NODE_ENV` | `development` | |
| `PORT` | `3000` | |
| `APP_MODE` | `api` \| `worker` \| `all` | Qué procesos arranca (`all` en local) |
| `DATABASE_URL` | `postgresql://cei:cei@localhost:5432/cei` | |
| `REDIS_URL` | `redis://localhost:6379` | |
| `CORS_ORIGINS` | `http://localhost:5173` | Lista separada por comas |
| `JWT_ACCESS_SECRET` | — | Admin access token |
| `JWT_STAFF_SECRET` | — | Token de staff |
| `JWT_ACCESS_TTL` | `15m` | |
| `REFRESH_TTL_DAYS` | `7` | |
| `QR_SIGNING_SECRET` | — | HMAC de tokens QR (≥ 32 bytes) |
| `QR_SIGNING_SECRET_PREVIOUS` | — | Opcional, rotación |
| `ANON_SALT` | — | Salt de anonimización |
| `WHATSAPP_PROVIDER` | `meta` \| `console` | |
| `WHATSAPP_PHONE_NUMBER_ID` | — | Meta |
| `WHATSAPP_ACCESS_TOKEN` | — | Meta (token de sistema) |
| `WHATSAPP_APP_SECRET` | — | Firma de webhook |
| `WHATSAPP_VERIFY_TOKEN` | — | Verificación GET de webhook |
| `WHATSAPP_API_VERSION` | `v21.0` | |
| `OPENAI_API_KEY` | — | |
| `STT_MODEL` | `whisper-1` | |
| `LLM_MODEL` | `gpt-4o-mini` | |
| `FEEDBACK_CONCURRENCY` | `5` | |
| `STORAGE_ENDPOINT` | `http://localhost:9000` | S3 / MinIO |
| `STORAGE_BUCKET` | `cei-private` | |
| `STORAGE_ACCESS_KEY` / `STORAGE_SECRET_KEY` | — | |
| `PRIVACY_POLICY_URL` | — | Enviada en el consentimiento |
| `CONSENT_VERSION` | `2026-10` | Versión vigente del texto de consentimiento |
| `DEFAULT_TIMEZONE` | `America/Santiago` | |
| `SEED_ADMIN_PASSWORD` | — | Solo seed |

### Web (`apps/web/.env`)
| Variable | Ejemplo |
|----------|---------|
| `VITE_API_URL` | `http://localhost:3000/api/v1` |
| `VITE_ENABLE_DEV_TOOLS` | `true` |

## 5. Convenciones de código

### General
- TypeScript estricto; prohibido `any` (usar `unknown` + narrowing).
- Identificadores, commits y nombres de archivo en **inglés**; textos de usuario en **español** desde catálogos.
- Referenciar reglas de negocio en el código donde se aplican: `// BR-SAM-05`.
- Fechas siempre en UTC en DB/API; conversión a zona del evento solo en presentación y en reglas horarias (BR-FBK-02) usando `event.timezone`.
- El tiempo se obtiene del puerto `Clock` (testeable), nunca `new Date()` en dominio/aplicación.

### Backend
- Seguir estrictamente las capas de [04](./04-arquitectura-backend-nestjs.md). Un PR que importe Prisma en `application/` o `domain/` se rechaza.
- Un caso de uso = una clase con un método `execute(command)`.
- Controllers delgados: validar → llamar caso de uso → devolver.
- Errores de negocio = subclases de `DomainError` con `code` del catálogo. No lanzar `HttpException` fuera de `presentation/`.
- Repositorios devuelven entidades de dominio (mappers), no modelos Prisma.
- Lecturas complejas para dashboards: *query services* en `application/queries` con SQL/Prisma directo en `infrastructure` (CQRS ligero), sin pasar por agregados.

### Frontend
- Seguir las capas de [05](./05-arquitectura-frontend-react.md); ESLint `boundaries` lo fuerza.
- Componentes en `PascalCase.tsx`, hooks `useXxx.ts`, un componente por archivo.
- Nada de `fetch` en componentes; siempre hooks de TanStack Query.
- Estilos con Tailwind; variantes con `cva`. Colores de marca como tokens (`--cc-red: #F40009`).

### Base de datos
- Tablas y columnas `snake_case` (vía `@@map`/`@map`), modelos Prisma `PascalCase`.
- Toda migración es revisada; no editar migraciones ya aplicadas.
- Restricciones de integridad en la DB además del dominio cuando protegen dinero/fraude (BR-SAM-06, BR-CPN-03).

## 6. Testing

| Comando | Qué corre |
|---------|-----------|
| `pnpm test` | Unit (api + web) |
| `pnpm test:e2e` | E2E api (Testcontainers) |
| `pnpm --filter web test:e2e` | Playwright |
| `pnpm test:ai` | Fixtures de calidad IA (requiere `OPENAI_API_KEY`, no corre en CI por defecto) |
| `pnpm lint && pnpm typecheck` | Calidad estática |

Cobertura mínima: dominio 90 %, aplicación 80 %. Detalle de niveles en [04 §11](./04-arquitectura-backend-nestjs.md#11-testing-backend) y [05 §9](./05-arquitectura-frontend-react.md#9-testing-frontend).

## 7. Git

- Rama principal `main` (protegida). Ramas: `feat/US-21-sampling-claim`, `fix/…`, `docs/…`, `chore/…`.
- Commits **Conventional Commits**: `feat(scanning): reject second claim per BR-SAM-05`.
- PR: referencia a la historia (`US-xx`), checklist de la DoD ([11 §4](./11-roadmap-y-backlog.md#4-definición-de-hecho-dod)), capturas para cambios de UI.

## 8. Despliegue (propuesta)

| Componente | Opción |
|------------|--------|
| API + worker | Contenedores (Docker) en AWS ECS Fargate / Railway / Render; 2 servicios desde la misma imagen (`APP_MODE`) |
| Web | Build estático en S3 + CloudFront / Vercel / Netlify (HTTPS obligatorio para cámara y PWA) |
| PostgreSQL | AWS RDS / Supabase / Neon (con backups) |
| Redis | ElastiCache / Upstash |
| Storage | S3 (bucket privado, cifrado) |
| Secretos | AWS Secrets Manager / variables del proveedor |
| Observabilidad | Logs JSON → CloudWatch / Better Stack; errores → Sentry (api + web) |

Pipeline CI/CD: PR → lint/test/build; merge a `main` → deploy a *staging* + migraciones; tag `v*` → producción.
