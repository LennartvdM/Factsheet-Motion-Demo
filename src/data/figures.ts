import type { ChartFigure } from '../types/ChartFigure';

type RawFigure = {
  id: string;
  label: string;
  title: string | null;
  indexField: ChartFigure['indexField'];
  rows: Array<Record<string, unknown>>;
};

const rawFigureModules = import.meta.glob<RawFigure>('../../figures_chart/*.json', {
  eager: true,
  import: 'default',
});

function normalizeValue(value: unknown): string | number | null {
  if (value == null) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  const dashNormalized = trimmed.replace(/\s+/g, ' ');
  if (dashNormalized === '--' || dashNormalized === '- -') {
    return null;
  }

  const normalizedNumericString = trimmed.replace(',', '.');
  const normalizedNumeric = Number(normalizedNumericString);
  if (!Number.isNaN(normalizedNumeric) && /^[-+]?\d*(?:\.\d+)?$/.test(normalizedNumericString)) {
    return normalizedNumeric;
  }

  return trimmed;
}

function normalizeRow(row: Record<string, unknown>): Record<string, string | number | null> {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, normalizeValue(value)]),
  );
}

function toChartFigure(raw: RawFigure): ChartFigure {
  return {
    id: raw.id,
    label: raw.label,
    title: raw.title ?? null,
    indexField: raw.indexField,
    rows: raw.rows.map((row) => normalizeRow(row)),
  };
}

const loadedFigures = Object.values(rawFigureModules)
  .map((raw) => toChartFigure(raw))
  .sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }));

export const figuresById: Record<string, ChartFigure> = Object.fromEntries(
  loadedFigures.map((figure) => [figure.id, figure]),
);

export const allFigures: ChartFigure[] = [...loadedFigures];

export function getFigure(id: string): ChartFigure | undefined {
  return figuresById[id];
}

