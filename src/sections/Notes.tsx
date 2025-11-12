import { AnimatePresence, motion } from 'framer-motion';

import { Segmented } from '../components/ui/Segmented';
import { VisuallyHidden } from '../components/ui/VisuallyHidden';
import { cn } from '../lib/cn';
import type { Factset } from '../types';

type Option = {
  label: string;
  value: string;
};

type NotesProps = {
  timeframe: string;
  timeframeOptions: Option[];
  onTimeframeChange: (value: string) => void;
  shouldReduceMotion: boolean;
  facts: Factset | null;
};

const timeframeDescriptions: Record<string, string> = {
  today: 'Live updates from the last 24 hours highlight emerging shifts you can share in stand-ups.',
  '7d': 'Weekly context surfaces persistent movers and laggards for cross-team syncs.',
  '30d': 'Monthly perspective supports planning conversations with leadership.'
};

export function Notes({ timeframe, timeframeOptions, onTimeframeChange, shouldReduceMotion, facts }: NotesProps) {
  const topKpis = facts?.kpis.slice(0, 3) ?? [];

  const fadeContent = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${timeframe}-${facts ? facts.generatedAt : 'loading'}`}
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.92 }}
        transition={shouldReduceMotion ? undefined : { duration: 0.24, ease: 'easeOut' }}
        className="space-y-6"
      >
        <p className="text-sm text-muted">{timeframeDescriptions[timeframe] ?? timeframeDescriptions.today}</p>
        <ul className="space-y-3">
          {topKpis.length > 0 ? (
            topKpis.map((kpi) => (
              <li
                key={kpi.id}
                className="rounded-2xl border border-soft bg-[rgba(var(--color-card),0.7)] p-4 transition-colors"
              >
                <p className="text-sm font-semibold">{kpi.label}</p>
                <p className="text-xs text-subtle">
                  Updated {new Date(kpi.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </p>
              </li>
            ))
          ) : (
            <>
              {Array.from({ length: 3 }).map((_, index) => (
                <li
                  key={index}
                  className="rounded-2xl border border-soft bg-[rgba(var(--color-card),0.7)] p-4 transition-colors"
                >
                  <div className={cn('h-4 w-40 rounded-full bg-[rgba(var(--color-border),0.35)]', !shouldReduceMotion && 'animate-pulse')} />
                  <div className={cn('mt-2 h-3 w-24 rounded-full bg-[rgba(var(--color-border),0.35)]', !shouldReduceMotion && 'animate-pulse')} />
                </li>
              ))}
            </>
          )}
        </ul>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Notes</h2>
          <p className="text-sm text-subtle">Capture quick talking points to share with your stakeholders.</p>
        </div>
        <div role="group" aria-labelledby="notes-timeframe-label">
          <VisuallyHidden id="notes-timeframe-label">Select timeframe</VisuallyHidden>
          <Segmented
            options={timeframeOptions}
            value={timeframe}
            onValueChange={onTimeframeChange}
            ariaLabelledBy="notes-timeframe-label"
          />
        </div>
      </section>
      {shouldReduceMotion ? (
        <div className="space-y-6">
          <p className="text-sm text-muted">{timeframeDescriptions[timeframe] ?? timeframeDescriptions.today}</p>
          <ul className="space-y-3">
            {topKpis.length > 0 ? (
              topKpis.map((kpi) => (
                <li
                  key={kpi.id}
                  className="rounded-2xl border border-soft bg-[rgba(var(--color-card),0.7)] p-4 transition-colors"
                >
                  <p className="text-sm font-semibold">{kpi.label}</p>
                  <p className="text-xs text-subtle">
                    Updated {new Date(kpi.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </li>
              ))
            ) : (
              <>
                {Array.from({ length: 3 }).map((_, index) => (
                  <li
                    key={index}
                    className="rounded-2xl border border-soft bg-[rgba(var(--color-card),0.7)] p-4 transition-colors"
                  >
                    <div className="h-4 w-40 rounded-full bg-[rgba(var(--color-border),0.35)]" />
                    <div className="mt-2 h-3 w-24 rounded-full bg-[rgba(var(--color-border),0.35)]" />
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      ) : (
        fadeContent
      )}
    </div>
  );
}
