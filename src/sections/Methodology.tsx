import { AnimatePresence, motion } from 'framer-motion';

import { Segmented } from '../components/ui/Segmented';
import { VisuallyHidden } from '../components/ui/VisuallyHidden';
import { cn } from '../lib/cn';
import type { Factset } from '../types';

type Option = {
  label: string;
  value: string;
};

type MethodologyProps = {
  selectedYear: string;
  yearOptions: Option[];
  onYearChange: (value: string) => void;
  shouldReduceMotion: boolean;
  facts: Factset | null;
};

const yearContext: Record<string, string> = {
  '2022': 'The 2022 measurement marks the first year after the revised Charter framework was introduced, establishing new baselines across all dimensions.',
  '2023': 'In 2023, organisations reported under the updated methodology for the second year, enabling the first year-on-year comparisons under the new framework.',
  '2024': 'The 2024 measurement cycle covers 84 charter organisations, with data collected through self-assessment surveys validated against HR registration systems.',
};

const methodologyItems = [
  {
    title: 'Self-assessment survey',
    description: 'Charter organisations complete an annual self-assessment covering gender representation at top, subtop, and full organisation levels, plus a maturity assessment across six inclusion-policy dimensions.',
  },
  {
    title: 'Inclusion dimensions',
    description: 'Policy maturity is scored on a 1\u20135 scale across Leadership, Strategy & Management, HR Management, Communication, Knowledge & Skills, and Climate. Scores reflect the phase of implementation from orientation (1) to full integration (5).',
  },
  {
    title: 'Representation metrics',
    description: 'Women\u2019s representation is measured as the percentage of women in the board of directors (rvb), supervisory board (rvc), and advisory board (rvt), as well as the broader top, subtop, and full organisation levels.',
  },
  {
    title: 'Cohort comparison',
    description: 'Organisations are compared by charter tenure: founding members (pre-2019) versus newer signatories (2019+), allowing analysis of whether sustained commitment correlates with stronger outcomes.',
  },
];

export function Methodology({
  selectedYear,
  yearOptions,
  onYearChange,
  shouldReduceMotion,
  facts,
}: MethodologyProps) {
  const fadeContent = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${selectedYear}-${facts ? facts.generatedAt : 'loading'}`}
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.92 }}
        transition={shouldReduceMotion ? undefined : { duration: 0.24, ease: 'easeOut' }}
        className="space-y-6"
      >
        <p className="text-sm text-muted">{yearContext[selectedYear] ?? yearContext['2024']}</p>
        <ul className="space-y-3">
          {methodologyItems.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-soft bg-[rgba(var(--color-card),0.7)] p-4 transition-colors"
            >
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-subtle">{item.description}</p>
            </li>
          ))}
        </ul>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Methodology</h2>
          <p className="text-sm text-subtle">
            How the Charter Diversity Monitor collects and measures diversity data.
          </p>
        </div>
        <div role="group" aria-labelledby="methodology-year-label">
          <VisuallyHidden id="methodology-year-label">Select measurement year</VisuallyHidden>
          <Segmented
            options={yearOptions}
            value={selectedYear}
            onValueChange={onYearChange}
            ariaLabelledBy="methodology-year-label"
          />
        </div>
      </section>
      {shouldReduceMotion ? (
        <div className="space-y-6">
          <p className="text-sm text-muted">{yearContext[selectedYear] ?? yearContext['2024']}</p>
          <ul className="space-y-3">
            {methodologyItems.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-soft bg-[rgba(var(--color-card),0.7)] p-4 transition-colors"
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-subtle">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        fadeContent
      )}
    </div>
  );
}
