import { uiText } from "../shared/i18n";
import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  AudioLines,
  MessageSquare,
  ArrowUpRight,
  Search,
  Smile,
  Download,
} from "lucide-react";
import type { Feedback } from "@cocacola-ei/contracts";
import { useFeedback } from "../features/feedback-explorer";
import { useProducts } from "../features/catalog";
import { es } from "../shared/i18n";
import { Button, Loading, ErrorState, Empty, Modal } from "../shared/ui";
import { downloadCsv, time } from "../shared/lib";
export default function FeedbackPage() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const query = useFeedback(id);
  const { data: products = [] } = useProducts();
  const [sentiment, setSentiment] = useState(params.get("sentiment") ?? "");
  const [topic, setTopic] = useState("");
  const [product, setProduct] = useState("");
  const [intent, setIntent] = useState(false);
  const [selected, setSelected] = useState<Feedback | null>(null);
  const rows =
    query.data?.filter(
      (f) =>
        (!sentiment ||
          (sentiment === "positive" && (f.sentimentScore ?? 0) >= 4) ||
          (sentiment === "neutral" && f.sentimentScore === 3) ||
          (sentiment === "negative" &&
            f.sentimentScore !== null &&
            f.sentimentScore <= 2) ||
          (sentiment === "failed" && f.status === "FAILED")) &&
        (!intent || f.purchaseIntent) &&
        (!product || f.productId === product) &&
        f.keyTopics.join(" ").toLowerCase().includes(topic.toLowerCase()),
    ) ?? [];
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>{es.feedbackPage.title}</h1>
          <p>{es.feedbackPage.subtitle}</p>
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            downloadCsv("feedback-demo.csv", [
              ["Ciudad", "Sentimiento", uiText.feedbackPage1, "Temas"],
              ...rows.map((f) => [
                f.participant.city,
                f.sentimentScore ?? "",
                f.purchaseIntent ? uiText.feedbackPage2 : "No",
                f.keyTopics.join("; "),
              ]),
            ])
          }
        >
          <Download size={16} />
          {es.export}
        </Button>
      </div>
      <div className="feedback-intro">
        <AudioLines size={38} />
        <div>
          <strong>{uiText.feedbackPage4}</strong>
          <p>{uiText.feedbackPage5}</p>
        </div>
        <span>
          {rows.length}
          {uiText.feedbackPage6}
        </span>
      </div>
      <div className="filter-row flex-wrap">
        <div className="search-input">
          <Search size={17} />
          <input
            aria-label={es.feedbackPage.topic}
            placeholder={es.feedbackPage.topic}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <select
          aria-label={es.feedbackPage.sentiment}
          value={sentiment}
          onChange={(e) => setSentiment(e.target.value)}
        >
          <option value="">{uiText.feedbackPage7}</option>
          <option value="positive">{es.feedbackPage.positive}</option>
          <option value="neutral">{es.feedbackPage.neutral}</option>
          <option value="negative">{es.feedbackPage.negative}</option>
          <option value="failed">{es.feedbackPage.failed}</option>
        </select>
        <select
          aria-label={es.products}
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        >
          <option value="">{uiText.feedbackPage8}</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <label className="check-label">
          <input
            type="checkbox"
            checked={intent}
            onChange={(e) => setIntent(e.target.checked)}
          />
          {es.feedbackPage.intent}
        </label>
      </div>
      {query.isLoading ? (
        <Loading />
      ) : query.error ? (
        <ErrorState error={query.error} retry={query.refetch} />
      ) : rows.length ? (
        <div className="feedback-grid">
          {rows.map((f) => (
            <article key={f.id} className="panel feedback-card">
              <div className="flex justify-between items-center">
                <span className="person">
                  <span className="avatar">{f.participant.firstName[0]}</span>
                  <span>
                    <strong>{f.participant.firstName}</strong>
                    <small>
                      {f.participant.city} · {f.participant.ageRange}
                      {uiText.feedbackPage9}
                    </small>
                  </span>
                </span>
                <span
                  className={`sentiment-pill ${(f.sentimentScore ?? 5) <= 2 ? "negative" : ""}`}
                >
                  {f.sentimentScore === null
                    ? "Pendiente"
                    : `${f.sentimentScore}/5`}
                  <Smile size={14} />
                </span>
              </div>
              <blockquote>
                {f.transcription
                  ? `“${f.transcription}”`
                  : es.feedbackPage.failed}
              </blockquote>
              <div className="tag-row">
                {f.keyTopics.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="feedback-card-footer">
                <span>
                  {f.inputType === "AUDIO" ? (
                    <AudioLines size={16} />
                  ) : (
                    <MessageSquare size={16} />
                  )}{" "}
                  {time(f.receivedAt)}
                </span>
                <Button variant="ghost" onClick={() => setSelected(f)}>
                  {es.feedbackPage.read}
                  <ArrowUpRight size={16} />
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty />
      )}
      <Modal
        open={selected !== null}
        onOpenChange={(v) => {
          if (!v) setSelected(null);
        }}
        title={es.feedbackPage.transcription}
        description={
          selected
            ? `${selected.participant.firstName} · ${selected.participant.city}`
            : ""
        }
      >
        <p className="transcription">
          {selected?.transcription ?? es.feedbackPage.reprocessNote}
        </p>
        <p className="muted my-5">{es.feedbackPage.noAudio}</p>
        <div className="tag-row">
          {selected?.keyTopics.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <p className="mt-5">
          {selected?.purchaseIntent
            ? es.feedbackPage.buy
            : es.feedbackPage.noBuy}
        </p>
      </Modal>
    </>
  );
}
