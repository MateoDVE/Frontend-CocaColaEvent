import { uiText } from "../shared/i18n";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Users,
  ScanLine,
  Package,
  Smile,
  MapPin,
  CalendarDays,
  SlidersHorizontal,
  AudioLines,
  ShieldCheck,
  TriangleAlert,
  Download,
} from "lucide-react";
import { useEvent } from "../features/event-management";
import { useMetrics } from "../features/live-metrics";
import { FlowChart } from "../features/live-metrics";
import { useFeedback } from "../features/feedback-explorer";
import { StatusBadge } from "../entities/event";
import { Button, Loading, ErrorState } from "../shared/ui";
import { es } from "../shared/i18n";
import { number, percent, date, downloadCsv } from "../shared/lib";
export default function DashboardPage() {
  const { id = "" } = useParams();
  const event = useEvent(id);
  const metrics = useMetrics(id);
  const feedback = useFeedback(id);
  const [metric, setMetric] = useState<"check_ins" | "claims">("check_ins");
  if (event.isLoading || metrics.isLoading) return <Loading />;
  if (event.error || metrics.error)
    return (
      <ErrorState
        error={event.error ?? metrics.error}
        retry={() => {
          void event.refetch();
          void metrics.refetch();
        }}
      />
    );
  if (!event.data || !metrics.data) return null;
  const e = event.data,
    m = metrics.data;
  const samples = m.claimsByProduct.reduce((sum, p) => sum + p.claims, 0);
  const cards = [
    {
      label: es.dashboard.registered,
      value: number(m.registered),
      hint: `${number(e.capacity)} cupos de aforo total`,
      icon: Users,
    },
    {
      label: es.dashboard.attended,
      value: number(m.attended),
      hint: `${percent(m.attended, m.registered)} de los inscritos`,
      icon: ScanLine,
    },
    {
      label: es.dashboard.samples,
      value: number(samples),
      hint: `${m.claimsByProduct.length} productos en activación`,
      icon: Package,
    },
    {
      label: es.dashboard.sentiment,
      value: m.feedback.avgSentiment?.toFixed(2).replace(".", ",") ?? "—",
      hint: `${number(m.feedback.completed)} opiniones analizadas`,
      icon: Smile,
    },
  ];
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>{es.dashboard.title}</h1>
          <p>{es.dashboard.subtitle}</p>
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            downloadCsv(`${e.publicCode}-metricas-demo.csv`, [
              ["Evento", "Inscritos", "Asistentes", "Muestras", "Sentimiento"],
              [
                e.name,
                m.registered,
                m.attended,
                samples,
                m.feedback.avgSentiment ?? "",
              ],
            ])
          }
        >
          <Download size={16} />
          {es.export}
        </Button>
      </div>
      <section className="event-banner">
        <div className="banner-content">
          <div className="banner-meta">
            <StatusBadge status={e.status} />
            <span>{es.types[e.type]}</span>
            <span>#{e.publicCode}</span>
          </div>
          <h2>{e.name}</h2>
          <div className="banner-details">
            <span>
              <MapPin size={15} />
              {e.location}, {e.city}
            </span>
            <span>
              <CalendarDays size={15} />
              {date(e.startsAt, e.timezone)}
            </span>
          </div>
          <Button variant="secondary" asChild>
            <Link to={`/admin/events/${id}`}>
              <SlidersHorizontal size={16} />
              {es.settings}
            </Link>
          </Button>
        </div>
        <div className="banner-goal">
          <div
            className="goal-orbit"
            style={
              {
                "--progress": `${Math.min((m.attended / (m.attendanceGoal || 1)) * 100, 100)}%`,
              } as React.CSSProperties
            }
          >
            <div>
              <strong>
                {m.attendanceGoal
                  ? Math.round((m.attended / m.attendanceGoal) * 100)
                  : "—"}
                <small>{m.attendanceGoal ? "%" : ""}</small>
              </strong>
              <span>{uiText.dashboardPage1}</span>
            </div>
          </div>
          <span>
            {number(m.attended)} / {number(m.attendanceGoal)}
            {uiText.dashboardPage2}
          </span>
        </div>
        <svg className="banner-wave" viewBox="0 0 800 240" aria-hidden="true">
          <path d="M-80 200C150-140 430 420 920-80" />
          <path d="M-80 225C150-115 430 445 920-55" />
        </svg>
      </section>
      <div className="metrics-grid">
        {cards.map(({ label, value, hint, icon: Icon }, i) => (
          <section className="metric-card" key={label}>
            <div>
              <span>{label}</span>
              <Icon size={19} />
            </div>
            <strong>
              {value}
              {i === 3 && <small>/ 5</small>}
            </strong>
            <p>{hint}</p>
          </section>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel flow-panel">
          <div className="panel-heading">
            <div>
              <h2>{es.dashboard.flow}</h2>
              <p>{es.dashboard.flowHint}</p>
            </div>
            <select
              aria-label={uiText.dashboardPage3}
              value={metric}
              onChange={(v) => setMetric(v.target.value as typeof metric)}
            >
              <option value="check_ins">{uiText.dashboardPage4}</option>
              <option value="claims">{uiText.dashboardPage5}</option>
            </select>
          </div>
          <div className="chart-legend">
            <span className="red-dot" />
            {metric === "check_ins" ? "Ingresos" : "Canjes"}
            <small>{uiText.dashboardPage6}</small>
          </div>
          <FlowChart enabled={m.attended > 0} metric={metric} />
          <div className="flow-footer">
            <div>
              <span>{es.dashboard.engagement}</span>
              <strong>{percent(m.engagedAttendees, m.attended)}</strong>
            </div>
            <div>
              <span>{es.dashboard.recurrence}</span>
              <strong>{percent(m.recurrentAttendees, m.attended)}</strong>
            </div>
            <ArrowUpRight size={24} />
          </div>
        </section>
        <section className="panel voices-panel">
          <div className="panel-heading">
            <div>
              <h2>{es.dashboard.voices}</h2>
              <p>{es.dashboard.voicesHint}</p>
            </div>
            <AudioLines size={21} />
          </div>
          {feedback.data
            ?.filter((f) => f.status === "COMPLETED")
            .slice(0, 2)
            .map((f) => (
              <Link
                to={`/admin/events/${id}/feedback`}
                key={f.id}
                className="voice-preview"
              >
                <div className="flex items-center justify-between">
                  <span className="person">
                    <span className="avatar avatar-small">
                      {f.participant.firstName[0]}
                    </span>
                    {f.participant.firstName}
                  </span>
                  <span className="sentiment-pill">
                    {f.sentimentScore}/5 <Smile size={13} />
                  </span>
                </div>
                <blockquote>“{f.transcription}”</blockquote>
                <div className="tag-row">
                  {f.keyTopics.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </Link>
            ))}
          {!feedback.data?.some((f) => f.status === "COMPLETED") && (
            <p className="muted py-8">{es.dashboard.noFeedback}</p>
          )}
          <Link className="text-link" to={`/admin/events/${id}/feedback`}>
            {uiText.dashboardPage7}
            <ArrowRight size={15} />
          </Link>
        </section>
        <section className="panel sampling-panel">
          <div className="panel-heading">
            <div>
              <h2>{es.dashboard.sampling}</h2>
              <p>{uiText.dashboardPage8}</p>
            </div>
            <Package size={20} />
          </div>
          {m.claimsByProduct.map((p, i) => (
            <div className="product-row" key={p.productId}>
              <span className={`product-symbol product-${i}`}>
                <Package size={22} />
              </span>
              <div>
                <div className="product-line">
                  <strong>{p.name}</strong>
                  <span>{number(p.claims)}</span>
                </div>
                <div className="bar-track">
                  <div
                    style={{
                      width: `${(p.claims / Math.max(...m.claimsByProduct.map((p) => p.claims))) * 100}%`,
                      background: ["#e50009", "#35363a", "#27825a"][i % 3],
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          {!samples && <p className="muted py-8">{uiText.dashboardPage9}</p>}
          <div className="sampling-total">
            <span>{uiText.dashboardPage10}</span>
            <strong>{number(samples)}</strong>
          </div>
        </section>
        <section className="panel attention-panel">
          <div className="panel-heading">
            <h2>{es.dashboard.alerts}</h2>
            <span className="small-label">{uiText.dashboardPage11}</span>
          </div>
          <div className="attention-item">
            <span className="attention-icon green">
              <ShieldCheck size={20} />
            </span>
            <div>
              <strong>
                {number(m.blockedFraudAttempts)}
                {uiText.dashboardPage12}
              </strong>
              <p>{uiText.dashboardPage13}</p>
            </div>
          </div>
          {feedback.data?.some((f) => (f.sentimentScore ?? 5) <= 2) && (
            <Link
              to={`/admin/events/${id}/feedback?sentiment=negative`}
              className="attention-item"
            >
              <span className="attention-icon amber">
                <TriangleAlert size={20} />
              </span>
              <div>
                <strong>{uiText.dashboardPage14}</strong>
                <p>{uiText.dashboardPage15}</p>
              </div>
              <ArrowUpRight size={18} />
            </Link>
          )}
          <div className="insight-pair">
            <div>
              <strong>
                {m.feedback.purchaseIntentRate === null
                  ? "—"
                  : `${m.feedback.purchaseIntentRate.toFixed(1).replace(".", ",")}%`}
              </strong>
              <span>{es.dashboard.intent}</span>
            </div>
            <div>
              <strong>
                {percent(m.feedback.completed, m.feedback.requested)}
              </strong>
              <span>{es.dashboard.response}</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
