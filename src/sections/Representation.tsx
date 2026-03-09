import { Suspense, lazy, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { MetricCard } from '../components/MetricCard';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { VisuallyHidden } from '../components/ui/VisuallyHidden';
import { cn } from '../lib/cn';
import { exportSnapshotCsv, exportGridPng } from '../lib/export';
import type { Factset, Metric } from '../types';

const TrendLine = lazy(() => import('../components/charts/TrendLine'));
const BarBreakdown = lazy(() => import('../components/charts/BarBreakdown'));

type DisplayMetric = {
  id: string;
  label: string;
  value: string;
  rawValue: number;
  delta: string;
  sparkline: number[];
  format: 'percent' | 'score';
  raw: Metric;
};
type Option = { label: string; value: string };

type RepresentationProps = {
  selectedYear: string;
  yearOptions: Option[];
  onYearChange: (value: string) => void;
  lastUpdatedLabel: string | null;
  displayMetrics?: DisplayMetric[];
  highlights: Record<string, boolean>;
  onOpenDetail: (id: string) => void;
  shouldReduceMotion: boolean;
  facts: Factset | null;
};

export function Representation({
  selectedYear, yearOptions, onYearChange, lastUpdatedLabel,
  displayMetrics, highlights, onOpenDetail, shouldReduceMotion, facts,
}: RepresentationProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const canExport = Boolean(displayMetrics?.length && facts);

  const handleCsv = () => {
    if (!displayMetrics || !facts) return;
    exportSnapshotCsv({ metrics: displayMetrics.map((m) => m.raw), trend: facts.trend, generatedAt: facts.generatedAt, year: selectedYear });
  };

  const handlePng = () => {
    if (!gridRef.current) return;
    void exportGridPng({ element: gridRef.current, reduceMotion: shouldReduceMotion, year: selectedYear });
  };

  const grid = displayMetrics ? (
    <div ref={gridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {displayMetrics.map((m, i) => (
        <MetricCard key={m.id} id={m.id} label={m.label} value={m.value} rawValue={m.rawValue}
          delta={m.delta} sparkline={m.sparkline} format={m.format}
          onOpen={onOpenDetail} highlighted={Boolean(highlights[m.id])}
          reduceMotion={shouldReduceMotion} index={i} />
      ))}
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex h-full flex-col gap-3 rounded-2xl bg-[rgba(var(--color-card),0.6)] p-6">
          <div className={cn('h-4 w-24 rounded-full bg-[rgba(var(--color-border),0.35)]', !shouldReduceMotion && 'animate-pulse')} />
          <div className={cn('h-8 w-32 rounded-full bg-[rgba(var(--color-border),0.35)]', !shouldReduceMotion && 'animate-pulse')} />
          <div className={cn('h-4 w-20 rounded-full bg-[rgba(var(--color-border),0.35)]', !shouldReduceMotion && 'animate-pulse')} />
        </div>
      ))}
    </div>
  );

  const charts = (
    <motion.section
      className="overflow-hidden rounded-3xl bg-[rgba(var(--color-card),0.8)] p-6 shadow-2xl shadow-[rgba(var(--color-overlay),0.3)]"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? undefined : { duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex flex-col gap-2 border-b border-soft pb-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">Trends</p>
        <h2 className="text-2xl font-semibold">Representation over time</h2>
        <p className="text-sm text-subtle">
          Women in top leadership across charter organisations, 2019–latest year.
        </p>
      </div>
      <Suspense fallback={<div className="mt-4 flex h-72 items-center justify-center text-sm text-subtle">Loading…</div>}>
        <div className="mt-4 grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="h-72 overflow-hidden rounded-2xl bg-[rgba(var(--color-card),0.75)] p-4 shadow-inner shadow-[rgba(var(--color-overlay),0.12)]">
            {facts ? <TrendLine data={facts.trend} /> : <div className={cn('h-full rounded-xl bg-[rgba(var(--color-surface-muted),0.6)]', !shouldReduceMotion && 'animate-pulse')} />}
          </div>
          <div className="h-72 overflow-hidden rounded-2xl bg-[rgba(var(--color-card),0.75)] p-4 shadow-inner shadow-[rgba(var(--color-overlay),0.12)]">
            {facts ? <BarBreakdown data={facts.dimensions.map((d) => ({ category: d.dimension, value: d.score }))} /> : <div className={cn('h-full rounded-xl bg-[rgba(var(--color-surface-muted),0.6)]', !shouldReduceMotion && 'animate-pulse')} />}
          </div>
        </div>
      </Suspense>
    </motion.section>
  );

  const body = (
    <div className="space-y-10">
      {grid}
      {charts}
    </div>
  );

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Representation</h2>
          <p className="text-sm text-subtle">Gender representation in top, subtop, and full organisation.</p>
          {lastUpdatedLabel ? <p className="text-xs font-medium uppercase tracking-[0.3em] text-subtle">Last updated {lastUpdatedLabel}</p> : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div role="group" aria-labelledby="rep-year-label">
            <VisuallyHidden id="rep-year-label">Select measurement year</VisuallyHidden>
            <Segmented options={yearOptions} value={selectedYear} onValueChange={onYearChange} ariaLabelledBy="rep-year-label" />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleCsv} disabled={!canExport}>CSV</Button>
            <Button variant="ghost" onClick={handlePng} disabled={!canExport}>PNG</Button>
          </div>
        </div>
      </section>

      {shouldReduceMotion ? body : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={selectedYear}
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.24, ease: 'easeOut' }}>
            {body}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
