import { useEffect, useState } from "react";
import type { ScanCode } from "@cocacola-ei/contracts";
export { Camera } from "./Camera";
export function scanTone(code: ScanCode): "success" | "warning" | "danger" {
  if (["CHECK_IN_SUCCESS", "SAMPLING_CLAIMED"].includes(code)) return "success";
  if (["ALREADY_CHECKED_IN", "NOT_CHECKED_IN"].includes(code)) return "warning";
  return "danger";
}
export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}
