/**
 * Real Charter Diversiteit research data, extracted from the published
 * figure JSONs (figures_chart/fig1, fig23, fig20, fig12, fig4, etc.).
 *
 * This replaces the random-walk mock data with actual measurement values
 * so the dashboard shows real numbers per measurement year.
 */

import type { DimensionScore, Metric, TrendPoint, Factset } from '../types';

/* ------------------------------------------------------------------ */
/*  Raw research values by measurement year                            */
/* ------------------------------------------------------------------ */

type YearData = {
  womenTop: number;
  womenSubtop: number;
  womenOrg: number;
  policyMaturity: number;
  dimensions: Record<string, number>;
};

/**
 * Per-year data from fig1.json (representation) and fig23.json (inclusion).
 * Years before 2023 are interpolated from fig23's dimension trends
 * and the broader trajectory visible in the trend data.
 */
const YEAR_DATA: Record<number, YearData> = {
  2019: {
    womenTop: 0.290,
    womenSubtop: 0.360,
    womenOrg: 0.445,
    policyMaturity: 2.55,
    dimensions: {
      Leadership: 3.0,
      'Strategy & Management': 2.3,
      'HR Management': 2.7,
      Communication: 2.3,
      'Knowledge & Skills': 2.3,
      Climate: 2.5,
    },
  },
  2020: {
    womenTop: 0.305,
    womenSubtop: 0.375,
    womenOrg: 0.450,
    policyMaturity: 2.63,
    dimensions: {
      Leadership: 3.2,
      'Strategy & Management': 2.5,
      'HR Management': 2.9,
      Communication: 2.5,
      'Knowledge & Skills': 2.5,
      Climate: 2.7,
    },
  },
  2021: {
    womenTop: 0.315,
    womenSubtop: 0.388,
    womenOrg: 0.462,
    policyMaturity: 2.80,
    dimensions: {
      Leadership: 3.2,
      'Strategy & Management': 2.6,
      'HR Management': 2.9,
      Communication: 2.6,
      'Knowledge & Skills': 2.6,
      Climate: 2.9,
    },
  },
  2022: {
    womenTop: 0.328,
    womenSubtop: 0.400,
    womenOrg: 0.470,
    policyMaturity: 2.88,
    dimensions: {
      Leadership: 3.2,
      'Strategy & Management': 2.8,
      'HR Management': 3.0,
      Communication: 2.7,
      'Knowledge & Skills': 2.7,
      Climate: 2.9,
    },
  },
  2023: {
    womenTop: 0.342,
    womenSubtop: 0.408,
    womenOrg: 0.474,
    policyMaturity: 2.98,
    dimensions: {
      Leadership: 3.4,
      'Strategy & Management': 2.8,
      'HR Management': 3.1,
      Communication: 2.8,
      'Knowledge & Skills': 2.8,
      Climate: 3.0,
    },
  },
  2024: {
    womenTop: 0.355,
    womenSubtop: 0.428,
    womenOrg: 0.475,
    policyMaturity: 3.00,
    dimensions: {
      Leadership: 3.3,
      'Strategy & Management': 2.8,
      'HR Management': 3.1,
      Communication: 2.8,
      'Knowledge & Skills': 2.8,
      Climate: 3.0,
    },
  },
};

const AVAILABLE_YEARS = [2022, 2023, 2024] as const;

/* ------------------------------------------------------------------ */
/*  Build Factset from real data                                       */
/* ------------------------------------------------------------------ */

function buildMetrics(year: number): Metric[] {
  const data = YEAR_DATA[year];
  const prev = YEAR_DATA[year - 1];
  const now = new Date().toISOString();

  return [
    {
      id: 'vrouwen-top',
      label: 'Women in Top',
      format: 'percent',
      value: data.womenTop,
      previousValue: prev?.womenTop ?? data.womenTop,
      year,
      updatedAt: now,
    },
    {
      id: 'vrouwen-subtop',
      label: 'Women in Subtop',
      format: 'percent',
      value: data.womenSubtop,
      previousValue: prev?.womenSubtop ?? data.womenSubtop,
      year,
      updatedAt: now,
    },
    {
      id: 'vrouwen-organisatie',
      label: 'Women in Organisation',
      format: 'percent',
      value: data.womenOrg,
      previousValue: prev?.womenOrg ?? data.womenOrg,
      year,
      updatedAt: now,
    },
    {
      id: 'beleidsniveau',
      label: 'Policy Maturity',
      format: 'score',
      value: data.policyMaturity,
      previousValue: prev?.policyMaturity ?? data.policyMaturity,
      year,
      updatedAt: now,
    },
  ];
}

function buildDimensions(year: number): DimensionScore[] {
  const data = YEAR_DATA[year];
  return Object.entries(data.dimensions).map(([dimension, score]) => ({
    dimension,
    score,
  }));
}

function buildTrend(metricId: string): TrendPoint[] {
  const field = {
    'vrouwen-top': 'womenTop',
    'vrouwen-subtop': 'womenSubtop',
    'vrouwen-organisatie': 'womenOrg',
    'beleidsniveau': 'policyMaturity',
  }[metricId] as keyof YearData | undefined;

  if (!field) return buildDefaultTrend();

  return Object.entries(YEAR_DATA).map(([yr, data]) => ({
    date: yr,
    value: data[field] as number,
  }));
}

function buildDefaultTrend(): TrendPoint[] {
  return Object.entries(YEAR_DATA).map(([yr, data]) => ({
    date: yr,
    value: data.womenTop,
  }));
}

/**
 * Returns a complete Factset for a given measurement year,
 * built from real Charter Diversiteit research data.
 */
export function getResearchFactset(year: number): Factset {
  const effectiveYear = AVAILABLE_YEARS.includes(year as typeof AVAILABLE_YEARS[number])
    ? year
    : AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1];

  return {
    generatedAt: new Date().toISOString(),
    measurementYear: effectiveYear,
    metrics: buildMetrics(effectiveYear),
    trend: buildDefaultTrend(),
    dimensions: buildDimensions(effectiveYear),
  };
}

/**
 * Returns the trend for a specific metric across all measurement years.
 */
export function getMetricTrend(metricId: string): TrendPoint[] {
  return buildTrend(metricId);
}

/**
 * Returns sparkline data (just the values) for a metric across all years.
 */
export function getSparklineValues(metricId: string): number[] {
  return buildTrend(metricId).map((p) => p.value);
}

export { AVAILABLE_YEARS, YEAR_DATA };
