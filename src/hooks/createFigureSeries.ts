import { useMemo } from 'react';

import type { ChartFigure } from '../types/ChartFigure';
import { inferSeriesSpecs } from '../types/ChartFigure';

type FigureSeries = {
  categories: Array<string | number | null>;
  series: Array<{
    key: string;
    label: string;
    values: Array<number | null>;
  }>;
};

export function useFigureSeries(fig: ChartFigure): FigureSeries {
  return useMemo(() => {
    const indexField = fig.indexField;
    const series = inferSeriesSpecs(fig);

    return {
      categories: fig.rows.map((row) => row[indexField] ?? null),
      series: series.map((spec) => ({
        key: spec.key,
        label: spec.label,
        values: fig.rows.map((row) => {
          const value = row[spec.key];

          if (typeof value === 'number') {
            return value;
          }

          if (value == null) {
            return null;
          }

          const numericValue = Number(value);

          return Number.isFinite(numericValue) ? numericValue : null;
        }),
      })),
    };
  }, [fig]);
}
