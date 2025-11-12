import { useId } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { TrendPoint } from '../../types';

type TrendLineProps = {
  data: TrendPoint[];
  accentColor?: string;
};

export default function TrendLine({ data, accentColor = '#38bdf8' }: TrendLineProps) {
  const gradientId = useId();
  const shouldReduceMotion = useReducedMotion();

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 20, right: 16, left: -20, bottom: 4 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity={0.35} />
            <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          stroke="rgba(148, 163, 184, 0.6)"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={16}
          stroke="rgba(148, 163, 184, 0.6)"
          width={48}
        />
        <Tooltip
          cursor={{ stroke: accentColor, strokeWidth: 1, strokeDasharray: '4 4' }}
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderRadius: '0.75rem',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            color: '#e2e8f0',
          }}
          labelStyle={{ color: '#cbd5f5', fontWeight: 500 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="none"
          fill={`url(#${gradientId})`}
          isAnimationActive={!shouldReduceMotion}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={accentColor}
          strokeWidth={2.5}
          dot={shouldReduceMotion ? false : { r: 4, strokeWidth: 2, fill: '#0f172a', stroke: accentColor }}
          activeDot={{ r: 6, strokeWidth: 0, fill: accentColor }}
          isAnimationActive={!shouldReduceMotion}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
