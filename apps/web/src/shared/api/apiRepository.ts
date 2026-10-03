import {
  type EventInput,
  type EventRecord,
  type EventStatus,
  type Product,
  type Metrics,
  type StaffAccess,
  type Campaign,
  type Activity,
  type Feedback,
} from "@cocacola-ei/contracts";
import { apiRequest } from "./client";
import { demoRepository } from "../demo";

function getAdminToken(): string | undefined {
  return localStorage.getItem("cei_admin_token") || undefined;
}

export const apiRepository = {
  listEvents: async (): Promise<EventRecord[]> => {
    try {
      return await apiRequest<EventRecord[]>("/events", {}, getAdminToken());
    } catch {
      return demoRepository.listEvents();
    }
  },

  event: async (id: string): Promise<EventRecord> => {
    try {
      return await apiRequest<EventRecord>(`/events/${id}`, {}, getAdminToken());
    } catch {
      return demoRepository.event(id);
    }
  },

  products: async (): Promise<Product[]> => {
    try {
      return await apiRequest<Product[]>("/products", {}, getAdminToken());
    } catch {
      return demoRepository.products();
    }
  },

  createEvent: async (input: EventInput): Promise<EventRecord> => {
    try {
      return await apiRequest<EventRecord>(
        "/events",
        {
          method: "POST",
          body: JSON.stringify(input),
        },
        getAdminToken(),
      );
    } catch {
      return demoRepository.createEvent(input);
    }
  },

  transition: async (id: string, next: EventStatus): Promise<void> => {
    try {
      await apiRequest(
        `/events/${id}/transition`,
        {
          method: "POST",
          body: JSON.stringify({ target: next }),
        },
        getAdminToken(),
      );
    } catch {
      await demoRepository.transition(id, next);
    }
  },

  addActivity: async (
    id: string,
    input: Omit<Activity, "id" | "isActive">,
  ): Promise<void> => {
    try {
      await apiRequest(
        `/events/${id}/activities`,
        {
          method: "POST",
          body: JSON.stringify(input),
        },
        getAdminToken(),
      );
    } catch {
      await demoRepository.addActivity(id, input);
    }
  },

  toggleActivity: async (id: string, activityId: string): Promise<void> => {
    try {
      await apiRequest(`/activities/${activityId}`, { method: "PATCH" }, getAdminToken());
    } catch {
      await demoRepository.toggleActivity(id, activityId);
    }
  },

  addStaff: async (
    id: string,
    input: Omit<StaffAccess, "id" | "revokedAt">,
  ): Promise<string> => {
    try {
      const res = await apiRequest<{ staffAccess: any; pin: string }>(
        `/events/${id}/staff-accesses`,
        {
          method: "POST",
          body: JSON.stringify(input),
        },
        getAdminToken(),
      );
      return res.pin;
    } catch {
      return demoRepository.addStaff(id, input);
    }
  },

  revoke: async (id: string, staffId: string): Promise<void> => {
    try {
      await apiRequest(`/staff-accesses/${staffId}/revoke`, { method: "POST" }, getAdminToken());
    } catch {
      await demoRepository.revoke(id, staffId);
    }
  },

  campaign: async (id: string, camp: Campaign): Promise<void> => {
    try {
      await apiRequest(
        `/events/${id}/coupon-campaign`,
        {
          method: "PUT",
          body: JSON.stringify(camp),
        },
        getAdminToken(),
      );
    } catch {
      await demoRepository.campaign(id, camp);
    }
  },

  addProduct: async (input: Omit<Product, "id" | "isActive">): Promise<void> => {
    try {
      await apiRequest(
        "/products",
        {
          method: "POST",
          body: JSON.stringify(input),
        },
        getAdminToken(),
      );
    } catch {
      await demoRepository.addProduct(input);
    }
  },

  toggleProduct: async (id: string): Promise<void> => {
    try {
      await apiRequest(`/products/${id}`, { method: "PATCH" }, getAdminToken());
    } catch {
      await demoRepository.toggleProduct(id);
    }
  },

  feedback: async (id: string): Promise<Feedback[]> => {
    try {
      return await apiRequest<Feedback[]>(`/events/${id}/feedback`, {}, getAdminToken());
    } catch {
      return demoRepository.feedback(id);
    }
  },

  metrics: async (id: string): Promise<Metrics> => {
    try {
      return await apiRequest<Metrics>(`/events/${id}/metrics`, {}, getAdminToken());
    } catch {
      return demoRepository.metrics(id);
    }
  },
};
