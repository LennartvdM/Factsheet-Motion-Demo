import type { TooltipProps } from "recharts";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { PerformancePoint } from "../../data/companies";

export type MetricAreaChartProps = {
  data: PerformancePoint[];
};

const CustomTooltip = ({
  active,
  payload,
  label
}: TooltipProps<ValueType, NameType>): JSX.Element | null => {
  if (!active || !payload?.length) {
    return null;
  }

  const fund = payload.find((item) => item.dataKey === "fund");
  const benchmark = payload.find((item) => item.dataKey === "benchmark");

  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 shadow-lg">
      <p className="font-semibold text-white">{label}</p>
      <p>
        Fund: <span className="text-emerald-300">{typeof fund?.value === "number" ? fund.value.toFixed(1) : fund?.value}</span>
      </p>
      <p>
        Benchmark: <span className="text-sky-300">{typeof benchmark?.value === "number" ? benchmark.value.toFixed(1) : benchmark?.value}</span>
      </p>
    </div>
  );
};

const MetricAreaChart = ({ data }: MetricAreaChartProps): JSX.Element => {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: 8, right: 8, top: 24, bottom: 8 }}>
        <defs>
          <linearGradient id="fundGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="#1f2937" vertical={false} />
        <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} width={48} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#38bdf8", strokeDasharray: "3 3" }} />
        <Area
          type="monotone"
          dataKey="fund"
          stroke="#34d399"
          fill="url(#fundGradient)"
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="benchmark"
          stroke="#38bdf8"
          fill="url(#benchmarkGradient)"
          strokeWidth={2}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MetricAreaChart;
