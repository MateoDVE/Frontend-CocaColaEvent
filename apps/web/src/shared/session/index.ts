import { create } from "zustand";
type Session = {
  adminDemo: boolean;
  staffDemo: boolean;
  startAdmin: () => void;
  startStaff: () => void;
  logout: () => void;
  endStaff: () => void;
};
export const useSession = create<Session>((set) => ({
  adminDemo: false,
  staffDemo: false,
  startAdmin: () => set({ adminDemo: true }),
  startStaff: () => set({ staffDemo: true }),
  logout: () => set({ adminDemo: false }),
  endStaff: () => set({ staffDemo: false }),
}));
