import type { Factset } from '../types';
import { createMockStream } from './mock';

const FALLBACK_STREAM = createMockStream();

export async function getInitialFacts(): Promise<Factset> {
  if (typeof fetch === 'undefined') {
    return FALLBACK_STREAM.getInitial();
  }

  try {
    const response = await fetch('/facts');
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as Factset;
  } catch (error) {
    console.warn('[client] Falling back to mock initial facts:', error);
    return FALLBACK_STREAM.getInitial();
  }
}

type Subscription = (message: Factset) => void;

type Unsubscribe = () => void;

function startFallbackSubscription(onMessage: Subscription): Unsubscribe {
  let isActive = true;

  const tick = () => {
    if (!isActive) {
      return;
    }

    onMessage(FALLBACK_STREAM.next());
    const timeout = 3000 + Math.random() * 2000;
    timer = setTimeout(tick, timeout);
  };

  let timer = setTimeout(tick, 3000 + Math.random() * 2000);

  return () => {
    isActive = false;
    clearTimeout(timer);
  };
}

export function subscribeFacts(onMessage: Subscription): Unsubscribe {
  if (typeof window === 'undefined' || typeof window.EventSource === 'undefined') {
    return startFallbackSubscription(onMessage);
  }

  const eventSource = new EventSource('/sse');
  const fallback = () => startFallbackSubscription(onMessage);
  let unsubscribeFallback: Unsubscribe | undefined;

  eventSource.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data) as Factset;
      onMessage(payload);
    } catch (error) {
      console.error('[client] Failed to parse SSE payload', error);
    }
  };

  eventSource.onerror = () => {
    console.warn('[client] SSE connection failed, switching to interval updates');
    eventSource.close();
    if (!unsubscribeFallback) {
      unsubscribeFallback = fallback();
    }
  };

  return () => {
    eventSource.close();
    if (unsubscribeFallback) {
      unsubscribeFallback();
    }
  };
}
