import type { ChartFigure } from '../types/ChartFigure';
import { inferSeriesSpecs } from '../types/ChartFigure';

type TextLayers = {
  headline: string;
  tooltip: string;
  summary: string;
  narrative: string[];
};

type Row = Record<string, string | number | null>;

type SeriesLookup = Record<string, string>;

const percentFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'percent',
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('nl-NL', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

function formatValue(value: number): string {
  if (!Number.isFinite(value)) {
    return 'n.v.t.';
  }

  if (Math.abs(value) <= 1) {
    return percentFormatter.format(value);
  }

  return numberFormatter.format(value);
}

function formatIndex(value: string | number | null | undefined): string {
  if (value == null) {
    return 'the latest period';
  }

  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return value.toString();
    }

    return numberFormatter.format(value);
  }

  return String(value);
}

function getNumeric(value: string | number | null | undefined): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function compareIndexValues(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
): number {
  if (a == null && b == null) {
    return 0;
  }

  if (a == null) {
    return -1;
  }

  if (b == null) {
    return 1;
  }

  const aNumeric = getNumeric(a);
  const bNumeric = getNumeric(b);

  if (aNumeric != null && bNumeric != null) {
    return aNumeric - bNumeric;
  }

  return String(a).localeCompare(String(b));
}

function sortRows(rows: Row[], indexField: string): Row[] {
  return [...rows].sort((left, right) =>
    compareIndexValues(left[indexField], right[indexField]),
  );
}

function buildSeriesLookup(fig: ChartFigure): SeriesLookup {
  return inferSeriesSpecs(fig).reduce<SeriesLookup>((acc, series) => {
    acc[series.key] = series.label;
    return acc;
  }, {});
}

function getHighestSeries(
  row: Row | undefined,
  lookup: SeriesLookup,
  indexField: string,
): { key: string; label: string; value: number | null } | null {
  if (!row) {
    return null;
  }

  let best: { key: string; label: string; value: number | null } | null = null;

  for (const [key, rawValue] of Object.entries(row)) {
    if (key === indexField) {
      continue;
    }

    const numericValue = getNumeric(rawValue);

    if (numericValue == null) {
      continue;
    }

    const label = lookup[key] ?? key;

    if (!best || numericValue > (best.value ?? Number.NEGATIVE_INFINITY)) {
      best = { key, label, value: numericValue };
    }
  }

  return best;
}

function describeRange(values: number[]): string {
  if (values.length === 0) {
    return '';
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return `Values remained steady at ${formatValue(min)} across the available periods.`;
  }

  return `Values ranged between ${formatValue(min)} and ${formatValue(max)} across the dataset.`;
}

function collectSeriesLatestValues(
  lookup: SeriesLookup,
  indexField: string,
  latestRow: Row | undefined,
): string {
  if (!latestRow) {
    return '';
  }

  const entries: string[] = [];

  for (const [key, label] of Object.entries(lookup)) {
    if (key === indexField) {
      continue;
    }

    const numericValue = getNumeric(latestRow[key]);

    if (numericValue == null) {
      continue;
    }

    entries.push(`${label} (${formatValue(numericValue)})`);
  }

  if (entries.length === 0) {
    return '';
  }

  return `Latest readings include ${entries.join(', ')}.`;
}

export function createTextLayers(fig: ChartFigure): TextLayers {
  const sortedRows = sortRows(fig.rows, fig.indexField);
  const latestRow = sortedRows.length > 0 ? sortedRows[sortedRows.length - 1] : undefined;
  const previousRow = sortedRows.length > 1 ? sortedRows[sortedRows.length - 2] : undefined;
  const earliestRow = sortedRows[0];
  const lookup = buildSeriesLookup(fig);
  const highestSeries = getHighestSeries(latestRow, lookup, fig.indexField);
  const title = fig.title ?? fig.label;

  if (!highestSeries || highestSeries.value == null) {
    const fallback = `No numeric data available for ${title}.`;

    return {
      headline: fallback,
      tooltip: fallback,
      summary: fallback,
      narrative: [fallback],
    };
  }

  const latestIndexValue = latestRow?.[fig.indexField];
  const previousIndexValue = previousRow?.[fig.indexField];
  const earliestIndexValue = earliestRow?.[fig.indexField];
  const previousValue = getNumeric(previousRow?.[highestSeries.key]);
  const earliestValue = getNumeric(earliestRow?.[highestSeries.key]);

  const headline = `${highestSeries.label}: ${formatValue(highestSeries.value)}`;
  const tooltip = `In ${formatIndex(latestIndexValue)}, ${highestSeries.label} was ${formatValue(
    highestSeries.value,
  )}.`;

  const overlaySentences: string[] = [];
  overlaySentences.push(
    `In ${formatIndex(latestIndexValue)}, ${highestSeries.label} reached ${formatValue(highestSeries.value)}.`,
  );

  if (previousRow && previousValue != null) {
    const direction = highestSeries.value - previousValue;
    const qualifier = direction > 0 ? 'above' : direction < 0 ? 'below' : 'in line with';
    overlaySentences.push(
      `This is ${qualifier} the ${formatValue(previousValue)} recorded in ${formatIndex(previousIndexValue)}.`,
    );
  }

  const highestSeriesValues = sortedRows
    .map((row) => getNumeric(row[highestSeries.key]))
    .filter((value): value is number => value != null);

  const rangeSummary = describeRange(highestSeriesValues);

  if (rangeSummary) {
    overlaySentences.push(rangeSummary);
  }

  if (overlaySentences.length < 2) {
    overlaySentences.push('Additional data is required to describe the trend.');
  }

  const summary = overlaySentences.slice(0, 2).join(' ');
  const overlayParagraph = overlaySentences.join(' ');

  const paragraphSentences: string[] = [];
  paragraphSentences.push(
    `The figure "${title}" tracks ${Object.keys(lookup).length} series across ${sortedRows.length} ${
      fig.indexField === 'year' ? 'years' : 'points'
    }.`,
  );
  paragraphSentences.push(
    `The most recent entry (${formatIndex(latestIndexValue)}) places ${highestSeries.label} at ${formatValue(
      highestSeries.value,
    )}.`,
  );

  if (earliestRow && earliestRow !== latestRow && earliestValue != null) {
    const change = highestSeries.value - earliestValue;
    const trendWord = change > 0 ? 'increased' : change < 0 ? 'decreased' : 'held steady';
    paragraphSentences.push(
      `Compared with ${formatIndex(earliestIndexValue)}, the series has ${trendWord} from ${formatValue(
        earliestValue,
      )} to ${formatValue(highestSeries.value)}.`,
    );
  } else if (sortedRows.length === 1) {
    paragraphSentences.push('Only a single period is currently available for this figure.');
  }

  const otherSeriesSummary = collectSeriesLatestValues(lookup, fig.indexField, latestRow);

  if (otherSeriesSummary) {
    paragraphSentences.push(otherSeriesSummary);
  }

  if (paragraphSentences.length < 4) {
    paragraphSentences.push(`The dataset covers ${sortedRows.length} recorded ${
      fig.indexField === 'year' ? (sortedRows.length === 1 ? 'year' : 'years') : 'points'
    }.`);
  }

  if (paragraphSentences.length < 4) {
    paragraphSentences.push('These observations summarise the available chart data.');
  }

  const narrativeParagraph = paragraphSentences.slice(0, 5).join(' ');

  const narrative: string[] = [];

  if (overlayParagraph) {
    narrative.push(overlayParagraph);
  }

  if (narrativeParagraph) {
    if (!overlayParagraph || overlayParagraph !== narrativeParagraph) {
      narrative.push(narrativeParagraph);
    }
  }

  if (narrative.length === 0) {
    narrative.push(summary || headline);
  }

  return {
    headline,
    tooltip,
    summary: summary || headline,
    narrative,
  };
}
