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
              <div key={category.category} className="space-y-2 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <p className="font-semibold text-white">{category.category}</p>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-600"
                    style={{ width: `${barWidth}%` }}
                    aria-hidden="true"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  {category.value.toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 0 })} interactions
                </p>
              </div>
            );
          })
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className={cn('h-4 w-28 rounded-full bg-slate-800/70', !shouldReduceMotion && 'animate-pulse')} />
                  <div className={cn('h-3 w-12 rounded-full bg-slate-800/70', !shouldReduceMotion && 'animate-pulse')} />
                </div>
                <div className={cn('h-2 rounded-full bg-slate-800/70', !shouldReduceMotion && 'animate-pulse')} />
                <div className={cn('h-3 w-20 rounded-full bg-slate-800/70', !shouldReduceMotion && 'animate-pulse')} />
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
          <h2 className="text-lg font-semibold text-white">Breakdown</h2>
          <p className="text-sm text-slate-400">Dive into category level performance and trending segments.</p>
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
              <div key={category.category} className="space-y-2 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <p className="font-semibold text-white">{category.category}</p>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{total === 0 ? 0 : Math.round((category.value / total) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-600"
                    style={{ width: `${maxValue === 0 ? 0 : Math.max((category.value / maxValue) * 100, 4)}%` }}
                    aria-hidden="true"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  {category.value.toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 0 })} interactions
                </p>
              </div>
            ))
          ) : (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="h-4 w-28 rounded-full bg-slate-800/70" />
                    <div className="h-3 w-12 rounded-full bg-slate-800/70" />
                  </div>
                  <div className="h-2 rounded-full bg-slate-800/70" />
                  <div className="h-3 w-20 rounded-full bg-slate-800/70" />
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
