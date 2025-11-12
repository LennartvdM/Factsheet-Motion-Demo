import { type ReactNode, useEffect, useRef } from 'react';

type FocusScopeProps = {
  children: ReactNode;
  onClose?: () => void;
};

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const isHTMLElement = (value: Element | null | undefined): value is HTMLElement =>
  !!value && value instanceof HTMLElement;

const getFocusableElements = (container: HTMLElement) => {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
    (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1
  );
};

export function FocusScope({ children, onClose }: FocusScopeProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    previouslyFocusedElementRef.current = isHTMLElement(document.activeElement)
      ? document.activeElement
      : null;

    const node = scopeRef.current;

    if (!node) {
      return;
    }

    const focusInitialElement = () => {
      const focusable = getFocusableElements(node);

      if (focusable.length > 0) {
        focusable[0].focus({ preventScroll: true });
        return;
      }

      node.focus({ preventScroll: true });
    };

    focusInitialElement();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusableElements(node);

      if (focusable.length === 0) {
        event.preventDefault();
        node.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const isShiftPressed = event.shiftKey;
      const activeElement = document.activeElement as HTMLElement | null;

      if (!isShiftPressed && activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
        return;
      }

      if (isShiftPressed && activeElement === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      }
    };

    node.addEventListener('keydown', handleKeyDown);

    return () => {
      node.removeEventListener('keydown', handleKeyDown);

      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus({ preventScroll: true });
      }
    };
  }, [onClose]);

  return (
    <div ref={scopeRef} tabIndex={-1}>
      {children}
    </div>
  );
}

export default FocusScope;
