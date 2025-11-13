import { useEffect } from 'react';

export function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active || typeof document === 'undefined') {
      return;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const previousOverscrollBehavior = body.style.overscrollBehavior;

    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'contain';

    if (scrollBarWidth > 0) {
      body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      body.style.overscrollBehavior = previousOverscrollBehavior;
    };
  }, [active]);
}

export default useLockBodyScroll;
