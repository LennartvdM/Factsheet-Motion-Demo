/**
 * Domain types for the Charter Diversity Monitor.
 *
 * The data tracks gender representation and inclusion policy maturity
 * across Dutch charter organisations over successive measurement years.
 */

/* ------------------------------------------------------------------ */
/*  Visualisation primitives (generic — consumed by chart components)  */
/* ------------------------------------------------------------------ */

/** A labelled point on a time axis (used by TrendLine chart). */
export type TrendPoint = {
  date: string;
  value: number;
};

/** A labelled category with a value (used by BarBreakdown chart). */
export type CategoryBreakdown = {
  category: string;
  value: number;
};

/* ------------------------------------------------------------------ */
/*  Domain types                                                       */
/* ------------------------------------------------------------------ */

export type MetricFormat = 'percent' | 'score';

/** A single headline metric from the diversity monitor. */
export type Metric = {
  id: string;
  label: string;
  format: MetricFormat;
  value: number;
  previousValue: number;
  year: number;
  updatedAt: string;
};

/** A score (1-5) for one inclusion-policy dimension. */
export type DimensionScore = {
  dimension: string;
  score: number;
};

/** The full data envelope delivered via SSE or initial fetch. */
export type Factset = {
  generatedAt: string;
  measurementYear: number;
  metrics: Metric[];
  trend: TrendPoint[];
  dimensions: DimensionScore[];
};

/* ------------------------------------------------------------------ */
/*  Legacy aliases – keep chart components compiling without changes   */
/* ------------------------------------------------------------------ */

/** @deprecated use Metric */
export type KPI = {
  id: string;
  label: string;
  unit: 'count' | 'currency' | 'percent';
  value: number;
  delta: number;
  updatedAt: string;
};
