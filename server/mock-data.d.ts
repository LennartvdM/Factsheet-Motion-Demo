import type { Factset } from '../src/types';

export function createSeededRandom(seed?: number): () => number;
export function generateInitialFactset(seed?: number | (() => number)): Factset;
export function nextTick(previous: Factset, seed?: number | (() => number)): Factset;
export function createMockStream(seed?: number): {
  getInitial(): Factset;
  next(): Factset;
};
