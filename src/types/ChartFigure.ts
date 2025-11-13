export interface ChartFigure {
  id: string;
  label: string;
  title: string | null;
  indexField: 'year' | 'index';
  rows: Array<Record<string, string | number | null>>;
}

export type ChartSeriesSpec = {
  key: string;
  label: string;
};

function toTitleCase(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ');
}

export function inferSeriesSpecs(fig: ChartFigure): ChartSeriesSpec[] {
  const [firstRow] = fig.rows;

  if (!firstRow) {
    return [];
  }

  return Object.entries(firstRow)
    .filter(([key, value]) => {
      if (key === fig.indexField) {
        return false;
      }

      return typeof value === 'number';
    })
    .map(([key]) => ({
      key,
      label: toTitleCase(key),
    }));
}
