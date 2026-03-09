import type { ChartFigure } from '../types/ChartFigure';
import { inferSeriesSpecs } from '../types/ChartFigure';

type TextLayers = {
  headline: string;
  tooltip: string;
  summary: string;
  narrative: string[];
};

type Row = Record<string, string | number | null>;

const pctFmt = new Intl.NumberFormat('nl-NL', { style: 'percent', maximumFractionDigits: 1 });
const numFmt = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 1 });

function fmt(v: number): string {
  if (!Number.isFinite(v)) return 'n.v.t.';
  return Math.abs(v) <= 1 ? pctFmt.format(v) : numFmt.format(v);
}

function fmtIdx(v: string | number | null | undefined): string {
  if (v == null) return 'the latest period';
  return typeof v === 'number' && !Number.isInteger(v) ? numFmt.format(v) : String(v);
}

function toNum(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') { const n = Number(v); return Number.isFinite(n) ? n : null; }
  return null;
}

function sortRows(rows: Row[], field: string): Row[] {
  return [...rows].sort((a, b) => {
    const an = toNum(a[field]), bn = toNum(b[field]);
    if (an != null && bn != null) return an - bn;
    return String(a[field] ?? '').localeCompare(String(b[field] ?? ''));
  });
}

function topSeries(row: Row | undefined, lookup: Record<string, string>, indexField: string) {
  if (!row) return null;
  let best: { key: string; label: string; value: number } | null = null;
  for (const [key, raw] of Object.entries(row)) {
    if (key === indexField) continue;
    const v = toNum(raw);
    if (v == null) continue;
    const label = lookup[key] ?? key;
    if (!best || v > best.value) best = { key, label, value: v };
  }
  return best;
}

export function createTextLayers(fig: ChartFigure): TextLayers {
  const sorted = sortRows(fig.rows, fig.indexField);
  const latest = sorted[sorted.length - 1];
  const prev = sorted.length > 1 ? sorted[sorted.length - 2] : undefined;
  const earliest = sorted[0];

  const lookup = Object.fromEntries(inferSeriesSpecs(fig).map((s) => [s.key, s.label]));
  const top = topSeries(latest, lookup, fig.indexField);
  const title = fig.title ?? fig.label;

  if (!top) {
    return { headline: title, tooltip: title, summary: title, narrative: [title] };
  }

  const headline = `${top.label}: ${fmt(top.value)}`;
  const idx = fmtIdx(latest?.[fig.indexField]);
  const tooltip = `In ${idx}, ${top.label} was ${fmt(top.value)}.`;

  const sentences: string[] = [];
  sentences.push(`In ${idx}, ${top.label} reached ${fmt(top.value)}.`);

  const prevVal = toNum(prev?.[top.key]);
  if (prev && prevVal != null) {
    const dir = top.value > prevVal ? 'above' : top.value < prevVal ? 'below' : 'in line with';
    sentences.push(`This is ${dir} the ${fmt(prevVal)} recorded in ${fmtIdx(prev[fig.indexField])}.`);
  }

  const earliestVal = toNum(earliest?.[top.key]);
  if (earliest && earliest !== latest && earliestVal != null) {
    const word = top.value > earliestVal ? 'increased' : top.value < earliestVal ? 'decreased' : 'held steady';
    sentences.push(`Since ${fmtIdx(earliest[fig.indexField])}, the series has ${word} from ${fmt(earliestVal)} to ${fmt(top.value)}.`);
  }

  if (latest) {
    const entries = Object.entries(lookup)
      .filter(([k]) => k !== fig.indexField)
      .map(([k, label]) => { const v = toNum(latest[k]); return v != null ? `${label} (${fmt(v)})` : null; })
      .filter(Boolean);
    if (entries.length > 0) sentences.push(`Latest: ${entries.join(', ')}.`);
  }

  return {
    headline,
    tooltip,
    summary: sentences.slice(0, 2).join(' '),
    narrative: [sentences.join(' ')],
  };
}
