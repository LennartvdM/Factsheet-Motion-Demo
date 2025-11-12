import { useId } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type BarDatum = {
  category: string;
  value: number;
};

type BarBreakdownProps = {
  data: BarDatum[];
  fillColor?: string;
};

export default function BarBreakdown({ data, fillColor = '#22d3ee' }: BarBreakdownProps) {
  const gradientId = useId();
  const shouldReduceMotion = useReducedMotion();

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 12, right: 12, left: -24, bottom: 4 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity={0.9} />
            <stop offset="100%" stopColor={fillColor} stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
        <XAxis dataKey="category" tickLine={false} axisLine={false} stroke="rgba(148, 163, 184, 0.6)" />
        <YAxis
          tickLine={false}
          axisLine={false}
          stroke="rgba(148, 163, 184, 0.6)"
          tickMargin={12}
          width={48}
        />
        <Tooltip
          cursor={{ fill: 'rgba(56, 189, 248, 0.08)' }}
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderRadius: '0.75rem',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            color: '#e2e8f0',
          }}
          labelStyle={{ color: '#cbd5f5', fontWeight: 500 }}
        />
        <Bar dataKey="value" fill={`url(#${gradientId})`} radius={[10, 10, 8, 8]} isAnimationActive={!shouldReduceMotion} />
      </BarChart>
    </ResponsiveContainer>
  );
}
