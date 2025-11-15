import { useEffect } from 'react';

type BodyLockSnapshot = {
  overflow: string;
  paddingRight: string;
  overscrollBehavior: string;
};

let lockCount = 0;
let snapshot: BodyLockSnapshot | null = null;

function lockBodyScroll() {
  if (typeof document === 'undefined') {
    return;
  }

  const { body, documentElement } = document;

  if (lockCount === 0) {
    snapshot = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      overscrollBehavior: body.style.overscrollBehavior,
    };

    const scrollBarWidth = window.innerWidth - documentElement.clientWidth;
    const computedPaddingRight = window.getComputedStyle(body).paddingRight;
    const numericPaddingRight = Number.parseFloat(computedPaddingRight) || 0;

    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'contain';

    if (scrollBarWidth > 0) {
      body.style.paddingRight = `${numericPaddingRight + scrollBarWidth}px`;
    }
  }

  lockCount += 1;
}

function unlockBodyScroll() {
  if (typeof document === 'undefined') {
    return;
  }

  lockCount = Math.max(0, lockCount - 1);

  if (lockCount === 0 && snapshot) {
    const { body } = document;

    body.style.overflow = snapshot.overflow;
    body.style.paddingRight = snapshot.paddingRight;
    body.style.overscrollBehavior = snapshot.overscrollBehavior;

    snapshot = null;
  }
}

export function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active || typeof document === 'undefined') {
      return;
    }

    lockBodyScroll();

    return () => {
      unlockBodyScroll();
    };
  }, [active]);
}

export default useLockBodyScroll;
