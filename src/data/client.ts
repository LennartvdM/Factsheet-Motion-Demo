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

  let timer: ReturnType<typeof setTimeout> = setTimeout(tick, 3000 + Math.random() * 2000);

  return () => {
    isActive = false;
    clearTimeout(timer);
  };
}

export function subscribeFacts(onMessage: Subscription): Unsubscribe {
  if (typeof window === 'undefined' || typeof window.EventSource === 'undefined') {
    return startFallbackSubscription(onMessage);
  }

  let eventSource: EventSource | null = null;
  let unsubscribeFallback: Unsubscribe | undefined;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let reconnectAttempts = 0;
  let isClosed = false;

  const startFallback = () => {
    if (!unsubscribeFallback) {
      unsubscribeFallback = startFallbackSubscription(onMessage);
    }
  };

  const stopFallback = () => {
    if (unsubscribeFallback) {
      unsubscribeFallback();
      unsubscribeFallback = undefined;
    }
  };

  const cleanupEventSource = () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };

  const scheduleReconnect = () => {
    if (isClosed) {
      return;
    }

    reconnectAttempts += 1;
    const delay = Math.min(30000, 1000 * 2 ** (reconnectAttempts - 1));
    reconnectTimer = setTimeout(() => {
      reconnectTimer = undefined;
      connect();
    }, delay);
  };

  const handleMessage = (event: MessageEvent<string>) => {
    try {
      const payload = JSON.parse(event.data) as Factset;
      stopFallback();
      onMessage(payload);
    } catch (error) {
      console.error('[client] Failed to parse SSE payload', error);
    }
  };

  const connect = () => {
    cleanupEventSource();

    try {
      eventSource = new EventSource('/sse');
    } catch (error) {
      console.error('[client] Failed to establish SSE connection', error);
      startFallback();
      scheduleReconnect();
      return;
    }

    reconnectAttempts = 0;

    eventSource.onopen = () => {
      reconnectAttempts = 0;
      stopFallback();
    };

    eventSource.onmessage = handleMessage;

    eventSource.onerror = () => {
      console.warn('[client] SSE connection error, attempting to reconnect');
      startFallback();
      if (eventSource) {
        eventSource.close();
      }
      scheduleReconnect();
    };
  };

  connect();

  return () => {
    isClosed = true;
    cleanupEventSource();
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    stopFallback();
  };
}
