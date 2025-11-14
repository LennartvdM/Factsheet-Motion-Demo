import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { FigureCard } from '../components/FigureCard';
import { FigureChart } from '../components/FigureChart';
import { FocusScope } from '../components/FocusScope';
import type { ChartFigure } from '../types/ChartFigure';
import { allFigures } from '../data/figures';
import { createTextLayers } from '../utils/textFold';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

type FiguresSectionProps = {
  shouldReduceMotion?: boolean;
};

const overlaySpring = {
  type: 'spring',
  stiffness: 260,
  damping: 28
};

export function Figures({ shouldReduceMotion = false }: FiguresSectionProps) {
  const figures = useMemo(() => {
    return [...allFigures]
      .sort((left, right) => {
        const leftIndex = parseInt(left.id.replace(/[^0-9]/g, ''), 10);
        const rightIndex = parseInt(right.id.replace(/[^0-9]/g, ''), 10);

        if (Number.isNaN(leftIndex) || Number.isNaN(rightIndex)) {
          return left.id.localeCompare(right.id);
        }

        return leftIndex - rightIndex;
      })
      .slice(0, 18);
  }, []);

  const [selectedFigure, setSelectedFigure] = useState<ChartFigure | null>(null);

  const openPanel = useCallback((fig: ChartFigure) => {
    setSelectedFigure(fig);
  }, []);

  const closePanel = useCallback(() => {
    setSelectedFigure(null);
  }, []);

  return (
    <section aria-labelledby="figures-section-heading" className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-subtle">Figures</p>
        <h2 id="figures-section-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Visual narratives powering the dashboard
        </h2>
        <p className="max-w-2xl text-sm text-subtle">
          Dive into the complete gallery of charts informing the factsheet. Select a figure to reveal its detailed story and
          chart breakdown.
        </p>
      </header>

      <div className="rounded-3xl border border-strong bg-[rgba(var(--color-card),0.78)] p-6 shadow-2xl shadow-[rgba(var(--color-overlay),0.25)] backdrop-blur">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {figures.map((figure) => (
            <FigureCard key={figure.id} fig={figure} showOverlay={false} onOpen={openPanel} />
          ))}
        </div>
      </div>

      <PanelOverlay figure={selectedFigure} onClose={closePanel} shouldReduceMotion={shouldReduceMotion} />
    </section>
  );
}

type PanelOverlayProps = {
  figure: ChartFigure | null;
  onClose: () => void;
  shouldReduceMotion: boolean;
};

function PanelOverlay({ figure, onClose, shouldReduceMotion }: PanelOverlayProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textLayers = useMemo(() => (figure ? createTextLayers(figure) : null), [figure]);

  useLockBodyScroll(Boolean(figure));

  const handleOverlayClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const overlayContent = !figure ? null : (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-end bg-[rgba(var(--color-overlay),0.6)] backdrop-blur"
      initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: shouldReduceMotion ? 1 : 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      onClick={handleOverlayClick}
    >
      <FocusScope onClose={onClose} initialFocusRef={headingRef} className="flex h-full w-full justify-end">
        <motion.aside
          key={figure.id}
          role="dialog"
          aria-modal="true"
          aria-labelledby="factsheet-panel-title"
          className="relative flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-strong bg-[rgba(var(--color-card),0.94)] text-left text-[rgb(var(--color-text))] shadow-2xl shadow-[rgba(var(--color-overlay),0.35)] backdrop-blur"
          initial={{ x: shouldReduceMotion ? 0 : '100%' }}
          animate={{ x: 0 }}
          exit={{ x: shouldReduceMotion ? 0 : '100%' }}
          transition={shouldReduceMotion ? { duration: 0 } : overlaySpring}
        >
          <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="sticky top-0 z-10 border-b border-soft bg-[rgba(var(--color-card),0.97)] px-10 pb-5 pt-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">{figure.label}</p>
                  <h2 id="factsheet-panel-title" ref={headingRef} tabIndex={-1} className="text-3xl font-semibold">
                    {textLayers?.headline ?? figure.title ?? figure.label}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="self-start rounded-full bg-[rgba(var(--color-surface-muted),0.85)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted transition hover:bg-[rgba(var(--color-surface-muted),1)] hover:text-[rgb(var(--color-text))] focus:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(var(--color-accent),0.65)] focus-visible:ring-offset-1 focus-visible:ring-offset-[rgba(var(--color-card),0.85)]"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="space-y-4 px-10 pb-10 pt-6">
              {textLayers ? (
                <div className="space-y-4 text-base leading-relaxed text-muted">
                  {textLayers.narrative.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
              <div className="rounded-3xl border border-soft bg-[rgba(var(--color-card),0.85)] p-4">
                <FigureChart fig={figure} />
              </div>
            </div>
          </div>
        </motion.aside>
      </FocusScope>
    </motion.div>
  );

  if (typeof document === 'undefined') {
    return overlayContent;
  }

  return createPortal(<AnimatePresence>{overlayContent}</AnimatePresence>, document.body);
}

export default Figures;
