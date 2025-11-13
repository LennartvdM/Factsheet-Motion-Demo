import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { FocusScope } from './FocusScope';
import { FigureChart } from './FigureChart';
import { Button } from './ui/Button';
import type { ChartFigure } from '../types/ChartFigure';
import { createTextLayers } from '../utils/textFold';

interface FigureCardProps {
  fig: ChartFigure;
}

const spring = {
  type: 'spring',
  stiffness: 260,
  damping: 26,
};

export function FigureCard({ fig }: FigureCardProps) {
  const textLayers = useMemo(() => createTextLayers(fig), [fig]);
  const [isOpen, setIsOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardId = `figure-${fig.id ?? fig.label.replace(/\s+/g, '-').toLowerCase()}`;

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') {
      return;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <motion.article
        layout
        whileHover={{ translateY: -4 }}
        transition={spring}
        className="group flex h-full flex-col gap-6 overflow-hidden rounded-3xl border border-soft bg-[rgba(var(--color-card),0.75)] p-6 text-left shadow-lg shadow-[rgba(var(--color-overlay),0.2)] backdrop-blur transition-colors hover:border-[rgba(var(--color-border),0.85)] hover:bg-[rgba(var(--color-card),0.9)]"
        title={textLayers.tooltip}
        aria-labelledby={`${cardId}-label`}
        aria-describedby={`${cardId}-headline`}
      >
        <div className="space-y-3">
          <span id={`${cardId}-label`} className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            {fig.label}
          </span>
          <motion.p
            id={`${cardId}-headline`}
            layout
            className="text-3xl font-semibold text-[rgb(var(--color-text))]"
          >
            {textLayers.headline}
          </motion.p>
          <p className="text-sm leading-relaxed text-subtle transition-colors group-hover:text-muted">
            {textLayers.overlay}
          </p>
        </div>
        <motion.div layout className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-soft bg-[rgba(var(--color-card),0.6)] p-4">
          <FigureChart fig={fig} />
        </motion.div>
        <div className="flex items-center justify-end">
          <Button variant="ghost" type="button" onClick={() => setIsOpen(true)}>
            More info
          </Button>
        </div>
      </motion.article>

      <AnimatePresence>
        {isOpen ? (
          <OverlayPortal key="figure-overlay">
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(var(--color-overlay),0.75)] p-4 backdrop-blur"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleOverlayClick}
            >
              <FocusScope onClose={() => setIsOpen(false)} initialFocusRef={headingRef}>
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={`${cardId}-dialog-title`}
                  className="relative w-full max-w-3xl space-y-6 rounded-3xl border border-strong bg-[rgba(var(--color-card),0.95)] p-8 text-[rgb(var(--color-text))] shadow-2xl shadow-[rgba(var(--color-overlay),0.35)]"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 24 }}
                  transition={spring}
                >
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="absolute right-5 top-5 rounded-full bg-[rgba(var(--color-surface-muted),0.85)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted transition hover:bg-[rgba(var(--color-surface-muted),1)] hover:text-[rgb(var(--color-text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-card))]"
                  >
                    Close
                  </button>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h2
                        id={`${cardId}-dialog-title`}
                        ref={headingRef}
                        tabIndex={-1}
                        className="text-sm font-semibold uppercase tracking-[0.3em] text-muted"
                      >
                        {fig.label}
                      </h2>
                      <p className="text-4xl font-semibold">{textLayers.headline}</p>
                    </div>
                    <div className="space-y-3 text-base leading-relaxed text-muted">
                      <p>{textLayers.overlay}</p>
                      <p>{textLayers.paragraph}</p>
                    </div>
                    <div className="rounded-3xl border border-soft bg-[rgba(var(--color-card),0.85)] p-4">
                      <FigureChart fig={fig} />
                    </div>
                  </div>
                </motion.div>
              </FocusScope>
            </motion.div>
          </OverlayPortal>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function OverlayPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === 'undefined') {
    return <>{children}</>;
  }

  return createPortal(children, document.body);
}

export default FigureCard;
