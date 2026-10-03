import { LoaderCircle, SearchX, AlertCircle } from "lucide-react";
import { es } from "../i18n";
import { Button } from "./Button";
export function Loading() {
  return (
    <div className="empty-state" role="status">
      <LoaderCircle className="loading-spin" />
      {es.loading}
    </div>
  );
}
export function Empty({
  text = es.empty,
  hint = es.emptyHint,
}: {
  text?: string;
  hint?: string;
}) {
  return (
    <div className="empty-state">
      <SearchX size={30} />
      <h3>{text}</h3>
      <p>{hint}</p>
    </div>
  );
}
export function ErrorState({
  error,
  retry,
}: {
  error: Error | null;
  retry: () => void;
}) {
  return (
    <div className="empty-state" role="alert">
      <AlertCircle />
      <h3>{es.error}</h3>
      <p>{error?.message}</p>
      <Button onClick={retry}>{es.retry}</Button>
    </div>
  );
}
