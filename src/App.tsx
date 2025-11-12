import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { KpiCard } from './components/KpiCard';
import { KpiDetail } from './components/KpiDetail';
import { Button } from './components/ui/Button';
import { Container } from './components/ui/Container';
import { VisuallyHidden } from './components/ui/VisuallyHidden';
import { cn } from './lib/cn';
import { withViewTransition } from './lib/viewTransition';
import { getInitialFacts, subscribeFacts } from './data/client';
import type { Factset, KPI } from './types';

const TrendLine = lazy(() => import('./components/charts/TrendLine'));
const BarBreakdown = lazy(() => import('./components/charts/BarBreakdown'));

const timeframeOptions = [
  { label: 'Today', value: 'today' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' }
];

const integerFormatter = new Intl.NumberFormat('en-US');
const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 1,
  notation: 'compact'
});
const percentValueFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});
const percentDeltaFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  signDisplay: 'always',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1
});

function formatKpiValue(kpi: KPI): string {
  switch (kpi.unit) {
    case 'currency':
      return compactCurrencyFormatter.format(kpi.value);
    case 'percent':
      return percentValueFormatter.format(kpi.value);
    default:
      return integerFormatter.format(kpi.value);
  }
}

function formatDelta(delta: number): string {
  return percentDeltaFormatter.format(delta);
}

type DisplayKpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  raw: KPI;
};

export default function App() {
  const [timeframe, setTimeframe] = useState<string>(timeframeOptions[0]?.value ?? 'today');
  const [openId, setOpenId] = useState<string | null>(null);
  const [facts, setFacts] = useState<Factset | null>(null);
  const [highlights, setHighlights] = useState<Record<string, boolean>>({});

  const reduceMotionPreference = useReducedMotion();
  const shouldReduceMotion = reduceMotionPreference ?? false;
  const highlightTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const triggerHighlight = useCallback((ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    setHighlights((current) => {
      const next = { ...current };
      ids.forEach((id) => {
        next[id] = true;
      });
      return next;
    });

    ids.forEach((id) => {
      const existing = highlightTimers.current[id];
      if (existing) {
        clearTimeout(existing);
      }

      highlightTimers.current[id] = setTimeout(() => {
        setHighlights((current) => {
          if (!current[id]) {
            return current;
          }

          const next = { ...current };
          delete next[id];
          return next;
        });
        delete highlightTimers.current[id];
      }, 2000);
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeFacts((update) => {
      setFacts((previous) => {
        if (!previous) {
          return update;
        }

        const changedIds = update.kpis.reduce<string[]>((acc, kpi) => {
          const prior = previous.kpis.find((item) => item.id === kpi.id);
          if (!prior || prior.value !== kpi.value || prior.delta !== kpi.delta) {
            acc.push(kpi.id);
          }
          return acc;
        }, []);

        if (changedIds.length > 0) {
          triggerHighlight(changedIds);
        }

        return update;
      });
    });

    getInitialFacts()
      .then((initial) => {
        if (!isMounted) {
          return;
        }
        setFacts((current) => current ?? initial);
      })
      .catch((error) => {
        console.error('[app] Failed to load initial facts', error);
      });

    return () => {
      isMounted = false;
      unsubscribe();
      Object.values(highlightTimers.current).forEach((timer) => clearTimeout(timer));
      highlightTimers.current = {};
    };
  }, [triggerHighlight]);

  const displayKpis = useMemo<DisplayKpi[] | undefined>(() => {
    if (!facts) {
      return undefined;
    }

    return facts.kpis.map((kpi) => ({
      id: kpi.id,
      label: kpi.label,
      value: formatKpiValue(kpi),
      delta: formatDelta(kpi.delta),
      raw: kpi
    }));
  }, [facts]);

  const handleTimeframeChange = (value: string) => {
    withViewTransition(() => {
      setTimeframe(value);
    });
  };

  const handleOpenDetail = (id: string) => {
    withViewTransition(() => {
      setOpenId(id);
    });
  };

  const handleCloseDetail = () => {
    withViewTransition(() => {
      setOpenId(null);
    });
  };

  const activeKpi = openId ? displayKpis?.find((kpi) => kpi.id === openId) : undefined;
  const lastUpdatedLabel = facts
    ? new Date(facts.generatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-900/70 bg-slate-950/80 backdrop-blur">
        <Container className="flex flex-col gap-4 py-10">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium uppercase tracking-wide text-sky-400">Dashboard</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Live Factsheet
            </h1>
            <p className="max-w-2xl text-sm text-slate-400">
              Monitor key metrics and trends at a glance. Adjust the timeframe to explore recent performance before sharing updates with your team.
            </p>
          </div>
        </Container>
      </header>
      <main className="py-12">
        <Container className="space-y-10">
          <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-white">Overview</h2>
              <p className="text-sm text-slate-400">Track activity across the selected timeframe.</p>
              {lastUpdatedLabel ? (
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
                  Last updated {lastUpdatedLabel}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div
                role="group"
                aria-labelledby="timeframe-label"
                className="inline-flex items-center gap-1 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-1 shadow-inner shadow-slate-900/40"
              >
                <VisuallyHidden id="timeframe-label">Select timeframe</VisuallyHidden>
                {timeframeOptions.map((option) => {
                  const isActive = option.value === timeframe;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => handleTimeframeChange(option.value)}
                      className={cn(
                        'relative rounded-xl px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                        isActive
                          ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <Button variant="ghost" className="sm:w-auto">
                Export
              </Button>
            </div>
          </section>
          <section>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {displayKpis
                ? displayKpis.map((kpi) => (
                    <KpiCard
                      key={kpi.id}
                      id={kpi.id}
                      label={kpi.label}
                      value={kpi.value}
                      delta={kpi.delta}
                      onOpen={handleOpenDetail}
                      highlighted={Boolean(highlights[kpi.id])}
                      reduceMotion={shouldReduceMotion}
                    />
                  ))
                : Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex h-full flex-col gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6"
                    >
                      <div className={cn('h-4 w-24 rounded-full bg-slate-800/70', !shouldReduceMotion && 'animate-pulse')} />
                      <div className={cn('h-8 w-32 rounded-full bg-slate-800/70', !shouldReduceMotion && 'animate-pulse')} />
                      <div className={cn('h-4 w-20 rounded-full bg-slate-800/70', !shouldReduceMotion && 'animate-pulse')} />
                      <div className={cn('mt-auto h-3 w-16 rounded-full bg-slate-800/70', !shouldReduceMotion && 'animate-pulse')} />
                    </div>
                  ))}
            </div>
          </section>
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
        </Container>
      </main>
      {activeKpi && facts ? (
        <KpiDetail
          kpi={activeKpi.raw}
          formattedValue={activeKpi.value}
          formattedDelta={activeKpi.delta}
          generatedAt={facts.generatedAt}
          trend={facts.trend}
          categories={facts.categories}
          onClose={handleCloseDetail}
        />
      ) : null}
    </div>
  );
}
