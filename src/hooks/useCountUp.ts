import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from its previous value to a new target.
 * Returns the current interpolated value that can be formatted for display.
 *
 * Uses requestAnimationFrame for smooth 60fps animation.
 * Respects reduced motion by snapping immediately.
 */
export function useCountUp(
  target: number,
  opts: { duration?: number; reduceMotion?: boolean } = {},
): number {
  const { duration = 600, reduceMotion = false } = opts;
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = target;

    if (reduceMotion || from === target) {
      setDisplay(target);
      return;
    }

    const delta = target - from;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + delta * eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, reduceMotion]);

  return display;
}
