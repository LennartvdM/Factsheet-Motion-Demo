export type TrendPoint = {
  date: string;
  value: number;
};

export type CategoryBreakdown = {
  category: string;
  value: number;
};

type KpiUnit = 'count' | 'currency' | 'percent';

export type KPI = {
  id: string;
  label: string;
  unit: KpiUnit;
  value: number;
  delta: number;
  updatedAt: string;
};

export type Factset = {
  generatedAt: string;
  kpis: KPI[];
  trend: TrendPoint[];
  categories: CategoryBreakdown[];
};
