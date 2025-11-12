import type { Factset } from '../types';
import {
  createSeededRandom as createSeededRandomImpl,
  createMockStream as createMockStreamImpl,
  generateInitialFactset as generateInitialFactsetImpl,
  nextTick as nextTickImpl
} from '../../server/mock-data.js';

export const createSeededRandom: (seed?: number) => () => number = createSeededRandomImpl;

export function generateInitialFactset(seed?: number | (() => number)): Factset {
  return generateInitialFactsetImpl(seed) as Factset;
}

export function nextTick(previous: Factset, seed?: number | (() => number)): Factset {
  return nextTickImpl(previous, seed) as Factset;
}

export function createMockStream(seed?: number) {
  const stream = createMockStreamImpl(seed);

  return {
    getInitial(): Factset {
      return stream.getInitial() as Factset;
    },
    next(): Factset {
      return stream.next() as Factset;
    }
  };
}
