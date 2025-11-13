export interface ChartFigure {
  id: string;
  label: string;
  title: string | null;
  indexField: string; // "year" or "index"
  rows: Array<Record<string, string | number | null>>;
}

export type ChartSeriesSpec = {
  key: string;
  label: string;
};

const toTitleCase = (value: string): string =>
  value
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(
      (segment) =>
        segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase(),
    )
    .join(" ") || value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

export const inferSeriesSpecs = (fig: ChartFigure): ChartSeriesSpec[] => {
  const [firstRow] = fig.rows;
  if (!firstRow) {
    return [];
  }

  return Object.entries(firstRow)
    .filter(
      ([key, value]) =>
        key !== fig.indexField && typeof value === "number" && !Number.isNaN(value),
    )
    .map(([key]) => ({
      key,
      label: toTitleCase(key),
    }));
};
