import { useEffect, useMemo, useRef, useState, type DependencyList } from 'react';

const DEFAULT_DURATION = 300;

function scheduleTimeout(callback: () => void, duration: number) {
  return window.setTimeout(callback, duration);
}

export function useTransientWillChange(
  deps: DependencyList,
  duration: number = DEFAULT_DURATION
): Record<string, string> | undefined {
  const [active, setActive] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    setActive(true);
    const timer = scheduleTimeout(() => setActive(false), duration);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return useMemo(() => (active ? { willChange: 'transform, opacity' } : undefined), [active]);
}
