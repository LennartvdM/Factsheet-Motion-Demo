import { AnimatePresence, motion } from 'framer-motion';

import { Segmented } from '../components/ui/Segmented';
import { VisuallyHidden } from '../components/ui/VisuallyHidden';
import { cn } from '../lib/cn';
import type { Factset } from '../types';

type Option = {
  label: string;
  value: string;
};

type BreakdownProps = {
  timeframe: string;
  timeframeOptions: Option[];
  onTimeframeChange: (value: string) => void;
  shouldReduceMotion: boolean;
  facts: Factset | null;
};

export function Breakdown({
  timeframe,
  timeframeOptions,
  onTimeframeChange,
  shouldReduceMotion,
  facts
}: BreakdownProps) {
  const categories = facts?.categories ?? [];
  const total = categories.reduce((sum, item) => sum + item.value, 0);
  const maxValue = Math.max(...categories.map((item) => item.value), 0);

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
        {categories.length > 0 ? (
          categories.map((category) => {
            const percentage = total === 0 ? 0 : Math.round((category.value / total) * 100);
            const barWidth = maxValue === 0 ? 0 : Math.max((category.value / maxValue) * 100, 4);
            return (
              <div
                key={category.category}
                className="space-y-2 rounded-2xl border border-soft bg-[rgba(var(--color-card),0.7)] p-4 transition-colors"
              >
                <div className="flex items-center justify-between text-sm text-muted">
                  <p className="font-semibold">{category.category}</p>
                  <span className="text-xs uppercase tracking-[0.2em] text-subtle">{percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-[rgba(var(--color-border),0.35)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${barWidth}%`,
                      background: 'linear-gradient(90deg, rgba(var(--color-accent), 0.65), rgba(var(--color-accent), 1))'
                    }}
                    aria-hidden="true"
                  />
                </div>
                <p className="text-xs text-subtle">
                  {category.value.toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 0 })} interactions
                </p>
              </div>
            );
          })
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="space-y-2 rounded-2xl border border-soft bg-[rgba(var(--color-card),0.7)] p-4 transition-colors"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className={cn('h-4 w-28 rounded-full bg-[rgba(var(--color-border),0.35)]', !shouldReduceMotion && 'animate-pulse')} />
                  <div className={cn('h-3 w-12 rounded-full bg-[rgba(var(--color-border),0.35)]', !shouldReduceMotion && 'animate-pulse')} />
                </div>
                <div className={cn('h-2 rounded-full bg-[rgba(var(--color-border),0.35)]', !shouldReduceMotion && 'animate-pulse')} />
                <div className={cn('h-3 w-20 rounded-full bg-[rgba(var(--color-border),0.35)]', !shouldReduceMotion && 'animate-pulse')} />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Breakdown</h2>
          <p className="text-sm text-subtle">Dive into category level performance and trending segments.</p>
        </div>
        <div role="group" aria-labelledby="breakdown-timeframe-label">
          <VisuallyHidden id="breakdown-timeframe-label">Select timeframe</VisuallyHidden>
          <Segmented
            options={timeframeOptions}
            value={timeframe}
            onValueChange={onTimeframeChange}
            ariaLabelledBy="breakdown-timeframe-label"
          />
        </div>
      </section>
      {shouldReduceMotion ? (
        <div className="space-y-6">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div
                key={category.category}
                className="space-y-2 rounded-2xl border border-soft bg-[rgba(var(--color-card),0.7)] p-4 transition-colors"
              >
                <div className="flex items-center justify-between text-sm text-muted">
                  <p className="font-semibold">{category.category}</p>
                  <span className="text-xs uppercase tracking-[0.2em] text-subtle">{total === 0 ? 0 : Math.round((category.value / total) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-[rgba(var(--color-border),0.35)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${maxValue === 0 ? 0 : Math.max((category.value / maxValue) * 100, 4)}%`,
                      background: 'linear-gradient(90deg, rgba(var(--color-accent), 0.65), rgba(var(--color-accent), 1))'
                    }}
                    aria-hidden="true"
                  />
                </div>
                <p className="text-xs text-subtle">
                  {category.value.toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 0 })} interactions
                </p>
              </div>
            ))
          ) : (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="space-y-2 rounded-2xl border border-soft bg-[rgba(var(--color-card),0.7)] p-4 transition-colors"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="h-4 w-28 rounded-full bg-[rgba(var(--color-border),0.35)]" />
                    <div className="h-3 w-12 rounded-full bg-[rgba(var(--color-border),0.35)]" />
                  </div>
                  <div className="h-2 rounded-full bg-[rgba(var(--color-border),0.35)]" />
                  <div className="h-3 w-20 rounded-full bg-[rgba(var(--color-border),0.35)]" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        fadeContent
      )}
    </div>
  );
}
