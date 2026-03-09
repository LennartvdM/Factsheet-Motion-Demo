import { motion } from 'framer-motion';

import { Sparkline } from './Sparkline';
import { cn } from '../lib/cn';
import { useCountUp } from '../hooks/useCountUp';

type MetricCardProps = {
  id: string;
  label: string;
  value: string;
  rawValue: number;
  delta: string;
  sparkline?: number[];
  onOpen: (id: string) => void;
  highlighted?: boolean;
  reduceMotion?: boolean;
  index?: number;
  format?: 'percent' | 'score';
};

const pctFmt = new Intl.NumberFormat('nl-NL', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
const scoreFmt = new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 2 });

export function MetricCard({
  id, label, value, rawValue, delta, sparkline, onOpen,
  highlighted = false, reduceMotion = false, index = 0, format = 'percent',
}: MetricCardProps) {
  const isNegative = delta.trim().startsWith('-');
  const labelId = `metric-${id}-label`;
  const valueId = `metric-${id}-value`;

  const animatedValue = useCountUp(rawValue, { reduceMotion });
  const displayValue = reduceMotion
    ? value
    : format === 'score'
      ? scoreFmt.format(animatedValue)
      : pctFmt.format(animatedValue);

  const card = (
    <button
      type="button"
      aria-labelledby={`${labelId} ${valueId}`}
      onClick={() => onOpen(id)}
      className={cn(
        'group relative flex h-full flex-col gap-3 rounded-2xl bg-[rgba(var(--color-card),0.75)] p-6 text-left shadow-lg shadow-[rgba(var(--color-overlay),0.2)] backdrop-blur transition focus:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(var(--color-accent),0.65)] focus-visible:ring-offset-1 focus-visible:ring-offset-[rgba(var(--color-bg),0.75)] hover:bg-[rgba(var(--color-card),0.9)] hover:shadow-[rgba(var(--color-overlay),0.3)]',
        highlighted
          ? reduceMotion
            ? 'ring-1 ring-[rgba(var(--color-accent),0.65)] shadow-[rgba(var(--color-accent),0.3)]'
            : 'ring-1 ring-[rgba(var(--color-accent),0.65)] shadow-[rgba(var(--color-accent),0.35)] animate-pulse'
          : undefined,
      )}
      style={{ viewTransitionName: `metric-${id}` }}
    >
      <span id={labelId} className="text-sm font-medium text-subtle">
        {label}
      </span>
      <div className="flex items-end justify-between gap-3">
        <span id={valueId} className="text-3xl font-semibold tabular-nums">
          {displayValue}
        </span>
        {sparkline && sparkline.length >= 2 && (
          <Sparkline
            values={sparkline}
            width={72}
            height={28}
            className="shrink-0 opacity-60 transition-opacity group-hover:opacity-100"
          />
        )}
      </div>
      <span className={cn('text-sm font-semibold', isNegative ? 'text-negative' : 'text-positive')}>
        {delta} vs previous year
      </span>
      <span className="mt-auto text-xs font-medium uppercase tracking-wide text-subtle transition group-hover:text-muted">
        View details
      </span>
    </button>
  );

  if (reduceMotion) return card;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {card}
    </motion.div>
  );
}

export default MetricCard;
