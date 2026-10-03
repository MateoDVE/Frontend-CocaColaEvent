import { BrandLogo } from "../shared/ui/BrandLogo";
import { uiText } from "../shared/i18n";
import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  ScanLine,
  Package,
  ArrowRight,
  ArrowLeft,
  History,
  LogOut,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { errorMessages, type ScanResponse } from "@cocacola-ei/contracts";
import { useSession } from "../shared/session";
import { useEvent } from "../features/event-management";
import { useProducts } from "../features/catalog";
import { scanTone, useOnline } from "../features/scanning";
import { Camera } from "../features/scanning";
import { demoEventId, demoScanner } from "../shared/demo";
import { Button, Loading, ErrorState } from "../shared/ui";
import { es } from "../shared/i18n";
import { apiRequest } from "../shared/api";
import { time } from "../shared/lib";
export default function StaffPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const session = useSession();
  const online = useOnline();
  const query = useEvent(demoEventId);
  const { data: products = [] } = useProducts();
  const [loginError, setLoginError] = useState(false);
  const [token, setToken] = useState("");
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [product, setProduct] = useState(params.get("product") ?? "");
  const login = location.pathname.endsWith("login");
  const activityId = params.get("activity") ?? undefined;
  const activity = query.data?.activities.find((a) => a.id === activityId);
  const staff = query.data?.staff.find((s) => s.id === "demo-staff");
  const allowed =
    !!staff &&
    !staff.revokedAt &&
    (activityId
      ? !!activity?.isActive && staff.allowedActivityIds.includes(activityId)
      : staff.canCheckIn);
  async function validate(value: string) {
    if (!online || !allowed || !query.data || !staff || result) return;
    const qrToken = value.trim();
    const clientScanId = crypto.randomUUID();
    const scannedAt = new Date().toISOString();

    let r: ScanResponse;
    try {
      if (activityId) {
        r = await apiRequest<ScanResponse>(
          "/scan/sampling",
          {
            method: "POST",
            body: JSON.stringify({
              qrToken,
              activityId,
              productId: product || undefined,
              clientScanId,
              scannedAt,
            }),
          },
          session.staffToken || undefined,
        );
      } else {
        r = await apiRequest<ScanResponse>(
          "/scan/check-in",
          {
            method: "POST",
            body: JSON.stringify({
              qrToken,
              clientScanId,
              scannedAt,
            }),
          },
          session.staffToken || undefined,
        );
      }
    } catch {
      r = demoScanner.scan(
        {
          qrToken,
          clientScanId,
          scannedAt,
          activityId,
          productId: product || undefined,
        },
        query.data,
        staff,
      );
    }

    setResult(r);
    navigator.vibrate?.(
      scanTone(r.code) === "success"
        ? 100
        : scanTone(r.code) === "warning"
          ? [150, 100, 150]
          : 500,
    );
    setToken("");
  }
  if (login)
    return (
      <main className="staff-login">
        <Link className="back-link" to="/admin/login">
          <ArrowLeft size={16} />
          {uiText.staffPage1}
        </Link>
        <BrandLogo />
        <span className="demo-chip">{uiText.staffPage2}</span>
        <h1>{es.login.staffTitle}</h1>
        <p>{es.staffPage.demoWarning}</p>
        <form
          className="panel"
          onSubmit={async (ev) => {
            ev.preventDefault();
            const f = new FormData(ev.currentTarget);
            const code = String(f.get("code") || "").trim().toUpperCase();
            const pin = String(f.get("pin") || "").trim();

            try {
              const res = await apiRequest<{
                staffToken: string;
                event: any;
                staffAccess: any;
                activities: any[];
              }>("/auth/staff/login", {
                method: "POST",
                body: JSON.stringify({ eventCode: code, pin }),
              });

              session.setStaffSession(res.staffToken, res);
              navigate("/staff/mode");
            } catch {
              if (code === "LOLLA26" && pin === "123456") {
                session.startStaff();
                navigate("/staff/mode");
              } else {
                setLoginError(true);
              }
            }
          }}
        >
          <label>
            {es.login.eventCode}
            <input
              name="code"
              autoCapitalize="characters"
              placeholder={uiText.staffPage3}
              required
            />
          </label>
          <label className="mt-4">
            {es.login.pin}
            <input
              type="password"
              inputMode="numeric"
              name="pin"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder={uiText.staffPage4}
              required
            />
          </label>
          {loginError && (
            <p className="form-error" role="alert">
              {es.login.invalid}
            </p>
          )}
          <Button className="w-full mt-6">
            {es.login.enter}
            <ArrowRight size={17} />
          </Button>
          <p className="form-help mt-4">{es.login.credentials}</p>
        </form>
      </main>
    );
  if (query.isLoading) return <Loading />;
  if (query.error)
    return <ErrorState error={query.error} retry={query.refetch} />;
  return (
    <div className="staff-shell">
      <header className="staff-header">
        <Link to="/staff/mode">
          <BrandLogo />
        </Link>
        <span className={`connection ${online ? "" : "is-offline"}`}>
          {online ? <Wifi size={16} /> : <WifiOff size={16} />}{" "}
          {online ? es.staffPage.online : es.staffPage.offline}
        </span>
      </header>
      <main className="staff-main">
        <div className="staff-context">
          <span className="demo-chip">{uiText.staffPage2}</span>
          <strong>{query.data?.name}</strong>
          <small>{staff?.label}</small>
        </div>
        {location.pathname.endsWith("mode") ? (
          <>
            <h1>{es.staffPage.choose}</h1>
            {staff?.revokedAt ? (
              <p role="alert" className="form-error">
                {errorMessages.STAFF_ACCESS_REVOKED}
              </p>
            ) : (
              <div className="mode-list">
                {staff?.canCheckIn && (
                  <Link className="mode-card" to="/staff/scan">
                    <span className="mode-icon">
                      <ScanLine size={30} />
                    </span>
                    <div>
                      <h2>{es.staffPage.checkIn}</h2>
                      <p>{es.staffPage.checkInHint}</p>
                    </div>
                    <ArrowRight />
                  </Link>
                )}
                {query.data?.activities
                  .filter(
                    (a) =>
                      a.isActive && staff?.allowedActivityIds.includes(a.id),
                  )
                  .map((a) => (
                    <Link
                      className="mode-card"
                      key={a.id}
                      to={`/staff/scan?activity=${a.id}&product=${a.productIds[0] ?? ""}`}
                    >
                      <span className="mode-icon">
                        <Package size={28} />
                      </span>
                      <div>
                        <h2>{a.name}</h2>
                        <p>
                          {a.maxClaimsPerUser}
                          {uiText.staffPage5}
                        </p>
                      </div>
                      <ArrowRight />
                    </Link>
                  ))}
              </div>
            )}
          </>
        ) : location.pathname.endsWith("history") ? (
          <>
            <h1>{es.staffPage.history}</h1>
            {demoScanner.history.length ? (
              demoScanner.history.map((h) => (
                <div className={`history-row ${scanTone(h.code)}`} key={h.id}>
                  <strong>{errorMessages[h.code]}</strong>
                  <span>
                    {h.firstName}
                    {h.at ? ` · ${time(h.at)}` : ""}
                  </span>
                </div>
              ))
            ) : (
              <p className="empty-state">{es.staffPage.noHistory}</p>
            )}
          </>
        ) : (
          <>
            <Link className="back-link" to="/staff/mode">
              <ArrowLeft size={16} />
              {uiText.staffPage6}
            </Link>
            <h1>{activity?.name ?? es.staffPage.checkIn}</h1>
            {!allowed ? (
              <p role="alert" className="form-error">
                {es.staffPage.noPermission}
              </p>
            ) : (
              <>
                {activity && activity.productIds.length > 0 && (
                  <label className="mb-5">
                    {es.staffPage.product}
                    <select
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                    >
                      {activity.productIds.map((id) => (
                        <option key={id} value={id}>
                          {products.find((p) => p.id === id)?.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {!online && (
                  <p className="offline-notice" role="alert">
                    {activityId
                      ? es.staffPage.blocked
                      : es.staffPage.offlineCheckIn}
                  </p>
                )}
                <Camera onDetected={validate} paused={!!result || !online} />
                <form
                  className="manual-scan"
                  onSubmit={(e) => {
                    e.preventDefault();
                    validate(token);
                  }}
                >
                  <label>
                    {es.staffPage.token}
                    <input
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder={uiText.staffPage7}
                      required
                      autoComplete="off"
                    />
                  </label>
                  <p className="form-help">{es.staffPage.sampleToken}</p>
                  <Button
                    className="w-full"
                    disabled={
                      !online ||
                      !!result ||
                      !token ||
                      (!!activity?.productIds.length && !product)
                    }
                  >
                    {es.staffPage.validate}
                  </Button>
                </form>
              </>
            )}
          </>
        )}
        <p className="staff-disclaimer">{es.staffPage.demoWarning}</p>
      </main>
      <nav className="staff-nav" aria-label={uiText.staffPage8}>
        <Link to="/staff/mode">
          <ScanLine />
          {es.staffPage.scan}
        </Link>
        <Link to="/staff/history">
          <History />
          {es.staffPage.history}
        </Link>
        <button
          onClick={() => {
            session.endStaff();
            demoScanner.reset();
            navigate("/staff/login");
          }}
        >
          <LogOut />
          {es.staffPage.end}
        </button>
      </nav>
      {result && (
        <div
          className={`scan-result result-${scanTone(result.code)}`}
          role="alert"
        >
          <div>
            {scanTone(result.code) === "success" ? (
              <CheckCircle2 size={80} />
            ) : scanTone(result.code) === "warning" ? (
              <AlertTriangle size={80} />
            ) : (
              <XCircle size={80} />
            )}
            <h2>{errorMessages[result.code]}</h2>
            <p>{result.firstName}</p>
            {result.product && (
              <p>
                {result.product}
                <br />
                {result.claimNumber}
                {uiText.staffPage9}
                {result.maxClaims}
              </p>
            )}
            {result.at && <p>{time(result.at)}</p>}
            <span className="result-demo">{uiText.staffPage10}</span>
            <Button variant="secondary" onClick={() => setResult(null)}>
              {es.staffPage.next}
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
