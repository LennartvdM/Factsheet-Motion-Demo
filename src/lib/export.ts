import type { Metric, TrendPoint } from '../types';

type CsvOptions = {
  metrics: Metric[];
  trend: TrendPoint[];
  generatedAt?: string;
  year?: string;
  fileName?: string;
};

type PngOptions = {
  element: HTMLElement;
  fileName?: string;
  backgroundColor?: string | null;
  reduceMotion?: boolean;
  year?: string;
};

type Html2CanvasFn = (
  element: HTMLElement,
  options?: { backgroundColor?: string; scale?: number }
) => Promise<HTMLCanvasElement>;

let html2canvasLoader: Promise<Html2CanvasFn> | null = null;

function loadHtml2canvas(): Promise<Html2CanvasFn> {
  if (html2canvasLoader) return html2canvasLoader;

  html2canvasLoader = new Promise<Html2CanvasFn>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('html2canvas requires a browser'));
      return;
    }

    const win = window as typeof window & { html2canvas?: Html2CanvasFn };
    if (win.html2canvas) { resolve(win.html2canvas); return; }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    script.async = true;

    script.onload = () => {
      const fn = (window as typeof window & { html2canvas?: Html2CanvasFn }).html2canvas;
      fn ? resolve(fn) : reject(new Error('html2canvas failed to initialize'));
    };
    script.onerror = () => {
      script.remove();
      html2canvasLoader = null;
      reject(new Error('Failed to load html2canvas'));
    };

    document.head.appendChild(script);
  });

  return html2canvasLoader;
}

function csvCell(value: string | number | null | undefined): string {
  if (value == null) return '';
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name, rel: 'noopener' });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function buildName(base: string, ext: string, suffix?: string) {
  const s = suffix ? `-${suffix.replace(/[^a-z0-9_-]/gi, '-').toLowerCase()}` : '';
  return `${base}${s}.${ext}`;
}

export function exportSnapshotCsv({ metrics, trend, generatedAt, year, fileName }: CsvOptions) {
  if (typeof window === 'undefined') return;

  const rows: string[][] = [];
  rows.push(['Diversity Monitor Snapshot']);
  rows.push(['Generated', generatedAt ?? new Date().toISOString()]);
  if (year) rows.push(['Measurement Year', year]);
  rows.push([]);
  rows.push(['Metric', 'Value', 'Previous', 'Format', 'Updated']);

  for (const m of metrics) {
    rows.push([m.label, String(m.value), String(m.previousValue), m.format, m.updatedAt]);
  }

  if (trend.length > 0) {
    rows.push([]);
    rows.push(['Trend']);
    rows.push(['Year', 'Value']);
    for (const p of trend) rows.push([p.date, String(p.value)]);
  }

  const csv = rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
  download(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }), fileName ?? buildName('diversity-snapshot', 'csv', year));
}

export async function exportGridPng({ element, fileName, backgroundColor = '#020617', reduceMotion = false, year }: PngOptions) {
  if (typeof window === 'undefined' || !element) return;

  let html2canvas: Html2CanvasFn;
  try { html2canvas = await loadHtml2canvas(); }
  catch { return; }

  const prev = element.getAttribute('data-exporting');
  if (reduceMotion) element.setAttribute('data-exporting', 'true');

  try {
    const canvas = await html2canvas(element, { backgroundColor: backgroundColor ?? undefined, scale: window.devicePixelRatio || 2 });
    const a = Object.assign(document.createElement('a'), { href: canvas.toDataURL('image/png'), download: fileName ?? buildName('diversity-metrics', 'png', year), rel: 'noopener' });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    if (reduceMotion) {
      prev !== null ? element.setAttribute('data-exporting', prev) : element.removeAttribute('data-exporting');
    }
  }
}
