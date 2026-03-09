import { AnimatePresence, motion } from 'framer-motion';

import { Segmented } from '../components/ui/Segmented';
import { VisuallyHidden } from '../components/ui/VisuallyHidden';
import { cn } from '../lib/cn';
import { useCountUp } from '../hooks/useCountUp';
import type { DimensionScore, Factset } from '../types';

type Option = { label: string; value: string };

type InclusionProps = {
  selectedYear: string;
  yearOptions: Option[];
  onYearChange: (value: string) => void;
  shouldReduceMotion: boolean;
  facts: Factset | null;
};

const MAX_SCORE = 5;

function DimensionBar({ dim, index, reduceMotion }: { dim: DimensionScore; index: number; reduceMotion: boolean }) {
  const animatedScore = useCountUp(dim.score, { reduceMotion, duration: 800 });
  const barWidth = Math.max((animatedScore / MAX_SCORE) * 100, 4);

  const content = (
    <div className="space-y-2 rounded-2xl border border-soft bg-[rgba(var(--color-card),0.7)] p-4 transition-colors">
      <div className="flex items-center justify-between text-sm text-muted">
        <p className="font-semibold">{dim.dimension}</p>
        <span className="tabular-nums text-xs uppercase tracking-[0.2em] text-subtle">
          {reduceMotion ? dim.score.toFixed(1) : animatedScore.toFixed(1)} / {MAX_SCORE}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[rgba(var(--color-border),0.35)]">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${barWidth}%`,
            background: 'linear-gradient(90deg, rgba(var(--color-accent), 0.65), rgba(var(--color-accent), 1))',
          }}
          aria-hidden="true"
        />
      </div>
      <p className="text-xs text-subtle">
        Inclusion policy maturity on a 1–{MAX_SCORE} scale
      </p>
    </div>
  );

  if (reduceMotion) return content;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
    >
      {content}
    </motion.div>
  );
}

export function Inclusion({ selectedYear, yearOptions, onYearChange, shouldReduceMotion, facts }: InclusionProps) {
  const dimensions = facts?.dimensions ?? [];
  const avgRaw = dimensions.length > 0
    ? dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
    : 0;
  const animatedAvg = useCountUp(avgRaw, { reduceMotion: shouldReduceMotion, duration: 800 });

  const dimensionCards = dimensions.length > 0 ? (
    <>
      <div className="rounded-2xl border border-soft bg-[rgba(var(--color-card),0.7)] p-4 transition-colors">
        <p className="text-sm font-semibold text-muted">Average maturity score</p>
        <p className="text-3xl font-semibold tabular-nums">
          {shouldReduceMotion ? avgRaw.toFixed(2) : animatedAvg.toFixed(2)}{' '}
          <span className="text-base font-normal text-subtle">/ {MAX_SCORE}</span>
        </p>
        <p className="text-xs text-subtle">Across all inclusion-policy dimensions</p>
      </div>
      {dimensions.map((dim, i) => (
        <DimensionBar key={dim.dimension} dim={dim} index={i} reduceMotion={shouldReduceMotion} />
      ))}
    </>
  ) : (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-2 rounded-2xl border border-soft bg-[rgba(var(--color-card),0.7)] p-4 transition-colors">
          <div className="flex items-center justify-between text-sm">
            <div className={cn('h-4 w-28 rounded-full bg-[rgba(var(--color-border),0.35)]', !shouldReduceMotion && 'animate-pulse')} />
            <div className={cn('h-3 w-12 rounded-full bg-[rgba(var(--color-border),0.35)]', !shouldReduceMotion && 'animate-pulse')} />
          </div>
          <div className={cn('h-2 rounded-full bg-[rgba(var(--color-border),0.35)]', !shouldReduceMotion && 'animate-pulse')} />
          <div className={cn('h-3 w-20 rounded-full bg-[rgba(var(--color-border),0.35)]', !shouldReduceMotion && 'animate-pulse')} />
        </div>
      ))}
    </div>
  );

  const body = <div className="space-y-6">{dimensionCards}</div>;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Inclusion Policy</h2>
          <p className="text-sm text-subtle">
            Maturity scores across the six dimensions of organisational inclusion policy.
          </p>
        </div>
        <div role="group" aria-labelledby="inclusion-year-label">
          <VisuallyHidden id="inclusion-year-label">Select measurement year</VisuallyHidden>
          <Segmented options={yearOptions} value={selectedYear} onValueChange={onYearChange} ariaLabelledBy="inclusion-year-label" />
        </div>
      </section>

      {shouldReduceMotion ? body : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${selectedYear}-${facts ? 'loaded' : 'loading'}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            {body}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
