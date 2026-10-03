import { describe, it, expect, beforeEach } from "vitest";
import { EventInputSchema, type ScanRequest } from "@cocacola-ei/contracts";
import { events } from "./seed";
import { assertTransition, DemoScanner } from "./index";
import { scanTone } from "../../features/scanning";
describe("Event rules", () => {
  it("BR-EVT-01: rejects an end before the start", () => {
    expect(
      EventInputSchema.safeParse({
        ...events[0],
        endsAt: "2020-01-01T00:00:00Z",
      }).success,
    ).toBe(false);
  });
  it("BR-EVT-02: rejects lowercase or short codes", () => {
    expect(
      EventInputSchema.safeParse({ ...events[0], publicCode: "a" }).success,
    ).toBe(false);
  });
  it("BR-EVT-03: cannot publish without active activities", () => {
    expect(() =>
      assertTransition(
        { ...events[0], status: "DRAFT", activities: [] },
        "PUBLISHED",
      ),
    ).toThrow("actividad");
  });
  it("BR-EVT-03: can publish a configured draft", () => {
    expect(() =>
      assertTransition({ ...events[0], status: "DRAFT" }, "PUBLISHED"),
    ).not.toThrow();
  });
  it("BR-EVT-04: cannot reactivate a completed event", () => {
    expect(() =>
      assertTransition({ ...events[0], status: "COMPLETED" }, "ACTIVE"),
    ).toThrow();
  });
});
describe("Demonstration scanner", () => {
  let scanner: DemoScanner;
  const event = events[0],
    staff = event.staff[0];
  const req = (overrides: Partial<ScanRequest> = {}): ScanRequest => ({
    qrToken: "DEMO-VALENTINA",
    clientScanId: crypto.randomUUID(),
    scannedAt: "2026-10-02T23:00:00Z",
    ...overrides,
  });
  beforeEach(() => (scanner = new DemoScanner()));
  it("BR-CHK-01: rejects unknown tokens", () =>
    expect(scanner.scan(req({ qrToken: "unknown" }), event, staff).code).toBe(
      "QR_INVALID",
    ));
  it("BR-CHK-03: rejects scanning outside ACTIVE", () =>
    expect(
      scanner.scan(req(), { ...event, status: "COMPLETED" }, staff).code,
    ).toBe("EVENT_NOT_ACTIVE"));
  it("BR-CHK-05: repeated check-in is a warning", () => {
    scanner.scan(req(), event, staff);
    const duplicate = scanner.scan(req(), event, staff);
    expect(duplicate.code).toBe("ALREADY_CHECKED_IN");
    expect(scanTone(duplicate.code)).toBe("warning");
  });
  it("BR-CHK-07: retry with same ID returns original response", () => {
    const r = req();
    expect(scanner.scan(r, event, staff)).toEqual(
      scanner.scan(r, event, staff),
    );
    expect(scanner.history).toHaveLength(1);
  });
  it("BR-SAM-02: sampling requires check-in", () =>
    expect(
      scanner.scan(
        req({ activityId: "stand-zero", productId: "zero" }),
        event,
        staff,
      ).code,
    ).toBe("NOT_CHECKED_IN"));
  it("BR-SAM-03: rejects activity outside staff scope", () =>
    expect(
      scanner.scan(
        req({ activityId: "stand-sprite", productId: "sprite" }),
        event,
        staff,
      ).code,
    ).toBe("ACTIVITY_NOT_ALLOWED"));
  it("BR-SAM-04: rejects a product from another activity", () => {
    scanner.scan(req(), event, staff);
    expect(
      scanner.scan(
        req({ activityId: "stand-zero", productId: "sprite" }),
        event,
        staff,
      ).code,
    ).toBe("PRODUCT_NOT_IN_ACTIVITY");
  });
  it("BR-SAM-05: approves first benefit and blocks repeated claims", () => {
    scanner.scan(req(), event, staff);
    expect(
      scanner.scan(
        req({ activityId: "stand-zero", productId: "zero" }),
        event,
        staff,
      ).code,
    ).toBe("SAMPLING_CLAIMED");
    expect(
      scanner.scan(
        req({ activityId: "stand-zero", productId: "zero" }),
        event,
        staff,
      ).code,
    ).toBe("BENEFIT_ALREADY_REDEEMED");
  });
  it("BR-STF-04: revoked staff cannot scan", () =>
    expect(
      scanner.scan(req(), event, {
        ...staff,
        revokedAt: "2026-10-02T23:00:00Z",
      }).code,
    ).toBe("ACTIVITY_NOT_ALLOWED"));
});
