declare module 'vitest' {
  type TestCallback = () => unknown | Promise<unknown>;

  export const describe: (name: string, fn: TestCallback) => void;
  export const it: (name: string, fn: TestCallback) => void;
  export const beforeEach: (fn: TestCallback) => void;
  export const afterEach: (fn: TestCallback) => void;

  interface MockState<TArgs extends unknown[]> {
    calls: TArgs[];
  }

  interface MockFunction<TArgs extends unknown[] = unknown[], TReturn = unknown> {
    (...args: TArgs): TReturn;
    mockClear(): void;
    mockReset(): void;
    mockImplementation(impl: (...args: TArgs) => TReturn): MockFunction<TArgs, TReturn>;
    mockReturnValue(value: TReturn): MockFunction<TArgs, TReturn>;
    readonly mock: MockState<TArgs>;
  }

  export const vi: {
    fn<TArgs extends unknown[] = unknown[], TReturn = unknown>(
      impl?: (...args: TArgs) => TReturn
    ): MockFunction<TArgs, TReturn>;
    mock(moduleId: string, factory: () => unknown): void;
    hoisted<T>(factory: () => T): T;
  };

  interface Matcher<T> {
    toBe(expected: T): void;
    toBeDefined(): void;
    toHaveBeenCalled(): void;
    toHaveBeenCalledTimes(expected: number): void;
  }

  interface Expectation<T> extends Matcher<T> {
    not: Matcher<T>;
  }

  export function expect<T>(value: T): Expectation<T>;
}
