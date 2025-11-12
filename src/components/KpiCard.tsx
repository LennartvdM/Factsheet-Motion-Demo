import { AnimatedNumber } from './AnimatedNumber';
import { cn } from '../lib/cn';

type KpiCardProps = {
  id: string;
  label: string;
  value: string;
  delta: string;
  onOpen: (id: string) => void;
  highlighted?: boolean;
  reduceMotion?: boolean;
  numericValue?: number;
  valueFormatter?: (value: number) => string;
};

export function KpiCard({
  id,
  label,
  value,
  delta,
  onOpen,
  highlighted = false,
  reduceMotion = false,
  numericValue,
  valueFormatter,
}: KpiCardProps) {
  const isNegative = delta.trim().startsWith('-');
  const labelId = `kpi-${id}-label`;
  const valueId = `kpi-${id}-value`;

  return (
    <button
      type="button"
      aria-labelledby={`${labelId} ${valueId}`}
      onClick={() => onOpen(id)}
      className={cn(
        'group flex h-full flex-col gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/60 p-6 text-left shadow-lg shadow-slate-950/20 backdrop-blur transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-slate-900/40',
        highlighted
          ? reduceMotion
            ? 'border-sky-500/70 shadow-sky-500/30'
            : 'border-sky-500/70 shadow-sky-500/40 animate-pulse'
          : undefined
      )}
      style={{ viewTransitionName: `kpi-${id}` }}
    >
      <span id={labelId} className="text-sm font-medium text-slate-400">
        {label}
      </span>
      <span id={valueId} className="text-3xl font-semibold text-white">
        {typeof numericValue === 'number' && valueFormatter ? (
          <AnimatedNumber
            value={numericValue}
            format={valueFormatter}
            shouldReduceMotion={reduceMotion}
          />
        ) : (
          value
        )}
      </span>
      <span
        className={cn('text-sm font-semibold', isNegative ? 'text-rose-400' : 'text-emerald-400')}
      >
        {delta} vs last period
      </span>
      <span className="mt-auto text-xs font-medium uppercase tracking-wide text-slate-500 transition group-hover:text-slate-300">
        View details
      </span>
    </button>
  );
}

export default KpiCard;
