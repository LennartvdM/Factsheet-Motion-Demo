import { useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { FocusScope } from './FocusScope';
import { FigureChart } from './FigureChart';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import type { ChartFigure } from '../types/ChartFigure';
import { createTextLayers } from '../utils/textFold';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface FigureCardProps {
  fig: ChartFigure;
  onOpen?: (fig: ChartFigure) => void;
  onClose?: (fig: ChartFigure) => void;
  showOverlay?: boolean;
}

export function FigureCard({ fig, onOpen, onClose, showOverlay = true }: FigureCardProps) {
  const textLayers = useMemo(() => createTextLayers(fig), [fig]);
  const [isOpen, setIsOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardId = `figure-${fig.id ?? fig.label.replace(/\s+/g, '-').toLowerCase()}`;
  const shouldManageOverlay = showOverlay !== false;

  useLockBodyScroll(shouldManageOverlay && isOpen);

  const handleOpen = () => {
    if (shouldManageOverlay) {
      setIsOpen(true);
    }
    onOpen?.(fig);
  };

  const handleClose = () => {
    if (shouldManageOverlay) {
      setIsOpen(false);
    }
    onClose?.(fig);
  };

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const overlayContent = shouldManageOverlay && isOpen ? (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(var(--color-overlay),0.75)] p-4 backdrop-blur sm:items-center"
      onClick={handleOverlayClick}
    >
      <FocusScope onClose={handleClose} initialFocusRef={headingRef} className="flex w-full justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${cardId}-dialog-label ${cardId}-dialog-title`}
          className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-strong bg-[rgba(var(--color-card),0.95)] text-[rgb(var(--color-text))] shadow-2xl shadow-[rgba(var(--color-overlay),0.35)] max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)]"
        >
          <div className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-h-[calc(100vh-4rem)]" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="sticky top-0 z-10 flex justify-end border-b border-soft bg-[rgba(var(--color-card),0.98)] px-8 py-5">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full bg-[rgba(var(--color-surface-muted),0.85)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted transition hover:bg-[rgba(var(--color-surface-muted),1)] hover:text-[rgb(var(--color-text))] focus:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(var(--color-accent),0.65)] focus-visible:ring-offset-1 focus-visible:ring-offset-[rgba(var(--color-card),0.85)]"
              >
                Close
              </button>
            </div>
            <div className="space-y-4 px-8 pb-8 pt-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted" id={`${cardId}-dialog-label`}>
                  {fig.label}
                </p>
                <h2
                  id={`${cardId}-dialog-title`}
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-4xl font-semibold"
                >
                  {textLayers.headline}
                </h2>
              </div>
              <div className="space-y-3 text-base leading-relaxed text-muted">
                {textLayers.narrative.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <div className="rounded-3xl border border-soft bg-[rgba(var(--color-card),0.85)] p-4">
                <FigureChart fig={fig} />
              </div>
            </div>
          </div>
        </div>
      </FocusScope>
    </div>
  ) : null;

  return (
    <>
      <article
        className="h-full"
        title={textLayers.tooltip}
        aria-labelledby={`${cardId}-label`}
        aria-describedby={`${cardId}-headline`}
      >
        <Card className="group flex h-full flex-col gap-6 text-left hover:border-[rgba(var(--color-border),0.85)] hover:bg-[rgba(var(--color-card),0.9)]">
          <div className="space-y-3">
            <span id={`${cardId}-label`} className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              {fig.label}
            </span>
            <p id={`${cardId}-headline`} className="text-3xl font-semibold text-[rgb(var(--color-text))]">
              {textLayers.headline}
            </p>
            <p className="text-sm leading-relaxed text-subtle transition-colors group-hover:text-muted">
              {textLayers.summary}
            </p>
          </div>
          <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-soft bg-[rgba(var(--color-card),0.6)] p-4">
            <FigureChart fig={fig} />
          </div>
          <div className="flex items-center justify-end">
            <Button variant="ghost" type="button" onClick={handleOpen}>
              More info
            </Button>
          </div>
        </Card>
      </article>

      {overlayContent ? <OverlayPortal>{overlayContent}</OverlayPortal> : null}
    </>
  );
}

function OverlayPortal({ children }: { children: ReactNode }) {
  if (typeof document === 'undefined') {
    return <>{children}</>;
  }

  return createPortal(children, document.body);
}

export default FigureCard;
