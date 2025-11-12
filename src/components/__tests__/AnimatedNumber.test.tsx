import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Root } from 'react-dom/client';

import { AnimatedNumber } from '../AnimatedNumber';

const mocks = vi.hoisted(() => ({
  animateMock: vi.fn<
    [number, number, { onUpdate?: (value: number) => void } | undefined],
    { stop: () => void }
  >(),
  useReducedMotionMock: vi.fn<[], boolean | undefined>(),
}));

vi.mock('framer-motion', () => ({
  animate: mocks.animateMock,
  useReducedMotion: mocks.useReducedMotionMock,
}));

const format = (value: number) => value.toFixed(0);

describe('AnimatedNumber', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    mocks.animateMock.mockReset();
    mocks.useReducedMotionMock.mockReset();
    mocks.animateMock.mockImplementation((_from, to, options) => {
      if (options?.onUpdate) {
        options.onUpdate(to);
      }
      return { stop: vi.fn() };
    });
  });

  afterEach(() => {
    root.unmount();
    container.remove();
  });

  it('updates instantly when reduced motion is enabled', () => {
    mocks.useReducedMotionMock.mockReturnValue(true);

    act(() => {
      root.render(<AnimatedNumber value={100} format={format} />);
    });

    expect(container.textContent).toBe('100');

    act(() => {
      root.render(<AnimatedNumber value={200} format={format} />);
    });

    expect(container.textContent).toBe('200');
    expect(mocks.animateMock).not.toHaveBeenCalled();
  });

  it('animates values when motion is allowed', () => {
    mocks.useReducedMotionMock.mockReturnValue(false);

    act(() => {
      root.render(<AnimatedNumber value={100} format={format} />);
    });

    mocks.animateMock.mockClear();

    act(() => {
      root.render(<AnimatedNumber value={250} format={format} />);
    });

    expect(mocks.animateMock).toHaveBeenCalledTimes(1);
    const [from, to] = mocks.animateMock.mock.calls[0];
    expect(from).toBe(100);
    expect(to).toBe(250);
    expect(container.textContent).toBe('250');
  });
});
