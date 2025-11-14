import { Suspense, lazy, type MouseEvent, useRef } from 'react';
import { createPortal } from 'react-dom';

import { FocusScope } from './FocusScope';
import { cn } from '../lib/cn';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import type { CategoryBreakdown, KPI, TrendPoint } from '../types';

const TrendLine = lazy(() => import('./charts/TrendLine'));
const BarBreakdown = lazy(() => import('./charts/BarBreakdown'));

type KpiDetailProps = {
  kpi: KPI;
  formattedValue: string;
  formattedDelta: string;
  generatedAt: string;
  trend: TrendPoint[];
  categories: CategoryBreakdown[];
  onClose: () => void;
};

export function KpiDetail({ kpi, formattedValue, formattedDelta, generatedAt, trend, categories, onClose }: KpiDetailProps) {
  const { id, label } = kpi;
  const headingRef = useRef<HTMLHeadingElement>(null);

  useLockBodyScroll(true);

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(var(--color-overlay),0.75)] p-4 backdrop-blur sm:items-center"
      onClick={handleOverlayClick}
    >
      <FocusScope onClose={onClose} initialFocusRef={headingRef} className="flex w-full justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`kpi-${id}-detail-label`}
          className={cn(
            'relative flex w-full max-w-lg flex-col rounded-3xl bg-[rgba(var(--color-card),0.95)] text-[rgb(var(--color-text))] shadow-2xl shadow-[rgba(var(--color-overlay),0.35)] transition-colors',
            'max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-h-[calc(100vh-4rem)]'
          )}
          style={{ viewTransitionName: `kpi-${id}`, WebkitOverflowScrolling: 'touch' }}
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
            <div className="space-y-1">
              <h2
                id={`kpi-${id}-detail-label`}
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
                  formattedDelta.trim().startsWith('-') ? 'text-negative' : 'text-positive'
                )}
              >
                {formattedDelta} vs last period
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-subtle">
                Updated {new Date(generatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              Compare performance over time, track the inflection points, and determine how this metric influences the rest of
              the dashboard. View transitions provide a sense of continuity between summary cards and detailed breakdowns.
            </p>
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">Charts</h3>
              <Suspense
                fallback={
                  <div className="flex h-[30rem] items-center justify-center rounded-2xl bg-[rgba(var(--color-card),0.6)] text-sm text-subtle">
                    Loading detailed charts…
                  </div>
                }
              >
                <div className="grid gap-4">
                  <div className="h-60 overflow-hidden rounded-2xl bg-[rgba(var(--color-card),0.75)] p-3 shadow-inner shadow-[rgba(var(--color-overlay),0.12)]">
                    <TrendLine data={trend} />
                  </div>
                  <div className="h-60 overflow-hidden rounded-2xl bg-[rgba(var(--color-card),0.75)] p-3 shadow-inner shadow-[rgba(var(--color-overlay),0.12)]">
                    <BarBreakdown data={categories} />
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

export default KpiDetail;
