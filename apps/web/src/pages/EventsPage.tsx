import { uiText } from "../shared/i18n";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, ArrowUpRight, MapPin, CalendarDays } from "lucide-react";
import { eventStatuses } from "@cocacola-ei/contracts";
import { useEvents } from "../features/event-management";
import { CreateEvent } from "../features/event-management";
import { Button, Loading, Empty, ErrorState } from "../shared/ui";
import { StatusBadge } from "../entities/event";
import { es } from "../shared/i18n";
import { date, number } from "../shared/lib";
export default function EventsPage() {
  const { data: events, isLoading, error, refetch } = useEvents();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const visible = events?.filter(
    (e) =>
      (!status || e.status === status) &&
      `${e.name} ${e.publicCode} ${e.city}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>{uiText.eventsPage1}</h1>
          <p>{uiText.eventsPage2}</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={18} />
          {es.createEvent}
        </Button>
      </div>
      <div className="events-summary">
        <strong>{events?.length ?? "—"}</strong>
        <span>{uiText.eventsPage3}</span>
        <div />
        <strong>
          {events?.filter((e) => e.status === "ACTIVE").length ?? "—"}
        </strong>
        <span>{uiText.eventsPage4}</span>
      </div>
      <div className="filter-row">
        <div className="search-input">
          <Search size={18} />
          <input
            aria-label={es.search}
            placeholder={uiText.eventsPage5}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          aria-label={uiText.eventsPage6}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{uiText.eventsPage7}</option>
          {eventStatuses.map((s) => (
            <option key={s} value={s}>
              {es.states[s]}
            </option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} retry={refetch} />
      ) : visible?.length ? (
        <div className="event-grid">
          {visible.map((e, i) => (
            <article className="event-card" key={e.id}>
              <div className={`event-art art-${e.type.toLowerCase()}`}>
                <span>{es.types[e.type]}</span>
                <strong>
                  {e.type === "FESTIVAL"
                    ? uiText.eventsPage8
                    : e.type === "SPORTS"
                      ? uiText.eventsPage9
                      : e.type === "PRODUCT_LAUNCH"
                        ? uiText.eventsPage10
                        : uiText.eventsPage11}
                </strong>
                <svg viewBox="0 0 400 120" aria-hidden="true">
                  <path
                    d={
                      i % 2
                        ? "M-40 100Q160-140 440 80"
                        : "M-40 40Q180 230 440-20"
                    }
                  />
                </svg>
              </div>
              <div className="event-card-body">
                <StatusBadge status={e.status} />
                <h2>
                  <Link to={`/admin/events/${e.id}`}>{e.name}</Link>
                </h2>
                <p>
                  <CalendarDays size={15} />
                  {date(e.startsAt, e.timezone)}
                </p>
                <p>
                  <MapPin size={15} />
                  {e.location}, {e.city}
                </p>
                <div className="event-card-footer">
                  <span>
                    <strong>{number(e.capacity)}</strong>
                    {uiText.eventsPage14}
                  </span>
                  <Link
                    aria-label={`Ver ${e.name}`}
                    to={`/admin/events/${e.id}/live`}
                    className="icon-link"
                  >
                    <ArrowUpRight size={23} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty />
      )}
      <CreateEvent open={open} onOpenChange={setOpen} />
    </>
  );
}
