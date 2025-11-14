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
        'group flex h-full flex-col gap-3 rounded-2xl bg-[rgba(var(--color-card),0.75)] p-6 text-left shadow-lg shadow-[rgba(var(--color-overlay),0.2)] backdrop-blur transition focus:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(var(--color-accent),0.65)] focus-visible:ring-offset-1 focus-visible:ring-offset-[rgba(var(--color-bg),0.75)] hover:bg-[rgba(var(--color-card),0.9)] hover:shadow-[rgba(var(--color-overlay),0.3)]',
        highlighted
          ? reduceMotion
            ? 'shadow-[0_0_0_1.5px_rgba(var(--color-accent),0.55),0_28px_60px_-20px_rgba(var(--color-accent),0.35)]'
            : 'shadow-[0_0_0_1.5px_rgba(var(--color-accent),0.55),0_28px_60px_-20px_rgba(var(--color-accent),0.4)] animate-pulse'
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
