import type { EventStatus } from "@cocacola-ei/contracts";
import { es } from "../../shared/i18n";
export function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <span />
      {es.states[status]}
    </span>
  );
}
