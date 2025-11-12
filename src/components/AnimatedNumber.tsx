import { useEffect, useMemo, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

type AnimatedNumberProps = {
  value: number;
  format?: (value: number) => string;
  duration?: number;
  shouldReduceMotion?: boolean;
};

const defaultFormatter = (input: number): string =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(input);

export function AnimatedNumber({
  value,
  format = defaultFormatter,
  duration = 0.6,
  shouldReduceMotion,
}: AnimatedNumberProps) {
  const reduceMotionPreference = useReducedMotion();
  const resolvedShouldReduceMotion = shouldReduceMotion ?? reduceMotionPreference ?? false;
  const nodeRef = useRef<HTMLSpanElement>(null);
  const previousValue = useRef(value);
  const formattedValue = useMemo(() => format(value), [format, value]);

  useEffect(() => {
    const element = nodeRef.current;
    if (!element) {
      return;
    }

    if (resolvedShouldReduceMotion) {
      element.textContent = format(value);
      previousValue.current = value;
      return;
    }

    const controls = animate(previousValue.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        if (!nodeRef.current) {
          return;
        }
        nodeRef.current.textContent = format(latest);
      },
    });

    previousValue.current = value;

    return () => {
      controls.stop();
    };
  }, [value, format, duration, resolvedShouldReduceMotion]);

  useEffect(() => {
    const element = nodeRef.current;
    if (!element) {
      return;
    }
    element.textContent = format(previousValue.current);
  }, [format]);

  return <span ref={nodeRef}>{formattedValue}</span>;
}

export default AnimatedNumber;
