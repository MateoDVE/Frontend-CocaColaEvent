import { uiText } from "../shared/i18n";
import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useEvents } from "../features/event-management";
import { demoRepository } from "../shared/demo";
import { es } from "../shared/i18n";
import { Button, Loading, ErrorState, Empty } from "../shared/ui";
import { percent, number, downloadCsv } from "../shared/lib";
export default function AnalyticsPage() {
  const events = useEvents();
  const [selected, setSelected] = useState<string[]>([]);
  const queries = useQueries({
    queries: selected.map((id) => ({
      queryKey: ["metrics", id],
      queryFn: () => demoRepository.metrics(id),
    })),
  });
  const ready = queries.every((q) => q.data);
  const data = queries.flatMap((q, i) =>
    q.data
      ? [
          {
            name: events.data?.find((e) => e.id === selected[i])?.name ?? "",
            metrics: q.data,
          },
        ]
      : [],
  );
  const rows = [
    {
      label: "Inscritos",
      values: data.map((d) => number(d.metrics.registered)),
    },
    {
      label: "Asistentes",
      values: data.map((d) => number(d.metrics.attended)),
    },
    {
      label: uiText.analyticsPage1,
      values: data.map((d) =>
        percent(d.metrics.attended, d.metrics.registered),
      ),
    },
    {
      label: uiText.analyticsPage2,
      values: data.map((d) =>
        percent(d.metrics.attended, d.metrics.attendanceGoal),
      ),
    },
    {
      label: uiText.analyticsPage3,
      values: data.map(
        (d) => d.metrics.feedback.avgSentiment?.toFixed(2) ?? "—",
      ),
    },
    {
      label: uiText.analyticsPage4,
      values: data.map((d) => number(d.metrics.couponsIssued)),
    },
  ];
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>{es.comparison.title}</h1>
          <p>{es.comparison.subtitle}</p>
        </div>
        <Button
          variant="secondary"
          disabled={selected.length < 2 || !ready}
          onClick={() =>
            downloadCsv("comparativo-demo.csv", [
              [es.comparison.metric, ...data.map((d) => d.name)],
              ...rows.map((r) => [r.label, ...r.values]),
            ])
          }
        >
          <Download size={16} />
          {es.export}
        </Button>
      </div>
      {events.isLoading ? (
        <Loading />
      ) : events.error ? (
        <ErrorState error={events.error} retry={events.refetch} />
      ) : (
        <fieldset className="comparison-select panel">
          <legend>{es.comparison.choose}</legend>
          {events.data?.map((e) => (
            <label className="check-label" key={e.id}>
              <input
                type="checkbox"
                checked={selected.includes(e.id)}
                onChange={(v) =>
                  setSelected((ids) =>
                    v.target.checked
                      ? [...ids, e.id]
                      : ids.filter((id) => id !== e.id),
                  )
                }
              />
              {e.name}
            </label>
          ))}
        </fieldset>
      )}
      {selected.length < 2 ? (
        <Empty text={es.comparison.minimum} hint={uiText.analyticsPage5} />
      ) : queries.some((q) => q.isError) ? (
        <ErrorState
          error={queries.find((q) => q.error)?.error ?? null}
          retry={() => queries.forEach((q) => void q.refetch())}
        />
      ) : !ready ? (
        <Loading />
      ) : (
        <section className="panel table-scroll">
          <table>
            <caption className="sr-only">{uiText.analyticsPage6}</caption>
            <thead>
              <tr>
                <th>{uiText.analyticsPage7}</th>
                {data.map((d) => (
                  <th key={d.name}>{d.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  {r.values.map((v, i) => (
                    <td key={i}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
