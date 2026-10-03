import {
  EventInputSchema,
  type EventInput,
  type EventRecord,
  type EventStatus,
  type Product,
  type Metrics,
  type ScanRequest,
  type ScanResponse,
  type StaffAccess,
  type Campaign,
  type Activity,
} from "@cocacola-ei/contracts";
import * as seed from "./seed";
import { ApiError } from "../api";
type DemoState = {
  events: EventRecord[];
  products: Product[];
  metrics: Record<string, Metrics>;
  feedback: typeof seed.feedback;
};
const key = "cei-demo-v1";
function initial(): DemoState {
  return structuredClone({
    events: seed.events,
    products: seed.products,
    metrics: seed.metrics,
    feedback: seed.feedback,
  });
}
function restore(): DemoState {
  try {
    const saved = JSON.parse(
      localStorage.getItem(key) ?? "null",
    ) as DemoState | null;
    if (
      saved &&
      Array.isArray(saved.events) &&
      saved.events.every(
        (e) =>
          EventInputSchema.safeParse(e).success &&
          Array.isArray(e.activities) &&
          Array.isArray(e.staff),
      ) &&
      Array.isArray(saved.products) &&
      saved.metrics &&
      Array.isArray(saved.feedback)
    )
      return saved;
  } catch {
    /* demo storage may be unavailable */
  }
  return initial();
}
let state = restore();
const persist = () => {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* demo remains usable in memory */
  }
};
export const transitions: Record<EventStatus, EventStatus[]> = {
  DRAFT: ["PUBLISHED", "CANCELLED"],
  PUBLISHED: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};
export function assertTransition(event: EventRecord, next: EventStatus) {
  if (!transitions[event.status].includes(next))
    throw new ApiError("INVALID_STATE_TRANSITION");
  if (
    next === "PUBLISHED" &&
    (!event.activities.some((a) => a.isActive) || event.capacity <= 0)
  )
    throw new ApiError("EVENT_NOT_PUBLISHABLE");
} // BR-EVT-03
const getEvent = (id: string) => {
  const e = state.events.find((e) => e.id === id);
  if (!e) throw new ApiError("NOT_FOUND");
  return e;
};
const assertEditable = (e: EventRecord) => {
  if (["COMPLETED", "CANCELLED"].includes(e.status))
    throw new ApiError("EVENT_NOT_EDITABLE");
};
export const demoRepository = {
  listEvents: async () => structuredClone(state.events),
  event: async (id: string) => structuredClone(getEvent(id)),
  products: async () => structuredClone(state.products),
  createEvent: async (input: EventInput) => {
    const parsed = EventInputSchema.parse(input);
    if (state.events.some((e) => e.publicCode === parsed.publicCode))
      throw new ApiError("EVENT_CODE_TAKEN");
    const e: EventRecord = {
      ...parsed,
      id: crypto.randomUUID(),
      status: "DRAFT",
      activities: [],
      staff: [],
      campaign: null,
    };
    state.events.unshift(e);
    persist();
    return e;
  },
  transition: async (id: string, next: EventStatus) => {
    const e = getEvent(id);
    assertTransition(e, next);
    e.status = next;
    persist();
  },
  addActivity: async (id: string, input: Omit<Activity, "id" | "isActive">) => {
    const e = getEvent(id);
    assertEditable(e);
    if (
      !input.name.trim() ||
      input.maxClaimsPerUser < 1 ||
      input.maxClaimsPerUser > 20
    )
      throw new ApiError("VALIDATION_ERROR");
    e.activities.push({ ...input, id: crypto.randomUUID(), isActive: true });
    persist();
  },
  toggleActivity: async (id: string, activityId: string) => {
    const e = getEvent(id);
    assertEditable(e);
    const a = e.activities.find((a) => a.id === activityId);
    if (a) a.isActive = !a.isActive;
    persist();
  },
  addStaff: async (
    id: string,
    input: Omit<StaffAccess, "id" | "revokedAt">,
  ) => {
    const e = getEvent(id);
    assertEditable(e);
    e.staff.push({ ...input, id: crypto.randomUUID(), revokedAt: null });
    persist();
    return String(
      (crypto.getRandomValues(new Uint32Array(1))[0] % 900000) + 100000,
    );
  },
  revoke: async (id: string, staffId: string) => {
    const e = getEvent(id);
    assertEditable(e);
    const s = e.staff.find((s) => s.id === staffId);
    if (s) s.revokedAt = new Date().toISOString();
    persist();
  },
  campaign: async (id: string, campaign: Campaign) => {
    const e = getEvent(id);
    if (!["DRAFT", "PUBLISHED"].includes(e.status))
      throw new ApiError("EVENT_NOT_EDITABLE");
    e.campaign = campaign;
    persist();
  },
  addProduct: async (input: Omit<Product, "id" | "isActive">) => {
    if (state.products.some((p) => p.sku === input.sku))
      throw new ApiError("PRODUCT_SKU_TAKEN");
    state.products.push({ ...input, id: crypto.randomUUID(), isActive: true });
    persist();
  },
  toggleProduct: async (id: string) => {
    const p = state.products.find((p) => p.id === id);
    if (p) p.isActive = !p.isActive;
    persist();
  },
  feedback: async (id: string) =>
    structuredClone(state.feedback.filter((f) => f.eventId === id)),
  metrics: async (id: string): Promise<Metrics> =>
    structuredClone(
      state.metrics[id] ?? {
        registered: 0,
        attended: 0,
        attendanceGoal: getEvent(id).attendanceGoal,
        recurrentAttendees: 0,
        engagedAttendees: 0,
        blockedFraudAttempts: 0,
        claimsByProduct: [],
        feedback: {
          requested: 0,
          completed: 0,
          avgSentiment: null,
          purchaseIntentRate: null,
        },
        couponsIssued: 0,
        updatedAt: new Date().toISOString(),
      },
    ),
};
export { demoEventId } from "./seed";
export class DemoScanner {
  private attended = new Map<string, string>();
  private claims = new Map<string, number>();
  private requests = new Map<string, ScanResponse>();
  history: (ScanResponse & { id: string })[] = [];
  scan(
    request: ScanRequest,
    event: EventRecord,
    staff: StaffAccess,
  ): ScanResponse {
    if (this.requests.has(request.clientScanId))
      return this.requests.get(request.clientScanId)!; // BR-CHK-07
    let result: ScanResponse;
    const names: Record<string, string> = {
      "DEMO-VALENTINA": "Valentina",
      "DEMO-DIEGO": "Diego",
    };
    const name = names[request.qrToken];
    if (event.status !== "ACTIVE") result = { code: "EVENT_NOT_ACTIVE" };
    else if (staff.revokedAt) result = { code: "ACTIVITY_NOT_ALLOWED" };
    else if (!name) result = { code: "QR_INVALID" };
    else if (!request.activityId) {
      if (!staff.canCheckIn) result = { code: "ACTIVITY_NOT_ALLOWED" };
      else if (this.attended.has(request.qrToken))
        result = {
          code: "ALREADY_CHECKED_IN",
          firstName: name,
          at: this.attended.get(request.qrToken),
        };
      else {
        this.attended.set(request.qrToken, request.scannedAt);
        result = {
          code: "CHECK_IN_SUCCESS",
          firstName: name,
          at: request.scannedAt,
        };
      }
    } else {
      const activity = event.activities.find(
        (a) => a.id === request.activityId,
      );
      const claimKey = `${request.qrToken}:${request.activityId}`;
      const count = this.claims.get(claimKey) ?? 0;
      if (
        !activity?.isActive ||
        !staff.allowedActivityIds.includes(activity.id)
      )
        result = { code: "ACTIVITY_NOT_ALLOWED" }; // BR-SAM-03
      else if (!this.attended.has(request.qrToken))
        result = { code: "NOT_CHECKED_IN" }; // BR-SAM-02
      else if (
        activity.productIds.length &&
        !activity.productIds.includes(request.productId ?? "")
      )
        result = { code: "PRODUCT_NOT_IN_ACTIVITY" };
      else if (count >= activity.maxClaimsPerUser)
        result = { code: "BENEFIT_ALREADY_REDEEMED", firstName: name }; // BR-SAM-05 (demo only)
      else {
        this.claims.set(claimKey, count + 1);
        result = {
          code: "SAMPLING_CLAIMED",
          firstName: name,
          claimNumber: count + 1,
          maxClaims: activity.maxClaimsPerUser,
          product: state.products.find((p) => p.id === request.productId)?.name,
          at: request.scannedAt,
        };
      }
    }
    this.requests.set(request.clientScanId, result);
    this.history.unshift({ ...result, id: request.clientScanId });
    this.history = this.history.slice(0, 20);
    return result;
  }
  reset() {
    this.attended.clear();
    this.claims.clear();
    this.requests.clear();
    this.history = [];
  }
}
export const demoScanner = new DemoScanner();
