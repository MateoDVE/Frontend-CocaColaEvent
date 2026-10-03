# 06 · Modelo de Datos

Base de datos: **PostgreSQL 16**. ORM y migraciones: **Prisma** (`apps/api/prisma/schema.prisma`). Las vistas analíticas se crean con migraciones SQL crudas (`prisma migrate` con archivo `.sql` manual), ver [10](./10-analitica-power-bi.md).

## 1. Cambios respecto a la idea original

| Cambio | Motivo |
|--------|--------|
| `users` → **`participants`** | Evita confusión con usuarios internos (admin/staff). |
| Nuevas tablas `admin_users`, `staff_accesses` | La idea no modelaba autenticación de admin/staff. |
| Nuevas tablas `products`, `activity_products` | `product_involved` era texto libre → reportes inconsistentes (BR-SAM-04). |
| `interactions.claim_number` + `UNIQUE(registration_id, activity_id, claim_number)` | Antifraude garantizado por la base de datos aunque `max_claims_per_user > 1` (BR-SAM-06). |
| Nuevas tablas `coupon_campaigns`, `coupons` | Los cupones no estaban modelados. |
| Nuevas tablas `conversation_sessions`, `whatsapp_messages` | Estado del bot y deduplicación de webhooks. |
| `feedback.status` y campos del pipeline | Máquina de estados del procesamiento (BR-FBK). |
| Enums de Postgres en vez de `VARCHAR` con valores en distinto *casing* | La idea mezclaba `'PLANNED'` y `'Registered'`. |
| `participants.consent_at`, `consent_version`, `anonymized_at` | Trazabilidad del consentimiento y derecho de supresión. |
| `events.public_code`, `capacity`, `attendance_goal`, políticas | BR-EVT-02, 06, 07 y políticas configurables. |
| `audit_logs` | US-39. |

## 2. Diagrama entidad-relación

```mermaid
erDiagram
    ADMIN_USERS ||--o{ EVENTS : crea
    EVENTS ||--o{ ACTIVITIES : define
    EVENTS ||--o{ EVENT_REGISTRATIONS : contiene
    EVENTS ||--o{ STAFF_ACCESSES : habilita
    EVENTS ||--o| COUPON_CAMPAIGNS : ofrece
    PARTICIPANTS ||--o{ EVENT_REGISTRATIONS : tiene
    PARTICIPANTS ||--o| CONVERSATION_SESSIONS : conversa
    ACTIVITIES ||--o{ ACTIVITY_PRODUCTS : ofrece
    PRODUCTS ||--o{ ACTIVITY_PRODUCTS : "está en"
    EVENT_REGISTRATIONS ||--o{ INTERACTIONS : realiza
    ACTIVITIES ||--o{ INTERACTIONS : registra
    PRODUCTS ||--o{ INTERACTIONS : entregado
    STAFF_ACCESSES ||--o{ INTERACTIONS : escanea
    EVENT_REGISTRATIONS ||--o| FEEDBACK : entrega
    EVENT_REGISTRATIONS ||--o| COUPONS : recibe
    COUPON_CAMPAIGNS ||--o{ COUPONS : emite
```

## 3. `schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ───────────── Enums ─────────────

enum AdminRole {
  SUPER_ADMIN
  BRAND_MANAGER   // gestiona eventos
  ANALYST         // solo lectura
}

enum EventType {
  FESTIVAL
  PRODUCT_LAUNCH
  SAMPLING
  SPORTS
  POP_UP
  OTHER
}

enum EventStatus {
  DRAFT
  PUBLISHED
  ACTIVE
  COMPLETED
  CANCELLED
}

enum ActivityCategory {
  SAMPLING
  PHOTO_BOOTH
  GAME
  VIP
  FREESTYLE
  OTHER
}

enum AgeRange {
  UNDER_18
  AGE_18_24
  AGE_25_34
  AGE_35_44
  AGE_45_PLUS
}

enum RegistrationStatus {
  REGISTERED
  ATTENDED
  CANCELLED
}

enum CheckInMethod {
  QR_ONLINE
  QR_OFFLINE_SYNC
  MANUAL
}

enum FeedbackStatus {
  REQUESTED
  RECEIVED
  TRANSCRIBING
  ANALYZING
  COMPLETED
  REJECTED
  FAILED
  EXPIRED
}

enum FeedbackInputType {
  AUDIO
  TEXT
}

enum CouponPolicy {
  ANY_VALID_FEEDBACK
  MIN_SENTIMENT
}

enum CouponStatus {
  ISSUED
  REDEEMED
  EXPIRED
}

enum ConversationStep {
  IDLE
  SELECT_EVENT
  ASK_NAME
  ASK_AGE
  ASK_CITY
  ASK_CONSENT
  ASK_MARKETING
  CONFIRM_EXISTING
  AWAITING_FEEDBACK
  CONFIRM_DELETION
}

enum MessageDirection {
  INBOUND
  OUTBOUND
}

// ───────────── Usuarios internos ─────────────

model AdminUser {
  id           String    @id @default(uuid()) @db.Uuid
  email        String    @unique @db.VarChar(255)
  passwordHash String    @map("password_hash")
  fullName     String    @map("full_name") @db.VarChar(150)
  role         AdminRole @default(BRAND_MANAGER)
  isActive     Boolean   @default(true) @map("is_active")
  lastLoginAt  DateTime? @map("last_login_at") @db.Timestamptz
  createdAt    DateTime  @default(now()) @map("created_at") @db.Timestamptz
  events       Event[]

  @@map("admin_users")
}

model StaffAccess {
  id                 String        @id @default(uuid()) @db.Uuid
  eventId            String        @map("event_id") @db.Uuid
  label              String        @db.VarChar(100)
  pinHash            String        @map("pin_hash")
  canCheckIn         Boolean       @default(true) @map("can_check_in")
  allowedActivityIds String[]      @map("allowed_activity_ids") @db.Uuid
  revokedAt          DateTime?     @map("revoked_at") @db.Timestamptz
  createdAt          DateTime      @default(now()) @map("created_at") @db.Timestamptz
  event              Event         @relation(fields: [eventId], references: [id], onDelete: Cascade)
  interactions       Interaction[]

  @@index([eventId])
  @@map("staff_accesses")
}

// ───────────── Eventos y catálogo ─────────────

model Event {
  id                   String       @id @default(uuid()) @db.Uuid
  publicCode           String       @unique @map("public_code") @db.VarChar(12)
  name                 String       @db.VarChar(200)
  type                 EventType
  status               EventStatus  @default(DRAFT)
  startsAt             DateTime     @map("starts_at") @db.Timestamptz
  endsAt               DateTime     @map("ends_at") @db.Timestamptz
  timezone             String       @default("America/Santiago") @db.VarChar(64)
  location             String       @db.VarChar(200)
  city                 String       @db.VarChar(100)
  capacity             Int
  attendanceGoal       Int          @map("attendance_goal")
  // Políticas configurables (02 §4)
  overbookingFactor    Decimal      @default(1.0) @map("overbooking_factor") @db.Decimal(3, 2)
  feedbackDelayMinutes Int          @default(30) @map("feedback_delay_minutes")
  feedbackWindowHours  Int          @default(48) @map("feedback_window_hours")
  allowMinors          Boolean      @default(false) @map("allow_minors")
  audioRetentionDays   Int          @default(30) @map("audio_retention_days")
  createdById          String       @map("created_by_id") @db.Uuid
  createdAt            DateTime     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt            DateTime     @updatedAt @map("updated_at") @db.Timestamptz

  createdBy      AdminUser           @relation(fields: [createdById], references: [id])
  activities     Activity[]
  registrations  Registration[]
  staffAccesses  StaffAccess[]
  couponCampaign CouponCampaign?

  @@index([status, startsAt])
  @@map("events")
}

model Activity {
  id               String            @id @default(uuid()) @db.Uuid
  eventId          String            @map("event_id") @db.Uuid
  name             String            @db.VarChar(150)
  category         ActivityCategory
  maxClaimsPerUser Int               @default(1) @map("max_claims_per_user")
  isActive         Boolean           @default(true) @map("is_active")
  createdAt        DateTime          @default(now()) @map("created_at") @db.Timestamptz
  event            Event             @relation(fields: [eventId], references: [id], onDelete: Cascade)
  products         ActivityProduct[]
  interactions     Interaction[]

  @@unique([eventId, name])
  @@map("activities")
}

model Product {
  id           String            @id @default(uuid()) @db.Uuid
  sku          String            @unique @db.VarChar(50)
  name         String            @db.VarChar(150)   // "Coca-Cola Zero Azúcar 350ml"
  brandLine    String            @map("brand_line") @db.VarChar(80) // "Coca-Cola Zero"
  isActive     Boolean           @default(true) @map("is_active")
  activities   ActivityProduct[]
  interactions Interaction[]

  @@map("products")
}

model ActivityProduct {
  activityId String   @map("activity_id") @db.Uuid
  productId  String   @map("product_id") @db.Uuid
  activity   Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  product    Product  @relation(fields: [productId], references: [id])

  @@id([activityId, productId])
  @@map("activity_products")
}

// ───────────── Participantes e inscripciones ─────────────

model Participant {
  id               String               @id @default(uuid()) @db.Uuid
  phoneNumber      String               @unique @map("phone_number") @db.VarChar(80) // E.164; hash tras anonimizar
  fullName         String               @map("full_name") @db.VarChar(150)
  ageRange         AgeRange             @map("age_range")
  city             String               @db.VarChar(100)
  dataConsent      Boolean              @map("data_consent")
  marketingConsent Boolean              @default(false) @map("marketing_consent")
  consentAt        DateTime             @map("consent_at") @db.Timestamptz
  consentVersion   String               @map("consent_version") @db.VarChar(20)
  isRecurrent      Boolean              @default(false) @map("is_recurrent")
  lastInboundAt    DateTime?            @map("last_inbound_at") @db.Timestamptz // ventana 24 h WhatsApp
  anonymizedAt     DateTime?            @map("anonymized_at") @db.Timestamptz
  createdAt        DateTime             @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime             @updatedAt @map("updated_at") @db.Timestamptz
  registrations    Registration[]
  session          ConversationSession?

  @@map("participants")
}

model Registration {
  id                   String             @id @default(uuid()) @db.Uuid
  participantId        String             @map("participant_id") @db.Uuid
  eventId              String             @map("event_id") @db.Uuid
  qrHash               String             @unique @map("qr_hash") @db.VarChar(64)
  status               RegistrationStatus @default(REGISTERED)
  checkInAt            DateTime?          @map("check_in_at") @db.Timestamptz
  checkInMethod        CheckInMethod?     @map("check_in_method")
  checkInStaffAccessId String?            @map("check_in_staff_access_id") @db.Uuid
  checkInClientScanId  String?            @unique @map("check_in_client_scan_id") @db.Uuid
  lastActivityAt       DateTime?          @map("last_activity_at") @db.Timestamptz
  cancelledAt          DateTime?          @map("cancelled_at") @db.Timestamptz
  qrImageKey           String?            @map("qr_image_key")
  createdAt            DateTime           @default(now()) @map("created_at") @db.Timestamptz

  participant  Participant   @relation(fields: [participantId], references: [id], onDelete: Cascade)
  event        Event         @relation(fields: [eventId], references: [id], onDelete: Cascade)
  interactions Interaction[]
  feedback     Feedback?
  coupon       Coupon?

  @@unique([participantId, eventId])              // BR-REG-05
  @@index([eventId, status])
  @@index([status, lastActivityAt])               // job de feedback
  @@map("event_registrations")
}

model Interaction {
  id             String       @id @default(uuid()) @db.Uuid
  registrationId String       @map("registration_id") @db.Uuid
  activityId     String       @map("activity_id") @db.Uuid
  productId      String?      @map("product_id") @db.Uuid
  staffAccessId  String       @map("staff_access_id") @db.Uuid
  claimNumber    Int          @map("claim_number")
  clientScanId   String       @unique @map("client_scan_id") @db.Uuid   // BR-SAM-08
  scannedAt      DateTime     @map("scanned_at") @db.Timestamptz
  createdAt      DateTime     @default(now()) @map("created_at") @db.Timestamptz

  registration Registration @relation(fields: [registrationId], references: [id], onDelete: Cascade)
  activity     Activity     @relation(fields: [activityId], references: [id], onDelete: Cascade)
  product      Product?     @relation(fields: [productId], references: [id])
  staffAccess  StaffAccess  @relation(fields: [staffAccessId], references: [id])

  @@unique([registrationId, activityId, claimNumber])   // BR-SAM-06
  @@index([activityId, scannedAt])
  @@map("interactions")
}

// ───────────── Feedback y cupones ─────────────

model Feedback {
  id               String            @id @default(uuid()) @db.Uuid
  registrationId   String            @unique @map("registration_id") @db.Uuid
  status           FeedbackStatus    @default(REQUESTED)
  inputType        FeedbackInputType? @map("input_type")
  requestedAt      DateTime          @map("requested_at") @db.Timestamptz
  receivedAt       DateTime?         @map("received_at") @db.Timestamptz
  processedAt      DateTime?         @map("processed_at") @db.Timestamptz
  waMediaId        String?           @map("wa_media_id")
  audioKey         String?           @map("audio_key")          // null tras purga (BR-PRV-01)
  audioDurationSec Int?              @map("audio_duration_sec")
  transcription    String?           @db.Text
  sentimentScore   Int?              @map("sentiment_score") @db.SmallInt // CHECK 1..5 en migración SQL
  likesProduct     Boolean?          @map("likes_product")
  purchaseIntent   Boolean?          @map("purchase_intent")
  isRelevant       Boolean?          @map("is_relevant")
  keyTopics        String[]          @map("key_topics")
  executiveQuote   String?           @map("executive_quote") @db.Text
  aiMetadata       Json?             @map("ai_metadata")         // salida completa del LLM + modelo + versión de prompt
  attempts         Int               @default(0)
  lastError        String?           @map("last_error") @db.Text
  createdAt        DateTime          @default(now()) @map("created_at") @db.Timestamptz

  registration Registration @relation(fields: [registrationId], references: [id], onDelete: Cascade)

  @@index([status])
  @@map("feedback")
}

model CouponCampaign {
  id            String       @id @default(uuid()) @db.Uuid
  eventId       String       @unique @map("event_id") @db.Uuid
  codePrefix    String       @map("code_prefix") @db.VarChar(10)
  discountLabel String       @map("discount_label") @db.VarChar(200) // "30% en tu próximo pack Coca-Cola Zero"
  policy        CouponPolicy @default(MIN_SENTIMENT)
  minSentiment  Int          @default(3) @map("min_sentiment") @db.SmallInt
  expiresAt     DateTime     @map("expires_at") @db.Timestamptz
  maxCoupons    Int?         @map("max_coupons")
  event         Event        @relation(fields: [eventId], references: [id], onDelete: Cascade)
  coupons       Coupon[]

  @@map("coupon_campaigns")
}

model Coupon {
  id             String         @id @default(uuid()) @db.Uuid
  campaignId     String         @map("campaign_id") @db.Uuid
  registrationId String         @unique @map("registration_id") @db.Uuid   // BR-CPN-03
  code           String         @unique @db.VarChar(24)
  status         CouponStatus   @default(ISSUED)
  issuedAt       DateTime       @default(now()) @map("issued_at") @db.Timestamptz
  redeemedAt     DateTime?      @map("redeemed_at") @db.Timestamptz
  campaign       CouponCampaign @relation(fields: [campaignId], references: [id])
  registration   Registration   @relation(fields: [registrationId], references: [id], onDelete: Cascade)

  @@map("coupons")
}

// ───────────── WhatsApp ─────────────

model ConversationSession {
  id            String           @id @default(uuid()) @db.Uuid
  phoneNumber   String           @unique @map("phone_number") @db.VarChar(25)
  participantId String?          @unique @map("participant_id") @db.Uuid
  step          ConversationStep @default(IDLE)
  eventId       String?          @map("event_id") @db.Uuid
  draft         Json?            // respuestas parciales antes del consentimiento (BR-REG-03)
  retries       Int              @default(0)
  expiresAt     DateTime         @map("expires_at") @db.Timestamptz // TTL 24 h
  updatedAt     DateTime         @updatedAt @map("updated_at") @db.Timestamptz
  participant   Participant?     @relation(fields: [participantId], references: [id], onDelete: SetNull)

  @@map("conversation_sessions")
}

model WhatsappMessage {
  id           String           @id @default(uuid()) @db.Uuid
  waMessageId  String           @unique @map("wa_message_id")   // dedupe de reintentos de Meta
  direction    MessageDirection
  phoneHash    String           @map("phone_hash") @db.VarChar(64)
  type         String           @db.VarChar(20)                 // text | audio | interactive | image | template
  status       String?          @db.VarChar(20)                 // sent | delivered | read | failed
  createdAt    DateTime         @default(now()) @map("created_at") @db.Timestamptz

  @@index([createdAt])
  @@map("whatsapp_messages")
}

// ───────────── Auditoría ─────────────

model AuditLog {
  id         String   @id @default(uuid()) @db.Uuid
  actorType  String   @map("actor_type") @db.VarChar(20)  // ADMIN | STAFF | SYSTEM | PARTICIPANT
  actorId    String?  @map("actor_id")
  action     String   @db.VarChar(80)                     // ej. "registration.manual_check_in"
  entityType String   @map("entity_type") @db.VarChar(40)
  entityId   String?  @map("entity_id")
  metadata   Json?
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz

  @@index([entityType, entityId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

## 4. Restricciones adicionales (migración SQL manual)

```sql
ALTER TABLE events      ADD CONSTRAINT chk_event_dates      CHECK (ends_at > starts_at);
ALTER TABLE events      ADD CONSTRAINT chk_event_capacity   CHECK (capacity > 0 AND attendance_goal >= 0);
ALTER TABLE events      ADD CONSTRAINT chk_overbooking      CHECK (overbooking_factor BETWEEN 1.0 AND 1.5);
ALTER TABLE activities  ADD CONSTRAINT chk_max_claims       CHECK (max_claims_per_user BETWEEN 1 AND 20);
ALTER TABLE interactions ADD CONSTRAINT chk_claim_number    CHECK (claim_number >= 1);
ALTER TABLE feedback    ADD CONSTRAINT chk_sentiment        CHECK (sentiment_score IS NULL OR sentiment_score BETWEEN 1 AND 5);
ALTER TABLE coupon_campaigns ADD CONSTRAINT chk_min_sentiment CHECK (min_sentiment BETWEEN 1 AND 5);

-- Búsqueda manual por últimos 4 dígitos (US-20)
CREATE INDEX idx_participants_phone_suffix ON participants (right(phone_number, 4));
-- Búsqueda de temas en feedback
CREATE INDEX idx_feedback_topics ON feedback USING GIN (key_topics);
```

> `claim_number <= max_claims_per_user` se valida en el dominio y con `SELECT … FOR UPDATE` (no se puede expresar como CHECK entre tablas).

## 5. Datos de semilla (`prisma/seed.ts`)
- 1 `SUPER_ADMIN` (`admin@local.test` / contraseña de `.env`).
- Productos: Coca-Cola Original 350ml, Coca-Cola Zero Azúcar 350ml, Coca-Cola Zero Vainilla 350ml, Sprite 350ml, Fanta 350ml.
- Eventos: `LOLLA26` (ACTIVE), `ZEROVAN26` (PUBLISHED), `FANFEST26` (COMPLETED con feedback sintético).
- 200 participantes con distribución realista de edad/ciudad, interacciones y feedback para poblar dashboards.
- Accesos de staff con PIN conocido para desarrollo (`123456`).
