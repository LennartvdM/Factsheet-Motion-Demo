import { cn } from '../lib/cn';

type KpiCardProps = {
  id: string;
  label: string;
  value: string;
  delta: string;
  onOpen: (id: string) => void;
  highlighted?: boolean;
  reduceMotion?: boolean;
};

export function KpiCard({ id, label, value, delta, onOpen, highlighted = false, reduceMotion = false }: KpiCardProps) {
  const isNegative = delta.trim().startsWith('-');
  const labelId = `kpi-${id}-label`;
  const valueId = `kpi-${id}-value`;

  return (
    <button
      type="button"
      aria-labelledby={`${labelId} ${valueId}`}
      onClick={() => onOpen(id)}
      className={cn(
        'group flex h-full flex-col gap-3 rounded-2xl border border-soft bg-[rgba(var(--color-card),0.75)] p-6 text-left shadow-lg shadow-[rgba(var(--color-overlay),0.2)] backdrop-blur transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-bg))] hover:border-[rgba(var(--color-border),0.85)] hover:bg-[rgba(var(--color-card),0.9)] hover:shadow-[rgba(var(--color-overlay),0.3)]',
        highlighted
          ? reduceMotion
            ? 'border-[rgba(var(--color-accent),0.65)] shadow-[rgba(var(--color-accent),0.3)]'
            : 'border-[rgba(var(--color-accent),0.65)] shadow-[rgba(var(--color-accent),0.35)] animate-pulse'
          : undefined
      )}
      style={{ viewTransitionName: `kpi-${id}` }}
    >
      <span id={labelId} className="text-sm font-medium text-subtle">
        {label}
      </span>
      <span id={valueId} className="text-3xl font-semibold">
        {value}
      </span>
      <span className={cn('text-sm font-semibold', isNegative ? 'text-negative' : 'text-positive')}>
        {delta} vs last period
      </span>
      <span className="mt-auto text-xs font-medium uppercase tracking-wide text-subtle transition group-hover:text-muted">
        View details
      </span>
    </button>
  );
}

export default KpiCard;
