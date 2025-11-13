import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { ChartFigure } from '../types/ChartFigure';
import { useFigureSeries } from '../hooks/createFigureSeries';

const SERIES_COLORS = ['#38bdf8', '#f97316', '#10b981', '#a855f7', '#facc15', '#ef4444'];

type FigureChartProps = {
  fig: ChartFigure;
};

export function FigureChart({ fig }: FigureChartProps) {
  const { categories, series } = useFigureSeries(fig);

  const data = useMemo(() => {
    return categories.map((category, index) => {
      const point: Record<string, string | number | null> = {
        [fig.indexField]: category ?? null,
      };

      series.forEach((entry) => {
        point[entry.key] = entry.values[index];
      });

      return point;
    });
  }, [categories, fig.indexField, series]);

  return (
    <div className="flex w-full flex-col gap-4">
      {fig.title ? <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{fig.title}</h3> : null}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" vertical={false} />
            <XAxis
              dataKey={fig.indexField}
              tickLine={false}
              axisLine={false}
              stroke="rgba(148, 163, 184, 0.8)"
              tickMargin={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="rgba(148, 163, 184, 0.8)"
              tickMargin={12}
              width={48}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(148, 163, 184, 0.4)', strokeDasharray: '4 4' }}
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                color: '#e2e8f0',
              }}
            />
            <Legend />
            {series.map((entry, index) => (
              <Line
                key={entry.key}
                type="monotone"
                dataKey={entry.key}
                name={entry.label}
                stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
