import { Suspense, lazy, type MouseEvent, useRef } from 'react';
import { createPortal } from 'react-dom';

import { FocusScope } from './FocusScope';
import { cn } from '../lib/cn';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import type { DimensionScore, Metric, TrendPoint } from '../types';

const TrendLine = lazy(() => import('./charts/TrendLine'));
const BarBreakdown = lazy(() => import('./charts/BarBreakdown'));

type MetricDetailProps = {
  metric: Metric;
  formattedValue: string;
  formattedDelta: string;
  generatedAt: string;
  trend: TrendPoint[];
  dimensions: DimensionScore[];
  onClose: () => void;
};

export function MetricDetail({ metric, formattedValue, formattedDelta, generatedAt, trend, dimensions, onClose }: MetricDetailProps) {
  const { id, label } = metric;
  const headingRef = useRef<HTMLHeadingElement>(null);

  useLockBodyScroll(true);

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Convert dimensions to the CategoryBreakdown shape for BarBreakdown
  const categoryData = dimensions.map((d) => ({
    category: d.dimension,
    value: d.score,
  }));

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(var(--color-overlay),0.75)] p-4 backdrop-blur sm:items-center"
      onClick={handleOverlayClick}
    >
      <FocusScope onClose={onClose} initialFocusRef={headingRef} className="flex w-full justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`metric-${id}-detail-label`}
          className={cn(
            'relative flex w-full max-w-lg flex-col rounded-3xl bg-[rgba(var(--color-card),0.95)] text-[rgb(var(--color-text))] shadow-2xl shadow-[rgba(var(--color-overlay),0.35)] transition-colors',
            'max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-h-[calc(100vh-4rem)]',
          )}
          style={{ viewTransitionName: `metric-${id}`, WebkitOverflowScrolling: 'touch' }}
        >
          <div className="sticky top-0 z-10 flex justify-end border-b border-soft bg-[rgba(var(--color-card),0.98)] px-8 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[rgba(var(--color-surface-muted),0.85)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted transition hover:bg-[rgba(var(--color-surface-muted),1)] hover:text-[rgb(var(--color-text))] focus:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(var(--color-accent),0.65)] focus-visible:ring-offset-1 focus-visible:ring-offset-[rgba(var(--color-card),0.85)]"
            >
              Close
            </button>
          </div>
          <div className="space-y-4 px-8 pb-8 pt-6">
            <div className="space-y-1 border-b border-soft pb-4">
              <h2
                id={`metric-${id}-detail-label`}
                ref={headingRef}
                tabIndex={-1}
                className="text-sm font-semibold uppercase tracking-wide text-muted"
              >
                {label}
              </h2>
              <p className="text-4xl font-semibold">{formattedValue}</p>
              <p
                className={cn(
                  'text-sm font-semibold',
                  formattedDelta.trim().startsWith('-') ? 'text-negative' : 'text-positive',
                )}
              >
                {formattedDelta} vs previous year
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-subtle">
                Measurement year {metric.year}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              Explore how this metric has developed across measurement years. The trend chart shows the
              trajectory of women&apos;s representation in top positions, while the breakdown shows current
              inclusion-policy dimension scores across the charter organisations.
            </p>
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">Charts</h3>
              <Suspense
                fallback={
                  <div className="flex h-[30rem] items-center justify-center rounded-2xl bg-[rgba(var(--color-card),0.6)] text-sm text-subtle">
                    Loading charts…
                  </div>
                }
              >
                <div className="grid gap-4">
                  <div className="h-60 overflow-hidden rounded-2xl bg-[rgba(var(--color-card),0.75)] p-3 shadow-inner shadow-[rgba(var(--color-overlay),0.12)]">
                    <TrendLine data={trend} />
                  </div>
                  <div className="h-60 overflow-hidden rounded-2xl bg-[rgba(var(--color-card),0.75)] p-3 shadow-inner shadow-[rgba(var(--color-overlay),0.12)]">
                    <BarBreakdown data={categoryData} />
                  </div>
                </div>
              </Suspense>
            </div>
          </div>
        </div>
      </FocusScope>
    </div>
  );

  return typeof document === 'undefined' ? content : createPortal(content, document.body);
}

export default MetricDetail;
