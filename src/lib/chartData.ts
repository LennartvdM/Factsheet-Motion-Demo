import type { BarDatum } from '../components/charts/BarBreakdown';
import type { TrendDatum } from '../components/charts/TrendLine';

export const trendData: TrendDatum[] = [
  { date: 'Jan', value: 820 },
  { date: 'Feb', value: 860 },
  { date: 'Mar', value: 910 },
  { date: 'Apr', value: 880 },
  { date: 'May', value: 940 },
  { date: 'Jun', value: 1020 },
  { date: 'Jul', value: 1100 },
  { date: 'Aug', value: 1160 },
  { date: 'Sep', value: 1210 },
  { date: 'Oct', value: 1280 },
  { date: 'Nov', value: 1330 },
  { date: 'Dec', value: 1390 },
];

export const categoryBreakdown: BarDatum[] = [
  { category: 'North', value: 320 },
  { category: 'South', value: 280 },
  { category: 'East', value: 360 },
  { category: 'West', value: 300 },
  { category: 'Online', value: 420 },
];
