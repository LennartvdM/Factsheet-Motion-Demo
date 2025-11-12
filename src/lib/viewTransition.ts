export const PREFERS_REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const getDocument = () => (typeof document === 'undefined' ? undefined : document);

const isReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
};

const supportsViewTransition = (
  doc: Document | undefined
): doc is Document & {
  startViewTransition: NonNullable<Document['startViewTransition']>;
} => !!doc && typeof doc.startViewTransition === 'function';

export const withViewTransition = (cb: () => void) => {
  const doc = getDocument();

  if (!supportsViewTransition(doc) || isReducedMotion()) {
    cb();
    return;
  }

  const transition = doc.startViewTransition(() => {
    cb();
  });

  return transition.finished;
};
