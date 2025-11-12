type Factset = import('./types').Factset;

declare module '../../server/mock-data' {
  export function createSeededRandom(seed?: number): () => number;
  export function generateInitialFactset(seed?: number | (() => number)): Factset;
  export function nextTick(previous: Factset, seed?: number | (() => number)): Factset;
  export function createMockStream(seed?: number): {
    getInitial(): Factset;
    next(): Factset;
  };
}

declare module '../../server/mock-data.js' {
  export * from '../../server/mock-data';
}
