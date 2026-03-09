import { useCallback, useEffect, useRef, useState } from 'react';
import { getInitialFacts, subscribeFacts } from '../data/client';
import type { Factset } from '../types';

type HighlightState = Record<string, boolean>;

type FactstreamResult = {
  facts: Factset | null;
  highlights: HighlightState;
  liveAnnouncement: string;
};

/**
 * Manages the SSE subscription, data updates, and change-highlight timers.
 * Extracted from App so the root component stays presentational.
 */
export function useFactstream(): FactstreamResult {
  const [facts, setFacts] = useState<Factset | null>(null);
  const [highlights, setHighlights] = useState<HighlightState>({});
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const triggerHighlight = useCallback((ids: string[]) => {
    if (ids.length === 0) return;

    setHighlights((prev) => {
      const next = { ...prev };
      for (const id of ids) next[id] = true;
      return next;
    });

    for (const id of ids) {
      if (timers.current[id]) clearTimeout(timers.current[id]);
      timers.current[id] = setTimeout(() => {
        setHighlights((prev) => {
          if (!prev[id]) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        });
        delete timers.current[id];
      }, 2000);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = subscribeFacts((update) => {
      setFacts((prev) => {
        if (!prev) return update;

        const changed = update.metrics
          .filter((m) => {
            const prior = prev.metrics.find((p) => p.id === m.id);
            return !prior || prior.value !== m.value;
          })
          .map((m) => m.id);

        if (changed.length > 0) {
          triggerHighlight(changed);
          const labels = update.metrics.filter((m) => changed.includes(m.id)).map((m) => m.label);
          const ts = new Date(update.generatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
          setLiveAnnouncement(`Data updated: ${labels.join(', ')} \u2022 ${ts}`);
        }

        return update;
      });
    });

    getInitialFacts()
      .then((initial) => { if (mounted) setFacts((c) => c ?? initial); })
      .catch((err) => console.error('[factstream] initial load failed', err));

    return () => {
      mounted = false;
      unsubscribe();
      Object.values(timers.current).forEach(clearTimeout);
      timers.current = {};
    };
  }, [triggerHighlight]);

  return { facts, highlights, liveAnnouncement };
}
