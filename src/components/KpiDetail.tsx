import { Suspense, lazy, type MouseEvent, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { FocusScope } from './FocusScope';
import { cn } from '../lib/cn';
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

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, []);

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur"
      onClick={handleOverlayClick}
    >
      <FocusScope onClose={onClose} initialFocusRef={headingRef}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`kpi-${id}-detail-label`}
          className={cn(
            'relative w-full max-w-lg rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 text-slate-100 shadow-2xl shadow-slate-950/40'
          )}
          style={{ viewTransitionName: `kpi-${id}` }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-slate-800/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:bg-slate-700/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Close
          </button>
          <div className="space-y-4">
            <div className="space-y-1">
              <h2
                id={`kpi-${id}-detail-label`}
                ref={headingRef}
                tabIndex={-1}
                className="text-sm font-semibold uppercase tracking-wide text-slate-300"
              >
                {label}
              </h2>
              <p className="text-4xl font-semibold text-white">{formattedValue}</p>
              <p
                className={cn(
                  'text-sm font-semibold',
                  formattedDelta.trim().startsWith('-') ? 'text-rose-400' : 'text-emerald-400'
                )}
              >
                {formattedDelta} vs last period
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
                Updated {new Date(generatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Compare performance over time, track the inflection points, and determine how this metric influences the rest of
              the dashboard. View transitions provide a sense of continuity between summary cards and detailed breakdowns.
            </p>
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Charts</h3>
              <Suspense
                fallback={
                  <div className="flex h-[30rem] items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/40 text-sm text-slate-400">
                    Loading detailed charts…
                  </div>
                }
              >
                <div className="grid gap-4">
                  <div className="h-60 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3">
                    <TrendLine data={trend} />
                  </div>
                  <div className="h-60 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3">
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
