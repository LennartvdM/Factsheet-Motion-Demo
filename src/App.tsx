import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { MetricDetail } from './components/MetricDetail';
import { Container } from './components/ui/Container';
import { Segmented } from './components/ui/Segmented';
import { VisuallyHidden } from './components/ui/VisuallyHidden';
import { withViewTransition } from './lib/viewTransition';
import { getInitialFacts, subscribeFacts } from './data/client';
import { ThemeProvider } from './theme/ThemeProvider';
import type { Factset, Metric } from './types';

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

const percentFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const scoreFormatter = new Intl.NumberFormat('nl-NL', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});
const deltaFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'percent',
  signDisplay: 'always',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatMetricValue(metric: Metric): string {
  if (metric.format === 'score') {
    return scoreFormatter.format(metric.value);
  }
  return percentFormatter.format(metric.value);
}

function formatDelta(metric: Metric): string {
  const delta = metric.value - metric.previousValue;
  if (metric.format === 'score') {
    const sign = delta >= 0 ? '+' : '';
    return `${sign}${scoreFormatter.format(delta)}`;
  }
  return deltaFormatter.format(delta);
}

export type DisplayMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  raw: Metric;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(tabOptions[0]?.value ?? 'representation');
  const [selectedYear, setSelectedYear] = useState<string>(yearOptions[2]?.value ?? '2024');
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

        const changedIds = update.metrics.reduce<string[]>((acc, metric) => {
          const prior = previous.metrics.find((item) => item.id === metric.id);
          if (!prior || prior.value !== metric.value) {
            acc.push(metric.id);
          }
          return acc;
        }, []);

        if (changedIds.length > 0) {
          triggerHighlight(changedIds);

          const changedLabels = update.metrics
            .filter((m) => changedIds.includes(m.id))
            .map((m) => m.label);

          if (changedLabels.length > 0) {
            const timestamp = new Date(update.generatedAt).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit',
            });
            setLiveAnnouncement(`Data updated: ${changedLabels.join(', ')} \u2022 ${timestamp}`);
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

  const displayMetrics = useMemo<DisplayMetric[] | undefined>(() => {
    if (!facts) {
      return undefined;
    }

    return facts.metrics.map((metric) => ({
      id: metric.id,
      label: metric.label,
      value: formatMetricValue(metric),
      delta: formatDelta(metric),
      raw: metric,
    }));
  }, [facts]);

  const handleTabChange = (value: string) => {
    withViewTransition(() => {
      setActiveTab(value);
    });
  };

  const handleYearChange = (value: string) => {
    withViewTransition(() => {
      setSelectedYear(value);
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

  const activeMetric = openId ? displayMetrics?.find((m) => m.id === openId) : undefined;
  const lastUpdatedLabel = facts
    ? new Date(facts.generatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })
    : null;

  const tabPanel = (() => {
    switch (activeTab) {
      case 'inclusion':
        return (
          <Inclusion
            selectedYear={selectedYear}
            yearOptions={yearOptions}
            onYearChange={handleYearChange}
            shouldReduceMotion={shouldReduceMotion}
            facts={facts}
          />
        );
      case 'figures':
        return <Figures shouldReduceMotion={shouldReduceMotion} />;
      case 'methodology':
        return (
          <Methodology
            selectedYear={selectedYear}
            yearOptions={yearOptions}
            onYearChange={handleYearChange}
            shouldReduceMotion={shouldReduceMotion}
            facts={facts}
          />
        );
      case 'representation':
      default:
        return (
          <Representation
            selectedYear={selectedYear}
            yearOptions={yearOptions}
            onYearChange={handleYearChange}
            lastUpdatedLabel={lastUpdatedLabel}
            displayMetrics={displayMetrics}
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
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">
                  Charter Diversiteit
                </p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Diversity Monitor
                </h1>
              </div>
            </div>
            <p className="max-w-2xl text-sm text-subtle">
              Tracking gender representation and inclusion policy maturity across charter organisations.
              Select a measurement year to explore how organisations are progressing toward their diversity commitments.
            </p>
          </Container>
        </header>
        <main id="main-content" className="py-12" tabIndex={-1}>
          <Container className="space-y-10">
            <div className="flex flex-col gap-3">
              <VisuallyHidden id="section-tabs-label">Select monitor section</VisuallyHidden>
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
        {activeMetric && facts ? (
          <MetricDetail
            metric={activeMetric.raw}
            formattedValue={activeMetric.value}
            formattedDelta={activeMetric.delta}
            generatedAt={facts.generatedAt}
            trend={facts.trend}
            dimensions={facts.dimensions}
            onClose={handleCloseDetail}
          />
        ) : null}
      </div>
    </ThemeProvider>
  );
}
