import { z } from "zod";
export const eventStatuses = [
  "DRAFT",
  "PUBLISHED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
] as const;
export type EventStatus = (typeof eventStatuses)[number];
export const eventTypes = [
  "FESTIVAL",
  "PRODUCT_LAUNCH",
  "SAMPLING",
  "SPORTS",
  "POP_UP",
  "OTHER",
] as const;
export const EventInputSchema = z
  .object({
    name: z.string().trim().min(3).max(200),
    publicCode: z.string().regex(/^[A-Z0-9]{4,12}$/),
    type: z.enum(eventTypes),
    location: z.string().trim().min(3),
    city: z.string().trim().min(2),
    timezone: z.string().default("America/Santiago"),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    capacity: z.number().int().positive(),
    attendanceGoal: z.number().int().min(0),
  })
  .refine((v) => Date.parse(v.endsAt) > Date.parse(v.startsAt), {
    path: ["endsAt"],
    message: "El fin debe ser posterior al inicio",
  }); // BR-EVT-01,02,06
export type EventInput = z.infer<typeof EventInputSchema>;
export interface Activity {
  id: string;
  name: string;
  category: "SAMPLING" | "PHOTO_BOOTH" | "OTHER";
  maxClaimsPerUser: number;
  isActive: boolean;
  productIds: string[];
}
export interface Product {
  id: string;
  sku: string;
  name: string;
  brandLine: string;
  isActive: boolean;
}
export interface StaffAccess {
  id: string;
  label: string;
  canCheckIn: boolean;
  allowedActivityIds: string[];
  revokedAt: string | null;
}
export interface Campaign {
  codePrefix: string;
  discountLabel: string;
  policy: "MIN_SENTIMENT" | "ANY_VALID_FEEDBACK";
  minSentiment: number;
  expiresAt: string;
}
export interface EventRecord extends EventInput {
  id: string;
  status: EventStatus;
  activities: Activity[];
  staff: StaffAccess[];
  campaign: Campaign | null;
}
export interface Metrics {
  registered: number;
  attended: number;
  attendanceGoal: number;
  recurrentAttendees: number;
  engagedAttendees: number;
  blockedFraudAttempts: number;
  claimsByProduct: { productId: string; name: string; claims: number }[];
  feedback: {
    requested: number;
    completed: number;
    avgSentiment: number | null;
    purchaseIntentRate: number | null;
  };
  couponsIssued: number;
  updatedAt: string;
}
export interface Feedback {
  id: string;
  eventId: string;
  status: "COMPLETED" | "FAILED";
  participant: { firstName: string; city: string; ageRange: string };
  inputType: "AUDIO" | "TEXT";
  transcription: string | null;
  sentimentScore: number | null;
  purchaseIntent: boolean | null;
  keyTopics: string[];
  productId: string;
  receivedAt: string;
}
export type ScanCode =
  | "CHECK_IN_SUCCESS"
  | "SAMPLING_CLAIMED"
  | "ALREADY_CHECKED_IN"
  | "NOT_CHECKED_IN"
  | "BENEFIT_ALREADY_REDEEMED"
  | "QR_INVALID"
  | "QR_WRONG_EVENT"
  | "REGISTRATION_CANCELLED"
  | "EVENT_NOT_ACTIVE"
  | "ACTIVITY_NOT_ALLOWED"
  | "PRODUCT_NOT_IN_ACTIVITY";
export interface ScanResponse {
  code: ScanCode;
  firstName?: string;
  at?: string;
  product?: string;
  claimNumber?: number;
  maxClaims?: number;
}
export interface ScanRequest {
  qrToken: string;
  clientScanId: string;
  scannedAt: string;
  activityId?: string;
  productId?: string;
}
export interface ApiEnvelope<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  details?: Record<string, unknown>;
}
export const errorMessages: Record<string, string> = {
  CHECK_IN_SUCCESS: "Ingreso aprobado",
  SAMPLING_CLAIMED: "Entrega aprobada",
  ALREADY_CHECKED_IN: "Asistencia ya registrada",
  NOT_CHECKED_IN: "Debe pasar primero por el acceso",
  BENEFIT_ALREADY_REDEEMED: "Beneficio ya canjeado",
  QR_INVALID: "Código no reconocido",
  QR_WRONG_EVENT: "Este pase es de otro evento",
  REGISTRATION_CANCELLED: "Inscripción cancelada",
  EVENT_NOT_ACTIVE: "El evento no está activo",
  ACTIVITY_NOT_ALLOWED: "Actividad no habilitada para este acceso",
  PRODUCT_NOT_IN_ACTIVITY: "Producto no disponible en esta actividad",
  EVENT_CODE_TAKEN: "El código de evento ya existe",
  EVENT_NOT_PUBLISHABLE:
    "Agrega al menos una actividad activa antes de publicar",
  INVALID_STATE_TRANSITION: "Transición de estado no permitida",
  PRODUCT_SKU_TAKEN: "El SKU ya existe",
  STAFF_ACCESS_REVOKED: "Acceso revocado",
  NETWORK_ERROR: "No se pudo conectar. Reintenta cuando tengas conexión.",
  UNAUTHENTICATED: "La sesión expiró. Vuelve a iniciar sesión.",
  INTERNAL_ERROR: "No se pudo completar la operación",
};
