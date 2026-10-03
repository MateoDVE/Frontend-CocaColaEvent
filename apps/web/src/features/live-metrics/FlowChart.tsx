import { uiText } from "../../shared/i18n";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
export function FlowChart({
  enabled,
  metric,
}: {
  enabled: boolean;
  metric: "check_ins" | "claims";
}) {
  const points = [
    65, 83, 79, 120, 110, 178, 160, 218, 240, 206, 190, 229, 184, 210, 264, 306,
  ];
  const data = enabled
    ? points.map((value, i) => ({
        hour: `${15 + Math.floor(i / 4)}:${String((i % 4) * 15).padStart(2, "0")}`,
        value: metric === "claims" ? Math.round(value * 0.73) : value,
      }))
    : [];
  return (
    <div
      className="flow-chart"
      role="img"
      aria-label={enabled ? uiText.flowChart1 : uiText.flowChart2}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 10, left: -24, bottom: 0 }}
        >
          <defs>
            <linearGradient id="redFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f40009" stopOpacity={0.14} />
              <stop offset="100%" stopColor="#f40009" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 5"
            vertical={false}
            stroke="#e7e9ed"
          />
          <XAxis
            dataKey="hour"
            tickLine={false}
            axisLine={false}
            minTickGap={36}
            tick={{ fill: "#72747b", fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#72747b", fontSize: 11 }}
          />
          <Tooltip
            formatter={(v) => [v, metric === "claims" ? "Canjes" : "Ingresos"]}
            contentStyle={{ borderRadius: 10, borderColor: "#e7e9ed" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#e50009"
            strokeWidth={2.5}
            fill="url(#redFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
