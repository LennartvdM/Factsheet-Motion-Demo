import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { KpiDetail } from './components/KpiDetail';
import { Container } from './components/ui/Container';
import { Segmented } from './components/ui/Segmented';
import { VisuallyHidden } from './components/ui/VisuallyHidden';
import { withViewTransition } from './lib/viewTransition';
import { getInitialFacts, subscribeFacts } from './data/client';
import { ThemeProvider } from './theme/ThemeProvider';
import type { Factset, KPI } from './types';

import { Breakdown } from './sections/Breakdown';
import { Figures } from './sections/Figures';
import { Notes } from './sections/Notes';
import { Overview } from './sections/Overview';

const timeframeOptions = [
  { label: 'Today', value: 'today' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' }
];

const tabOptions = [
  { label: 'Overview', value: 'overview', id: 'tab-overview', controls: 'tab-panel-overview' },
  { label: 'Breakdown', value: 'breakdown', id: 'tab-breakdown', controls: 'tab-panel-breakdown' },
  { label: 'Figures', value: 'figures', id: 'tab-figures', controls: 'tab-panel-figures' },
  { label: 'Notes', value: 'notes', id: 'tab-notes', controls: 'tab-panel-notes' }
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
  const [activeTab, setActiveTab] = useState<string>(tabOptions[0]?.value ?? 'overview');
  const [timeframe, setTimeframe] = useState<string>(timeframeOptions[0]?.value ?? 'today');
  const [openId, setOpenId] = useState<string | null>(null);
  const [facts, setFacts] = useState<Factset | null>(null);
  const [highlights, setHighlights] = useState<Record<string, boolean>>({});
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  const reduceMotionPreference = useReducedMotion();
  const shouldReduceMotion = reduceMotionPreference ?? false;
  const highlightTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-contrast: more)');

    const updatePreference = () => {
      setPrefersHighContrast(mediaQuery.matches);
    };

    updatePreference();

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

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

          const changedLabels = update.kpis
            .filter((kpi) => changedIds.includes(kpi.id))
            .map((kpi) => kpi.label);

          if (changedLabels.length > 0) {
            const timestamp = new Date(update.generatedAt).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit'
            });
            setLiveAnnouncement(`Data updated: ${changedLabels.join(', ')} • ${timestamp}`);
          }
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

  const handleTabChange = (value: string) => {
    withViewTransition(() => {
      setActiveTab(value);
    });
  };

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

  const tabPanel = (() => {
    switch (activeTab) {
      case 'breakdown':
        return (
          <Breakdown
            timeframe={timeframe}
            timeframeOptions={timeframeOptions}
            onTimeframeChange={handleTimeframeChange}
            shouldReduceMotion={shouldReduceMotion}
            facts={facts}
          />
        );
      case 'figures':
        return <Figures shouldReduceMotion={shouldReduceMotion} />;
      case 'notes':
        return (
          <Notes
            timeframe={timeframe}
            timeframeOptions={timeframeOptions}
            onTimeframeChange={handleTimeframeChange}
            shouldReduceMotion={shouldReduceMotion}
            facts={facts}
          />
        );
      case 'overview':
      default:
        return (
          <Overview
            timeframe={timeframe}
            timeframeOptions={timeframeOptions}
            onTimeframeChange={handleTimeframeChange}
            lastUpdatedLabel={lastUpdatedLabel}
            displayKpis={displayKpis}
            highlights={highlights}
            onOpenDetail={handleOpenDetail}
            shouldReduceMotion={shouldReduceMotion}
            facts={facts}
          />
        );
    }
  })();

  return (
    <ThemeProvider>
      <div
        className="min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] transition-colors"
        data-contrast={prefersHighContrast ? 'more' : undefined}
      >
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <VisuallyHidden aria-live="polite" role="status" aria-atomic="true">
          {liveAnnouncement}
        </VisuallyHidden>
        <header className="border-b border-soft bg-[rgba(var(--color-surface-muted),0.75)] backdrop-blur">
          <Container className="flex flex-col gap-6 py-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">Dashboard</p>
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Live Factsheet</h1>
                </div>
              </div>
            <p className="max-w-2xl text-sm text-subtle">
              Monitor key metrics and trends at a glance. Adjust the timeframe to explore recent performance before sharing
              updates with your team.
            </p>
          </Container>
        </header>
        <main id="main-content" className="py-12" tabIndex={-1}>
          <Container className="space-y-10">
            <div className="flex flex-col gap-3">
              <VisuallyHidden id="section-tabs-label">Select dashboard section</VisuallyHidden>
              <Segmented
                type="tab"
                options={tabOptions}
                value={activeTab}
                onValueChange={handleTabChange}
                ariaLabelledBy="section-tabs-label"
              />
            </div>
            {shouldReduceMotion ? (
              <div id={`tab-panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
                {tabPanel}
              </div>
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTab}
                  id={`tab-panel-${activeTab}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${activeTab}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {tabPanel}
                </motion.div>
              </AnimatePresence>
            )}
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
    </ThemeProvider>
  );
}
