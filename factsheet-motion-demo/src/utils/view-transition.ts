export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined" || typeof window.matchMedia === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const startViewTransition = (callback: () => void): void => {
  if (prefersReducedMotion()) {
    callback();
    return;
  }

  const viewTransition = (document as Document & {
    startViewTransition?: (updateCallback: () => void) => { finished: Promise<void> };
  }).startViewTransition;

  if (typeof viewTransition === "function") {
    void viewTransition(callback).finished.catch(() => {
      callback();
    });
    return;
  }

  callback();
};

export const assignViewTransitionName = (
  element: HTMLElement | null,
  name: string
): void => {
  if (!element) {
    return;
  }

  element.style.setProperty("view-transition-name", name);
};
