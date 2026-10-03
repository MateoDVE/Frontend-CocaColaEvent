import { uiText } from "../shared/i18n";
import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Plus,
  MapPin,
  CalendarDays,
  Users,
  Ticket,
  ShieldCheck,
  Package,
} from "lucide-react";
import type { EventStatus, Campaign } from "@cocacola-ei/contracts";
import { useEvent, useDemoMutation } from "../features/event-management";
import { useProducts } from "../features/catalog";
import { transitions } from "../shared/demo";
import { apiRepository } from "../shared/api";
import { StatusBadge } from "../entities/event";
import { Button, Modal, Loading, ErrorState } from "../shared/ui";
import { es } from "../shared/i18n";
import { date, number } from "../shared/lib";
export default function EventDetailPage() {
  const { id = "" } = useParams();
  const query = useEvent(id);
  const { data: products = [] } = useProducts();
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState<"activity" | "staff" | null>(null);
  const [target, setTarget] = useState<EventStatus | null>(null);
  const [pin, setPin] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const mutation = useDemoMutation(async (action: () => Promise<unknown>) =>
    action(),
  );
  async function act(action: () => Promise<unknown>) {
    setNotice("");
    try {
      await mutation.mutateAsync(action);
      setForm(null);
      setTarget(null);
      setNotice(es.saved);
    } catch {
      /* mutation exposes typed error */
    }
  }
  if (query.isLoading) return <Loading />;
  if (query.error)
    return <ErrorState error={query.error} retry={query.refetch} />;
  if (!query.data) return null;
  const e = query.data;
  const editable = !["COMPLETED", "CANCELLED"].includes(e.status);
  const labels: Partial<Record<EventStatus, string>> = {
    PUBLISHED: es.detail.publish,
    ACTIVE: es.detail.start,
    COMPLETED: es.detail.complete,
    CANCELLED: es.detail.cancel,
  };
  function addActivity(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    void act(() =>
      apiRepository.addActivity(id, {
        name: String(f.get("name")),
        category: f.get("category") as "SAMPLING" | "PHOTO_BOOTH",
        maxClaimsPerUser: Number(f.get("max")),
        productIds: f.getAll("products").map(String),
      }),
    );
  }
  function addStaff(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    void act(async () => {
      const p = await apiRepository.addStaff(id, {
        label: String(f.get("label")),
        canCheckIn: f.has("checkIn"),
        allowedActivityIds: f.getAll("activities").map(String),
      });
      setPin(p);
    });
  }
  return (
    <>
      <Link className="back-link" to="/admin/events">
        <ArrowLeft size={16} />
        {es.events}
      </Link>
      <div className="page-heading">
        <div>
          <StatusBadge status={e.status} />
          <h1 className="mt-3">{e.name}</h1>
          <p>
            #{e.publicCode} · {es.types[e.type]}
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link to={`/admin/events/${id}/live`}>
            {es.overview}
            <ArrowUpRight size={18} />
          </Link>
        </Button>
      </div>
      <div className="tabs" role="tablist" aria-label={uiText.eventDetailPage1}>
        {es.detail.tabs.map((t, i) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === i}
            aria-controls={`panel-${i}`}
            id={`tab-${i}`}
            onClick={() => {
              setTab(i);
              setNotice("");
              mutation.reset();
            }}
          >
            {t}
            {i === 1 && <span>{e.activities.length}</span>}
            {i === 2 && <span>{e.staff.length}</span>}
          </button>
        ))}
      </div>
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      {mutation.error && (
        <p className="form-error" role="alert">
          {mutation.error.message}
        </p>
      )}
      {!editable && <p className="notice">{es.detail.readOnly}</p>}
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 0 && (
          <div className="detail-grid">
            <section className="panel">
              <h2>{es.detail.dates}</h2>
              <div className="detail-line">
                <MapPin />
                <div>
                  <strong>{e.location}</strong>
                  <p>{e.city}</p>
                </div>
              </div>
              <div className="detail-line">
                <CalendarDays />
                <div>
                  <strong>
                    {date(e.startsAt, e.timezone)} —{" "}
                    {date(e.endsAt, e.timezone)}
                  </strong>
                  <p>{e.timezone}</p>
                </div>
              </div>
              <div className="detail-numbers">
                <div>
                  <span>{es.form.capacity}</span>
                  <strong>{number(e.capacity)}</strong>
                </div>
                <div>
                  <span>{es.form.goal}</span>
                  <strong>{number(e.attendanceGoal)}</strong>
                </div>
              </div>
              <h3>{es.detail.policies}</h3>
              <p className="muted mt-2">{es.detail.defaultPolicies}</p>
            </section>
            <section className="panel">
              <h2>{uiText.eventDetailPage3}</h2>
              <div className="lifecycle">
                {(
                  ["DRAFT", "PUBLISHED", "ACTIVE", "COMPLETED"] as EventStatus[]
                ).map((s) => (
                  <div className={e.status === s ? "current" : ""} key={s}>
                    <span />
                    {es.states[s]}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {transitions[e.status].map((s) => (
                  <Button
                    key={s}
                    variant={s === "CANCELLED" ? "secondary" : "primary"}
                    onClick={() => setTarget(s)}
                  >
                    {labels[s]}
                  </Button>
                ))}
              </div>
            </section>
          </div>
        )}
        {tab === 1 && (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>{uiText.eventDetailPage4}</h2>
                <p>
                  {e.activities.length}
                  {uiText.eventDetailPage5}
                </p>
              </div>
              {editable && (
                <Button
                  onClick={() => {
                    mutation.reset();
                    setForm("activity");
                  }}
                >
                  <Plus size={17} />
                  {es.form.addActivity}
                </Button>
              )}
            </div>
            {e.activities.map((a) => (
              <div className="management-row" key={a.id}>
                <span className="square-icon">
                  <Package />
                </span>
                <div>
                  <strong>{a.name}</strong>
                  <p>
                    {a.maxClaimsPerUser}
                    {uiText.eventDetailPage6}{" "}
                    {a.productIds
                      .map((p) => products.find((x) => x.id === p)?.name)
                      .join(", ") || uiText.eventDetailPage8}
                  </p>
                </div>
                <span
                  className={`status-badge ${a.isActive ? "status-active" : "status-draft"}`}
                >
                  {a.isActive ? es.detail.active : es.detail.inactive}
                </span>
                {editable && (
                  <Button
                    variant="ghost"
                    disabled={mutation.isPending}
                    onClick={() =>
                      void act(() => apiRepository.toggleActivity(id, a.id))
                    }
                  >
                    {a.isActive ? es.detail.deactivate : es.detail.activate}
                  </Button>
                )}
              </div>
            ))}
            {!e.activities.length && (
              <p className="empty-state">{es.detail.noActivities}</p>
            )}
          </section>
        )}
        {tab === 2 && (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>{uiText.eventDetailPage9}</h2>
                <p>{uiText.eventDetailPage10}</p>
              </div>
              {editable && (
                <Button
                  onClick={() => {
                    mutation.reset();
                    setForm("staff");
                  }}
                >
                  <Plus size={17} />
                  {es.form.addStaff}
                </Button>
              )}
            </div>
            {e.staff.map((s) => (
              <div className="management-row" key={s.id}>
                <span className="square-icon">
                  <Users />
                </span>
                <div>
                  <strong>{s.label}</strong>
                  <p>
                    {s.canCheckIn ? uiText.eventDetailPage11 : ""}
                    {s.allowedActivityIds
                      .map((a) => e.activities.find((x) => x.id === a)?.name)
                      .join(", ")}
                  </p>
                </div>
                <span className="small-label">
                  {s.revokedAt ? "Revocado" : "Activo"}
                </span>
                {editable && !s.revokedAt && (
                  <Button
                    variant="secondary"
                    disabled={mutation.isPending}
                    onClick={() =>
                      void act(() => apiRepository.revoke(id, s.id))
                    }
                  >
                    {es.form.revoke}
                  </Button>
                )}
              </div>
            ))}
            {!e.staff.length && (
              <p className="empty-state">{es.detail.noStaff}</p>
            )}
          </section>
        )}
        {tab === 3 && (
          <section className="panel campaign-panel">
            <div className="panel-heading">
              <div>
                <h2>{uiText.eventDetailPage12}</h2>
                <p>{es.detail.campaignNote}</p>
              </div>
              <Ticket size={28} />
            </div>
            <form
              className="form-grid"
              key={e.campaign?.codePrefix ?? "new"}
              onSubmit={(ev) => {
                ev.preventDefault();
                const f = new FormData(ev.currentTarget);
                void act(() =>
                  apiRepository.campaign(id, {
                    codePrefix: String(f.get("prefix")),
                    discountLabel: String(f.get("discount")),
                    policy: f.get("policy") as Campaign["policy"],
                    minSentiment: Number(f.get("min")),
                    expiresAt: new Date(
                      String(f.get("expires")) + "T23:59:00",
                    ).toISOString(),
                  }),
                );
              }}
            >
              <label className="col-span-full">
                {es.form.discount}
                <input
                  name="discount"
                  required
                  defaultValue={e.campaign?.discountLabel}
                  disabled={!["DRAFT", "PUBLISHED"].includes(e.status)}
                />
              </label>
              <label>
                {es.form.prefix}
                <input
                  name="prefix"
                  pattern="[A-Z0-9]{2,10}"
                  maxLength={10}
                  required
                  defaultValue={e.campaign?.codePrefix}
                  disabled={!["DRAFT", "PUBLISHED"].includes(e.status)}
                />
              </label>
              <label>
                {es.form.expires}
                <input
                  name="expires"
                  type="date"
                  required
                  defaultValue={e.campaign?.expiresAt.slice(0, 10)}
                  disabled={!["DRAFT", "PUBLISHED"].includes(e.status)}
                />
              </label>
              <label>
                {es.form.policy}
                <select
                  name="policy"
                  defaultValue={e.campaign?.policy ?? "MIN_SENTIMENT"}
                  disabled={!["DRAFT", "PUBLISHED"].includes(e.status)}
                >
                  <option value="MIN_SENTIMENT">{es.form.minSentiment}</option>
                  <option value="ANY_VALID_FEEDBACK">
                    {es.form.anyFeedback}
                  </option>
                </select>
              </label>
              <label>
                {es.form.minScore}
                <input
                  name="min"
                  type="number"
                  min={1}
                  max={5}
                  defaultValue={e.campaign?.minSentiment ?? 3}
                  disabled={!["DRAFT", "PUBLISHED"].includes(e.status)}
                />
              </label>
              {["DRAFT", "PUBLISHED"].includes(e.status) && (
                <Button disabled={mutation.isPending}>{es.save}</Button>
              )}
            </form>
          </section>
        )}
      </div>
      <Modal
        open={form !== null}
        onOpenChange={(v) => {
          if (!v) setForm(null);
        }}
        title={form === "activity" ? es.form.addActivity : es.form.addStaff}
        description={
          form === "activity"
            ? uiText.eventDetailPage13
            : uiText.eventDetailPage14
        }
      >
        <form
          className="form-grid"
          onSubmit={form === "activity" ? addActivity : addStaff}
        >
          {form === "activity" ? (
            <>
              <label className="col-span-full">
                {es.form.activityName}
                <input name="name" required minLength={2} maxLength={150} />
              </label>
              <label>
                {uiText.eventDetailPage15}
                <select name="category">
                  <option value="SAMPLING">{uiText.eventDetailPage16}</option>
                  <option value="PHOTO_BOOTH">
                    {uiText.eventDetailPage17}
                  </option>
                </select>
              </label>
              <label>
                {es.form.maxClaims}
                <input
                  name="max"
                  type="number"
                  required
                  min={1}
                  max={20}
                  defaultValue={1}
                />
              </label>
              <fieldset className="col-span-full">
                <legend>{es.products}</legend>
                {products
                  .filter((p) => p.isActive)
                  .map((p) => (
                    <label className="check-label" key={p.id}>
                      <input type="checkbox" name="products" value={p.id} />
                      {p.name}
                    </label>
                  ))}
              </fieldset>
            </>
          ) : (
            <>
              <label className="col-span-full">
                {es.form.label}
                <input name="label" required minLength={2} />
              </label>
              <label className="check-label col-span-full">
                <input type="checkbox" name="checkIn" defaultChecked />
                {uiText.eventDetailPage18}
              </label>
              <fieldset className="col-span-full">
                <legend>{uiText.eventDetailPage19}</legend>
                {e.activities
                  .filter((a) => a.isActive)
                  .map((a) => (
                    <label className="check-label" key={a.id}>
                      <input type="checkbox" name="activities" value={a.id} />
                      {a.name}
                    </label>
                  ))}
              </fieldset>
            </>
          )}
          {mutation.error && (
            <p className="form-error col-span-full" role="alert">
              {mutation.error.message}
            </p>
          )}
          <Button className="col-span-full" disabled={mutation.isPending}>
            {es.save}
          </Button>
        </form>
      </Modal>
      <Modal
        open={target !== null}
        onOpenChange={(v) => {
          if (!v) setTarget(null);
        }}
        title={es.detail.confirm}
        description={es.detail.confirmHint}
      >
        <p className="mb-5">
          {target && labels[target]}: <strong>{e.name}</strong>
        </p>
        {mutation.error && (
          <p role="alert" className="form-error">
            {mutation.error.message}
          </p>
        )}
        <Button
          disabled={mutation.isPending}
          onClick={() =>
            target && void act(() => apiRepository.transition(id, target))
          }
        >
          {uiText.eventDetailPage20}
        </Button>
      </Modal>
      <Modal
        open={pin !== null}
        onOpenChange={(v) => {
          if (!v) setPin(null);
        }}
        title={uiText.eventDetailPage21}
        description={es.form.pinOnce}
      >
        <div className="pin-display">
          <ShieldCheck />
          {pin}
        </div>
        <Button onClick={() => setPin(null)}>{es.close}</Button>
      </Modal>
    </>
  );
}
