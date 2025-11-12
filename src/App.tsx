import { Suspense, lazy, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { KpiCard } from './components/KpiCard';
import { KpiDetail } from './components/KpiDetail';
import { Button } from './components/ui/Button';
import { Container } from './components/ui/Container';
import { VisuallyHidden } from './components/ui/VisuallyHidden';
import { cn } from './lib/cn';
import { withViewTransition } from './lib/viewTransition';
import { categoryBreakdown, trendData } from './lib/chartData';

const TrendLine = lazy(() => import('./components/charts/TrendLine'));
const BarBreakdown = lazy(() => import('./components/charts/BarBreakdown'));

const timeframeOptions = [
  { label: 'Today', value: 'today' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
];

const kpis = [
  { id: 'active-users', label: 'Active Users', value: '1,248', delta: '+12%' },
  { id: 'new-signups', label: 'New Signups', value: '342', delta: '+8%' },
  { id: 'retention', label: 'Retention', value: '78%', delta: '-3%' },
  { id: 'revenue', label: 'Revenue', value: '$24.3K', delta: '+5%' },
];

export default function App() {
  const [timeframe, setTimeframe] = useState<string>(timeframeOptions[0]?.value ?? 'today');
  const [openId, setOpenId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

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

  const activeKpi = openId ? kpis.find((kpi) => kpi.id === openId) : undefined;

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
            <div>
              <h2 className="text-lg font-semibold text-white">Overview</h2>
              <p className="text-sm text-slate-400">Track activity across the selected timeframe.</p>
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
              {kpis.map((kpi) => (
                <KpiCard key={kpi.id} {...kpi} onOpen={handleOpenDetail} />
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
                  <TrendLine data={trendData} />
                </div>
                <div className="h-72 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <BarBreakdown data={categoryBreakdown} />
                </div>
              </div>
            </Suspense>
          </motion.section>
        </Container>
      </main>
      {activeKpi ? <KpiDetail {...activeKpi} onClose={handleCloseDetail} /> : null}
    </div>
  );
}
