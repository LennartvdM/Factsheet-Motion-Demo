import type { KPI, TrendPoint } from '../types';

type SnapshotCsvOptions = {
  kpis: KPI[];
  trend: TrendPoint[];
  generatedAt?: string;
  timeframe?: string;
  fileName?: string;
};

type SnapshotPngOptions = {
  element: HTMLElement;
  fileName?: string;
  backgroundColor?: string | null;
  reduceMotion?: boolean;
  timeframe?: string;
};

type Html2CanvasFn = (
  element: HTMLElement,
  options?: {
    backgroundColor?: string;
    scale?: number;
  }
) => Promise<HTMLCanvasElement>;

let html2canvasLoader: Promise<Html2CanvasFn> | null = null;

function loadHtml2canvas(): Promise<Html2CanvasFn> {
  if (html2canvasLoader) {
    return html2canvasLoader;
  }

  html2canvasLoader = new Promise<Html2CanvasFn>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('html2canvas can only be used in the browser'));
      return;
    }

    const existing = (window as typeof window & { html2canvas?: Html2CanvasFn }).html2canvas;
    if (existing) {
      resolve(existing);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    script.async = true;

    const cleanup = () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };

    const handleLoad = () => {
      cleanup();
      const loaded = (window as typeof window & { html2canvas?: Html2CanvasFn }).html2canvas;
      if (loaded) {
        resolve(loaded);
      } else {
        reject(new Error('html2canvas failed to initialize'));
      }
    };

    const handleError = () => {
      cleanup();
      script.remove();
      html2canvasLoader = null;
      reject(new Error('Failed to load html2canvas'));
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    document.head.appendChild(script);
  });

  return html2canvasLoader;
}

function toCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = typeof value === 'string' ? value : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function buildSnapshotFileName(base: string, extension: string, timeframe?: string) {
  const suffix = timeframe ? `-${timeframe.replace(/[^a-z0-9_-]/gi, '-').toLowerCase()}` : '';
  return `${base}${suffix}.${extension}`;
}

export function exportSnapshotCsv({
  kpis,
  trend,
  generatedAt,
  timeframe,
  fileName,
}: SnapshotCsvOptions) {
  if (typeof window === 'undefined') {
    return;
  }

  const rows: string[][] = [];
  const timestamp = generatedAt ?? new Date().toISOString();

  rows.push(['KPI Snapshot']);
  rows.push(['Generated At', timestamp]);
  if (timeframe) {
    rows.push(['Timeframe', timeframe]);
  }
  rows.push([]);
  rows.push(['Metric', 'Value', 'Delta', 'Unit', 'Updated At']);

  kpis.forEach((kpi) => {
    rows.push([
      kpi.label,
      kpi.value.toString(),
      kpi.delta.toString(),
      kpi.unit,
      kpi.updatedAt,
    ]);
  });

  if (trend.length > 0) {
    rows.push([]);
    rows.push(['Trend (Last 30 Points)']);
    rows.push(['Date', 'Value']);

    trend.forEach((point) => {
      rows.push([point.date, point.value.toString()]);
    });
  }

  const csvContent = rows.map((row) => row.map(toCsvCell).join(',')).join('\r\n');
  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const outputName = fileName ?? buildSnapshotFileName('factsheet-snapshot', 'csv', timeframe);
  downloadBlob(blob, outputName);
}

export async function exportKpiGridPng({
  element,
  fileName,
  backgroundColor = '#020617',
  reduceMotion = false,
  timeframe,
}: SnapshotPngOptions) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!element) {
    console.warn('[export] Cannot export KPI grid without a target element');
    return;
  }

  let html2canvas: Html2CanvasFn;
  try {
    html2canvas = await loadHtml2canvas();
  } catch (error) {
    console.error('[export] Unable to load html2canvas for PNG export', error);
    return;
  }

  const outputName = fileName ?? buildSnapshotFileName('factsheet-kpis', 'png', timeframe);
  const previousAttribute = element.getAttribute('data-exporting');

  if (reduceMotion) {
    element.setAttribute('data-exporting', 'true');
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: backgroundColor ?? undefined,
      scale: window.devicePixelRatio || 2,
    });

    const dataUrl = canvas.toDataURL('image/png');
    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = outputName;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } catch (error) {
    console.error('[export] Failed to export KPI grid as PNG', error);
  } finally {
    if (reduceMotion) {
      if (previousAttribute !== null) {
        element.setAttribute('data-exporting', previousAttribute);
      } else {
        element.removeAttribute('data-exporting');
      }
    }
  }
}
