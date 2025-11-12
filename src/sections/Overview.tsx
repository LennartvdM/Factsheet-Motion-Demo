import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { KpiCard } from '../components/KpiCard';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { VisuallyHidden } from '../components/ui/VisuallyHidden';
import { cn } from '../lib/cn';
import { exportKpiGridPng, exportSnapshotCsv } from '../lib/export';
import type { Factset, KPI } from '../types';

const TrendLine = lazy(() => import('../components/charts/TrendLine'));
const BarBreakdown = lazy(() => import('../components/charts/BarBreakdown'));

type DisplayKpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  raw: KPI;
};

type Option = {
  label: string;
  value: string;
};

type OverviewProps = {
  timeframe: string;
  timeframeOptions: Option[];
  onTimeframeChange: (value: string) => void;
  lastUpdatedLabel: string | null;
  displayKpis?: DisplayKpi[];
  highlights: Record<string, boolean>;
  onOpenDetail: (id: string) => void;
  shouldReduceMotion: boolean;
  facts: Factset | null;
};

export function Overview({
  timeframe,
  timeframeOptions,
  onTimeframeChange,
  lastUpdatedLabel,
  displayKpis,
  highlights,
  onOpenDetail,
  shouldReduceMotion,
  facts
}: OverviewProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const timeframeLabel = timeframeOptions.find((option) => option.value === timeframe)?.label ?? timeframe;
  const canExport = Boolean(displayKpis && displayKpis.length > 0 && facts);

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
    if (!displayKpis || !facts) {
      return;
    }

    exportSnapshotCsv({
      kpis: displayKpis.map((kpi) => kpi.raw),
      trend: facts.trend.slice(-30),
      generatedAt: facts.generatedAt,
      timeframe: timeframeLabel,
    });
    setIsMenuOpen(false);
  };

  const handleExportPng = () => {
    if (!displayKpis || !facts) {
      return;
    }

    const element = gridRef.current;

    if (!element) {
      return;
    }

    void exportKpiGridPng({
      element,
      reduceMotion: shouldReduceMotion,
      timeframe: timeframeLabel,
    });
    setIsMenuOpen(false);
  };

  const grid = displayKpis ? (
    <div ref={gridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {displayKpis.map((kpi) => (
        <KpiCard
          key={kpi.id}
          id={kpi.id}
          label={kpi.label}
          value={kpi.value}
          delta={kpi.delta}
          onOpen={onOpenDetail}
          highlighted={Boolean(highlights[kpi.id])}
          reduceMotion={shouldReduceMotion}
        />
      ))}
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex h-full flex-col gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6">
          <div className={cn('h-4 w-24 rounded-full bg-slate-800/70', !shouldReduceMotion && 'animate-pulse')} />
          <div className={cn('h-8 w-32 rounded-full bg-slate-800/70', !shouldReduceMotion && 'animate-pulse')} />
          <div className={cn('h-4 w-20 rounded-full bg-slate-800/70', !shouldReduceMotion && 'animate-pulse')} />
          <div className={cn('mt-auto h-3 w-16 rounded-full bg-slate-800/70', !shouldReduceMotion && 'animate-pulse')} />
        </div>
      ))}
    </div>
  );

  const trendContent = (
    <motion.section
      className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-2xl shadow-slate-950/40"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? undefined : { duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex flex-col gap-2 pb-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">Trends</p>
        <h2 className="text-2xl font-semibold text-white">Performance over time</h2>
        <p className="text-sm text-slate-400">
          Explore how engagement evolves across the network and where regional momentum is accelerating.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex h-[32rem] items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/40 text-sm text-slate-400">
            Loading trend insights…
          </div>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="h-72 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
            {facts ? (
              <TrendLine data={facts.trend} />
            ) : (
              <div className={cn('h-full rounded-xl bg-slate-900/40', !shouldReduceMotion && 'animate-pulse')} />
            )}
          </div>
          <div className="h-72 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
            {facts ? (
              <BarBreakdown data={facts.categories} />
            ) : (
              <div className={cn('h-full rounded-xl bg-slate-900/40', !shouldReduceMotion && 'animate-pulse')} />
            )}
          </div>
        </div>
      </Suspense>
    </motion.section>
  );

  const fadeContent = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={timeframe}
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
          <h2 className="text-lg font-semibold text-white">Overview</h2>
          <p className="text-sm text-slate-400">Track activity across the selected timeframe.</p>
          {lastUpdatedLabel ? (
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">Last updated {lastUpdatedLabel}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div role="group" aria-labelledby="overview-timeframe-label">
            <VisuallyHidden id="overview-timeframe-label">Select timeframe</VisuallyHidden>
            <Segmented
              options={timeframeOptions}
              value={timeframe}
              onValueChange={onTimeframeChange}
              ariaLabelledBy="overview-timeframe-label"
            />
          </div>
          <div className="relative">
            <Button
              ref={buttonRef}
              variant="ghost"
              className="sm:w-auto"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              aria-controls="overview-export-menu"
              onClick={() => setIsMenuOpen((open) => !open)}
              disabled={!canExport}
            >
              Export snapshot
            </Button>
            {isMenuOpen ? (
              <div
                ref={menuRef}
                id="overview-export-menu"
                role="menu"
                className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-slate-800/70 bg-slate-900/90 p-1 shadow-xl shadow-slate-950/40 backdrop-blur"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  onClick={handleExportCsv}
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
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
