import { useState } from 'react';

import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { Container } from './components/ui/Container';
import { VisuallyHidden } from './components/ui/VisuallyHidden';
import { cn } from './lib/cn';

const timeframeOptions = [
  { label: 'Today', value: 'today' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
];

const kpis = [
  { label: 'Active Users', value: '1,248', change: '+12%' },
  { label: 'New Signups', value: '342', change: '+8%' },
  { label: 'Retention', value: '78%', change: '-3%' },
  { label: 'Revenue', value: '$24.3K', change: '+5%' },
];

export default function App() {
  const [timeframe, setTimeframe] = useState<string>(timeframeOptions[0]?.value ?? 'today');

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
                      onClick={() => setTimeframe(option.value)}
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
              {kpis.map((kpi) => {
                const isNegative = kpi.change.startsWith('-');
                return (
                  <Card key={kpi.label} className="space-y-4">
                    <div className="text-sm font-medium text-slate-400">{kpi.label}</div>
                    <div className="text-3xl font-semibold text-white">{kpi.value}</div>
                    <div
                      className={cn(
                        'text-sm font-semibold',
                        isNegative ? 'text-rose-400' : 'text-emerald-400'
                      )}
                    >
                      {kpi.change} vs last period
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}
