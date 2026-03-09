import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { MetricDetail } from './components/MetricDetail';
import { Container } from './components/ui/Container';
import { Segmented } from './components/ui/Segmented';
import { VisuallyHidden } from './components/ui/VisuallyHidden';
import { withViewTransition } from './lib/viewTransition';
import { useFactstream } from './hooks/useFactstream';
import type { Metric } from './types';

import { Figures } from './sections/Figures';
import { Inclusion } from './sections/Inclusion';
import { Methodology } from './sections/Methodology';
import { Representation } from './sections/Representation';

const yearOptions = [
  { label: '2022', value: '2022' },
  { label: '2023', value: '2023' },
  { label: '2024', value: '2024' },
];

const tabOptions = [
  { label: 'Representation', value: 'representation', id: 'tab-representation', controls: 'tab-panel-representation' },
  { label: 'Inclusion', value: 'inclusion', id: 'tab-inclusion', controls: 'tab-panel-inclusion' },
  { label: 'Figures', value: 'figures', id: 'tab-figures', controls: 'tab-panel-figures' },
  { label: 'Methodology', value: 'methodology', id: 'tab-methodology', controls: 'tab-panel-methodology' },
];

const pctFmt = new Intl.NumberFormat('nl-NL', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
const scoreFmt = new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
const deltaFmt = new Intl.NumberFormat('nl-NL', { style: 'percent', signDisplay: 'always', minimumFractionDigits: 1, maximumFractionDigits: 1 });

function fmtValue(m: Metric) {
  return m.format === 'score' ? scoreFmt.format(m.value) : pctFmt.format(m.value);
}

function fmtDelta(m: Metric) {
  const d = m.value - m.previousValue;
  return m.format === 'score' ? `${d >= 0 ? '+' : ''}${scoreFmt.format(d)}` : deltaFmt.format(d);
}

export type DisplayMetric = { id: string; label: string; value: string; delta: string; raw: Metric };

export default function App() {
  const [activeTab, setActiveTab] = useState(tabOptions[0].value);
  const [selectedYear, setSelectedYear] = useState(yearOptions[2].value);
  const [openId, setOpenId] = useState<string | null>(null);

  const { facts, highlights, liveAnnouncement } = useFactstream();
  const shouldReduceMotion = useReducedMotion() ?? false;

  const displayMetrics = useMemo<DisplayMetric[] | undefined>(
    () => facts?.metrics.map((m) => ({ id: m.id, label: m.label, value: fmtValue(m), delta: fmtDelta(m), raw: m })),
    [facts],
  );

  const vt = (fn: () => void) => withViewTransition(fn);

  const activeMetric = openId ? displayMetrics?.find((m) => m.id === openId) : undefined;
  const lastUpdated = facts
    ? new Date(facts.generatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })
    : null;

  const tabPanel = (() => {
    switch (activeTab) {
      case 'inclusion':
        return <Inclusion selectedYear={selectedYear} yearOptions={yearOptions} onYearChange={(v) => vt(() => setSelectedYear(v))} shouldReduceMotion={shouldReduceMotion} facts={facts} />;
      case 'figures':
        return <Figures shouldReduceMotion={shouldReduceMotion} />;
      case 'methodology':
        return <Methodology selectedYear={selectedYear} yearOptions={yearOptions} onYearChange={(v) => vt(() => setSelectedYear(v))} shouldReduceMotion={shouldReduceMotion} facts={facts} />;
      default:
        return <Representation selectedYear={selectedYear} yearOptions={yearOptions} onYearChange={(v) => vt(() => setSelectedYear(v))} lastUpdatedLabel={lastUpdated} displayMetrics={displayMetrics} highlights={highlights} onOpenDetail={(id) => vt(() => setOpenId(id))} shouldReduceMotion={shouldReduceMotion} facts={facts} />;
    }
  })();

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] transition-colors">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <VisuallyHidden aria-live="polite" role="status" aria-atomic="true">{liveAnnouncement}</VisuallyHidden>

      <header className="border-b border-soft bg-[rgba(var(--color-surface-muted),0.75)] backdrop-blur">
        <Container className="flex flex-col gap-6 py-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">Charter Diversiteit</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Diversity Monitor</h1>
          </div>
          <p className="max-w-2xl text-sm text-subtle">
            Tracking gender representation and inclusion policy maturity across charter organisations.
            Select a measurement year to explore progress toward diversity commitments.
          </p>
        </Container>
      </header>

      <main id="main-content" className="py-12" tabIndex={-1}>
        <Container className="space-y-10">
          <div className="flex flex-col gap-3">
            <VisuallyHidden id="section-tabs-label">Select monitor section</VisuallyHidden>
            <Segmented type="tab" options={tabOptions} value={activeTab} onValueChange={(v) => vt(() => setActiveTab(v))} ariaLabelledBy="section-tabs-label" />
          </div>

          {shouldReduceMotion ? (
            <div id={`tab-panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>{tabPanel}</div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={activeTab} id={`tab-panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}>
                {tabPanel}
              </motion.div>
            </AnimatePresence>
          )}
        </Container>
      </main>

      {activeMetric && facts ? (
        <MetricDetail metric={activeMetric.raw} formattedValue={activeMetric.value} formattedDelta={activeMetric.delta}
          generatedAt={facts.generatedAt} trend={facts.trend} dimensions={facts.dimensions} onClose={() => vt(() => setOpenId(null))} />
      ) : null}
    </div>
  );
}
