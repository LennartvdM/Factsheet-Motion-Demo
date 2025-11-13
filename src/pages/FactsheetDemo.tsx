import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { FigureCard } from '../components/FigureCard';
import { FocusScope } from '../components/FocusScope';
import { FigureChart } from '../components/FigureChart';
import { Container } from '../components/ui/Container';
import type { ChartFigure } from '../types/ChartFigure';
import { allFigures } from '../data/figures';
import { createTextLayers } from '../utils/textFold';

const overlaySpring = {
  type: 'spring',
  stiffness: 260,
  damping: 28,
};

export function FactsheetDemo() {
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

  useEffect(() => {
    if (!selectedFigure || typeof document === 'undefined') {
      return;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [selectedFigure]);

  const openPanel = useCallback((fig: ChartFigure) => {
    setSelectedFigure(fig);
  }, []);

  const closePanel = useCallback(() => {
    setSelectedFigure(null);
  }, []);

  return (
    <div className="min-h-screen bg-[rgb(var(--color-surface))] py-16">
      <Container className="space-y-12">
        <header className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted">
            Factsheet Demo
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[rgb(var(--color-text))] md:text-5xl">
            Project Insights Overview
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted">
            Explore the complete collection of figures powering the interactive factsheet.
            Select any chart to reveal a detailed breakdown in the side panel.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {figures.map((figure) => (
            <FigureCard
              key={figure.id}
              fig={figure}
              showOverlay={false}
              onOpen={openPanel}
            />
          ))}
        </div>
      </Container>

      <PanelOverlay figure={selectedFigure} onClose={closePanel} />
    </div>
  );
}

function PanelOverlay({ figure, onClose }: { figure: ChartFigure | null; onClose: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textLayers = useMemo(() => (figure ? createTextLayers(figure) : null), [figure]);

  const handleOverlayClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const overlayContent = !figure ? null : (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-end bg-[rgba(var(--color-overlay),0.6)] backdrop-blur"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleOverlayClick}
    >
      <FocusScope onClose={onClose} initialFocusRef={headingRef}>
        <motion.aside
          key={figure.id}
          role="dialog"
          aria-modal="true"
          aria-labelledby="factsheet-panel-title"
          className="relative flex h-full w-full max-w-xl flex-col gap-6 overflow-y-auto border-l border-soft bg-[rgba(var(--color-card),0.97)] p-10 text-left text-[rgb(var(--color-text))] shadow-2xl"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={overlaySpring}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-8 top-6 rounded-full bg-[rgba(var(--color-surface-muted),0.85)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted transition hover:bg-[rgba(var(--color-surface-muted),1)] hover:text-[rgb(var(--color-text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-card))]"
          >
            Close
          </button>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                {figure.label}
              </p>
              <h2
                id="factsheet-panel-title"
                ref={headingRef}
                tabIndex={-1}
                className="text-3xl font-semibold"
              >
                {textLayers?.headline ?? figure.title ?? figure.label}
              </h2>
            </div>
            {textLayers ? (
              <div className="space-y-4 text-base leading-relaxed text-muted">
                <p>{textLayers.overlay}</p>
                <p>{textLayers.paragraph}</p>
              </div>
            ) : null}
            <div className="rounded-3xl border border-soft bg-[rgba(var(--color-card),0.85)] p-4">
              <FigureChart fig={figure} />
            </div>
          </div>
        </motion.aside>
      </FocusScope>
    </motion.div>
  );

  if (typeof document === 'undefined') {
    return overlayContent;
  }

  return createPortal(
    <AnimatePresence>{overlayContent}</AnimatePresence>,
    document.body,
  );
}

export default FactsheetDemo;
