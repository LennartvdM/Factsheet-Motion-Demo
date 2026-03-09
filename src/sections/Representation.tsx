import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { MetricCard } from '../components/MetricCard';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { VisuallyHidden } from '../components/ui/VisuallyHidden';
import { cn } from '../lib/cn';
import { exportSnapshotCsv, exportKpiGridPng } from '../lib/export';
import type { Factset, Metric } from '../types';

const TrendLine = lazy(() => import('../components/charts/TrendLine'));
const BarBreakdown = lazy(() => import('../components/charts/BarBreakdown'));

type DisplayMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  raw: Metric;
};

type Option = {
  label: string;
  value: string;
};

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
  selectedYear,
  yearOptions,
  onYearChange,
  lastUpdatedLabel,
  displayMetrics,
  highlights,
  onOpenDetail,
  shouldReduceMotion,
  facts,
}: RepresentationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const yearLabel = yearOptions.find((option) => option.value === selectedYear)?.label ?? selectedYear;
  const canExport = Boolean(displayMetrics && displayMetrics.length > 0 && facts);

  useEffect(() => {
    if (!canExport) {
      setIsMenuOpen(false);
    }
  }, [canExport]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }
      setIsMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsMenuOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const firstItem = menuRef.current?.querySelector<HTMLButtonElement>('button');
    firstItem?.focus();
  }, [isMenuOpen]);

  const handleExportCsv = () => {
    if (!displayMetrics || !facts) {
      return;
    }

    exportSnapshotCsv({
      kpis: displayMetrics.map((m) => ({
        id: m.raw.id,
        label: m.raw.label,
        unit: m.raw.format === 'score' ? 'count' as const : 'percent' as const,
        value: m.raw.value,
        delta: m.raw.value - m.raw.previousValue,
        updatedAt: m.raw.updatedAt,
      })),
      trend: facts.trend.slice(-30),
      generatedAt: facts.generatedAt,
      timeframe: yearLabel,
    });
    setIsMenuOpen(false);
  };

  const handleExportPng = () => {
    if (!displayMetrics || !facts) {
      return;
    }

    const element = gridRef.current;

    if (!element) {
      return;
    }

    void exportKpiGridPng({
      element,
      reduceMotion: shouldReduceMotion,
      timeframe: yearLabel,
    });
    setIsMenuOpen(false);
  };

  const grid = displayMetrics ? (
    <div ref={gridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {displayMetrics.map((metric) => (
        <MetricCard
          key={metric.id}
          id={metric.id}
          label={metric.label}
          value={metric.value}
          delta={metric.delta}
          onOpen={onOpenDetail}
          highlighted={Boolean(highlights[metric.id])}
          reduceMotion={shouldReduceMotion}
        />
      ))}
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex h-full flex-col gap-3 rounded-2xl bg-[rgba(var(--color-card),0.6)] p-6 transition-colors"
        >
          <div className={cn('h-4 w-24 rounded-full bg-[rgba(var(--color-border),0.35)]', !shouldReduceMotion && 'animate-pulse')} />
          <div className={cn('h-8 w-32 rounded-full bg-[rgba(var(--color-border),0.35)]', !shouldReduceMotion && 'animate-pulse')} />
          <div className={cn('h-4 w-20 rounded-full bg-[rgba(var(--color-border),0.35)]', !shouldReduceMotion && 'animate-pulse')} />
          <div className={cn('mt-auto h-3 w-16 rounded-full bg-[rgba(var(--color-border),0.35)]', !shouldReduceMotion && 'animate-pulse')} />
        </div>
      ))}
    </div>
  );

  const trendContent = (
    <motion.section
      className="overflow-hidden rounded-3xl bg-[rgba(var(--color-card),0.8)] p-6 shadow-2xl shadow-[rgba(var(--color-overlay),0.3)] transition-colors"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? undefined : { duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex flex-col gap-2 border-b border-soft pb-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">Trends</p>
        <h2 className="text-2xl font-semibold">Representation over time</h2>
        <p className="text-sm text-subtle">
          Track how women&apos;s representation in top leadership positions has evolved
          across charter organisations from 2019 to the latest measurement year.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="mt-4 flex h-[32rem] items-center justify-center rounded-2xl bg-[rgba(var(--color-card),0.6)] text-sm text-subtle">
            Loading trend data…
          </div>
        }
      >
        <div className="mt-4 grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="h-72 overflow-hidden rounded-2xl bg-[rgba(var(--color-card),0.75)] p-4 shadow-inner shadow-[rgba(var(--color-overlay),0.12)]">
            {facts ? (
              <TrendLine data={facts.trend} />
            ) : (
              <div className={cn('h-full rounded-xl bg-[rgba(var(--color-surface-muted),0.6)]', !shouldReduceMotion && 'animate-pulse')} />
            )}
          </div>
          <div className="h-72 overflow-hidden rounded-2xl bg-[rgba(var(--color-card),0.75)] p-4 shadow-inner shadow-[rgba(var(--color-overlay),0.12)]">
            {facts ? (
              <BarBreakdown data={facts.dimensions.map((d) => ({ category: d.dimension, value: d.score }))} />
            ) : (
              <div className={cn('h-full rounded-xl bg-[rgba(var(--color-surface-muted),0.6)]', !shouldReduceMotion && 'animate-pulse')} />
            )}
          </div>
        </div>
      </Suspense>
    </motion.section>
  );

  const fadeContent = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={selectedYear}
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.92 }}
        transition={shouldReduceMotion ? undefined : { duration: 0.24, ease: 'easeOut' }}
        className="space-y-10"
      >
        {grid}
        {trendContent}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Representation</h2>
          <p className="text-sm text-subtle">Gender representation in top, subtop, and full organisation.</p>
          {lastUpdatedLabel ? (
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-subtle">Last updated {lastUpdatedLabel}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div role="group" aria-labelledby="representation-year-label">
            <VisuallyHidden id="representation-year-label">Select measurement year</VisuallyHidden>
            <Segmented
              options={yearOptions}
              value={selectedYear}
              onValueChange={onYearChange}
              ariaLabelledBy="representation-year-label"
            />
          </div>
          <div className="relative">
            <Button
              ref={buttonRef}
              variant="ghost"
              className="sm:w-auto"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              aria-controls="representation-export-menu"
              onClick={() => setIsMenuOpen((open) => !open)}
              disabled={!canExport}
            >
              Export snapshot
            </Button>
            {isMenuOpen ? (
              <div
                ref={menuRef}
                id="representation-export-menu"
                role="menu"
                className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl bg-[rgba(var(--color-card),0.95)] p-1 shadow-xl shadow-[rgba(var(--color-overlay),0.25)] backdrop-blur transition"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[rgb(var(--color-text))] transition hover:bg-[rgba(var(--color-card),0.9)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(var(--color-accent),0.65)] focus-visible:ring-offset-1 focus-visible:ring-offset-[rgba(var(--color-card),0.85)]"
                  onClick={handleExportCsv}
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[rgb(var(--color-text))] transition hover:bg-[rgba(var(--color-card),0.9)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(var(--color-accent),0.65)] focus-visible:ring-offset-1 focus-visible:ring-offset-[rgba(var(--color-card),0.85)]"
                  onClick={handleExportPng}
                >
                  Export PNG
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
      {shouldReduceMotion ? <div className="space-y-10">{grid}{trendContent}</div> : fadeContent}
    </div>
  );
}
