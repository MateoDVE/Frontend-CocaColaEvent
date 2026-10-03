import { create } from "zustand";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface StaffContext {
  event: {
    id: string;
    name: string;
    publicCode: string;
    status: string;
  };
  staffAccess: {
    id: string;
    label: string;
    canCheckIn: boolean;
    allowedActivityIds: string[];
  };
  activities: {
    id: string;
    name: string;
    category: string;
    maxClaimsPerUser: number;
  }[];
}

type Session = {
  adminDemo: boolean;
  staffDemo: boolean;
  adminToken: string | null;
  staffToken: string | null;
  adminUser: AdminUser | null;
  staffContext: StaffContext | null;
  setAdminSession: (token: string, user?: AdminUser) => void;
  setStaffSession: (token: string, context?: StaffContext) => void;
  startAdmin: () => void;
  startStaff: () => void;
  logout: () => void;
  endStaff: () => void;
};

const savedAdminToken = localStorage.getItem("cei_admin_token");
const savedStaffToken = localStorage.getItem("cei_staff_token");

export const useSession = create<Session>((set) => ({
  adminDemo: !!savedAdminToken || false,
  staffDemo: !!savedStaffToken || false,
  adminToken: savedAdminToken || null,
  staffToken: savedStaffToken || null,
  adminUser: null,
  staffContext: null,

  setAdminSession: (token: string, user?: AdminUser) => {
    localStorage.setItem("cei_admin_token", token);
    set({ adminToken: token, adminUser: user || null, adminDemo: true });
  },

  setStaffSession: (token: string, context?: StaffContext) => {
    localStorage.setItem("cei_staff_token", token);
    set({ staffToken: token, staffContext: context || null, staffDemo: true });
  },

  startAdmin: () => set({ adminDemo: true }),
  startStaff: () => set({ staffDemo: true }),

  logout: () => {
    localStorage.removeItem("cei_admin_token");
    set({ adminDemo: false, adminToken: null, adminUser: null });
  },

  endStaff: () => {
    localStorage.removeItem("cei_staff_token");
    set({ staffDemo: false, staffToken: null, staffContext: null });
  },
}));
