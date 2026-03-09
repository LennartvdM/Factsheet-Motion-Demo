/**
 * Mock data generator for the Charter Diversity Monitor.
 *
 * Instead of fake SaaS metrics, this generates data that mirrors the real
 * diversity & inclusion research: women's representation at different
 * organisational levels and inclusion-policy dimension scores.
 *
 * Values are seeded from actual Charter Diversiteit factsheet figures so
 * the demo shows realistic magnitudes and relationships.
 */

/* ------------------------------------------------------------------ */
/*  Metric configuration – rooted in real Charter data                 */
/* ------------------------------------------------------------------ */

const METRIC_CONFIG = [
  {
    id: 'vrouwen-top',
    label: 'Women in Top',
    format: 'percent',
    // 2024 value from fig1: 35.5 %
    base: 0.355,
    volatility: 0.012,
    history: [0.29, 0.305, 0.315, 0.328, 0.342, 0.355],
  },
  {
    id: 'vrouwen-subtop',
    label: 'Women in Subtop',
    format: 'percent',
    base: 0.428,
    volatility: 0.01,
    history: [0.37, 0.385, 0.392, 0.401, 0.408, 0.428],
  },
  {
    id: 'vrouwen-organisatie',
    label: 'Women in Organisation',
    format: 'percent',
    base: 0.475,
    volatility: 0.006,
    history: [0.46, 0.462, 0.465, 0.47, 0.474, 0.475],
  },
  {
    id: 'beleidsniveau',
    label: 'Policy Maturity',
    format: 'score',
    // Average across inclusion dimensions ≈ 3.0 on a 1-5 scale
    base: 3.0,
    volatility: 0.08,
    history: [2.4, 2.55, 2.7, 2.8, 2.9, 3.0],
  },
];

/* ------------------------------------------------------------------ */
/*  Inclusion-policy dimensions – from fig20/fig23                     */
/* ------------------------------------------------------------------ */

const DIMENSION_CONFIG = [
  { dimension: 'Leadership',              base: 3.3 },
  { dimension: 'Strategy & Management',   base: 2.8 },
  { dimension: 'HR Management',           base: 3.1 },
  { dimension: 'Communication',           base: 2.8 },
  { dimension: 'Knowledge & Skills',      base: 2.8 },
  { dimension: 'Climate',                 base: 3.0 },
];

/* ------------------------------------------------------------------ */
/*  Trend — represents years of measurement (2019-2024)               */
/* ------------------------------------------------------------------ */

const TREND_LABELS = ['2019', '2020', '2021', '2022', '2023', '2024'];

/* ------------------------------------------------------------------ */
/*  Seeded RNG (identical to original)                                 */
/* ------------------------------------------------------------------ */

const RNG_MODULUS = 2147483647;
const RNG_MULTIPLIER = 48271;

function normaliseSeed(seed) {
  const value = Math.floor(seed) % RNG_MODULUS;
  return value > 0 ? value : value + RNG_MODULUS - 1;
}

export function createSeededRandom(seed = Date.now()) {
  let state = normaliseSeed(seed);
  return () => {
    state = (state * RNG_MULTIPLIER) % RNG_MODULUS;
    return state / RNG_MODULUS;
  };
}

function resolveRandom(randomOrSeed) {
  if (typeof randomOrSeed === 'function') {
    return randomOrSeed;
  }
  return createSeededRandom(randomOrSeed);
}

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/* ------------------------------------------------------------------ */
/*  Data generation                                                    */
/* ------------------------------------------------------------------ */

function createMetric(config, random, timestamp) {
  const drift = (random() - 0.5) * config.volatility;
  const value =
    config.format === 'score'
      ? Number(clamp(config.base + drift, 1.0, 5.0).toFixed(2))
      : Number(clamp(config.base + drift, 0.05, 0.99).toFixed(3));

  const historyLen = config.history.length;
  const previousValue =
    historyLen >= 2 ? config.history[historyLen - 2] : config.base;

  return {
    id: config.id,
    label: config.label,
    format: config.format,
    value,
    previousValue,
    year: 2024,
    updatedAt: new Date(timestamp).toISOString(),
  };
}

function generateTrend(random) {
  // Base series: women in top (the headline metric) over measurement years
  const baseHistory = METRIC_CONFIG[0].history;
  return TREND_LABELS.map((label, index) => {
    const base = baseHistory[index] ?? baseHistory[baseHistory.length - 1];
    // Add tiny jitter so the chart isn't perfectly smooth
    const jitter = (random() - 0.5) * 0.005;
    return {
      date: label,
      value: Number((base + jitter).toFixed(3)),
    };
  });
}

function generateDimensions(random) {
  return DIMENSION_CONFIG.map((dim) => ({
    dimension: dim.dimension,
    score: Number(clamp(dim.base + (random() - 0.5) * 0.15, 1.0, 5.0).toFixed(2)),
  }));
}

export function generateInitialFactset(randomOrSeed) {
  const random = resolveRandom(randomOrSeed);
  const generatedAt = Date.now();

  // Build the legacy-compatible shape so client.ts / server keep working
  const metrics = METRIC_CONFIG.map((config) =>
    createMetric(config, random, generatedAt)
  );
  const trend = generateTrend(random);
  const dimensions = generateDimensions(random);

  return {
    generatedAt: new Date(generatedAt).toISOString(),
    measurementYear: 2024,
    metrics,
    trend,
    dimensions,

    // ── Legacy fields consumed by chart components ──
    kpis: metrics.map((m) => ({
      id: m.id,
      label: m.label,
      unit: m.format === 'score' ? 'count' : 'percent',
      value: m.value,
      delta: m.value - m.previousValue,
      updatedAt: m.updatedAt,
    })),
    categories: dimensions.map((d) => ({
      category: d.dimension,
      value: d.score,
    })),
  };
}

const METRIC_BY_ID = Object.fromEntries(
  METRIC_CONFIG.map((config) => [config.id, config])
);

export function nextTick(previousFactset, randomOrSeed) {
  const random = resolveRandom(randomOrSeed);
  const baseTimestamp =
    new Date(previousFactset.generatedAt).getTime() || Date.now();
  const generatedAt =
    baseTimestamp + Math.round(3000 + random() * 2000);

  const metrics = previousFactset.metrics.map((metric) => {
    const config = METRIC_BY_ID[metric.id];
    const volatility = config?.volatility ?? 0.01;
    const drift = (random() - 0.5) * volatility;

    let nextValue;
    if (metric.format === 'score') {
      nextValue = Number(clamp(metric.value + drift, 1.0, 5.0).toFixed(2));
    } else {
      nextValue = Number(clamp(metric.value + drift, 0.05, 0.99).toFixed(3));
    }

    return {
      ...metric,
      value: nextValue,
      updatedAt: new Date(generatedAt).toISOString(),
    };
  });

  // Trend: slide window — append latest "Women in Top" value
  const latestTop = metrics.find((m) => m.id === 'vrouwen-top');
  const trend = previousFactset.trend.slice(-5).concat({
    date: String(previousFactset.measurementYear),
    value: latestTop ? latestTop.value : 0.35,
  });

  const dimensions = previousFactset.dimensions.map((dim) => {
    const base = DIMENSION_CONFIG.find((d) => d.dimension === dim.dimension);
    const drift = (random() - 0.5) * 0.08;
    return {
      dimension: dim.dimension,
      score: Number(
        clamp(dim.score + drift, 1.0, 5.0).toFixed(2)
      ),
    };
  });

  const factset = {
    generatedAt: new Date(generatedAt).toISOString(),
    measurementYear: previousFactset.measurementYear,
    metrics,
    trend,
    dimensions,

    // ── Legacy fields ──
    kpis: metrics.map((m) => ({
      id: m.id,
      label: m.label,
      unit: m.format === 'score' ? 'count' : 'percent',
      value: m.value,
      delta: m.value - m.previousValue,
      updatedAt: m.updatedAt,
    })),
    categories: dimensions.map((d) => ({
      category: d.dimension,
      value: d.score,
    })),
  };

  return factset;
}

export function createMockStream(seed = 1337) {
  const random = createSeededRandom(seed);
  let current = generateInitialFactset(random);

  return {
    getInitial() {
      return clone(current);
    },
    next() {
      current = nextTick(current, random);
      return clone(current);
    },
  };
}
