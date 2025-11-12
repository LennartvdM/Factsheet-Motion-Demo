const KPI_CONFIG = [
  {
    id: 'active-users',
    label: 'Active Users',
    unit: 'count',
    base: 1248,
    volatility: 0.08,
    deltaRange: [-0.04, 0.14],
  },
  {
    id: 'new-signups',
    label: 'New Signups',
    unit: 'count',
    base: 342,
    volatility: 0.12,
    deltaRange: [-0.06, 0.18],
  },
  {
    id: 'retention',
    label: 'Retention',
    unit: 'percent',
    base: 0.78,
    volatility: 0.04,
    deltaRange: [-0.05, 0.08],
  },
  {
    id: 'revenue',
    label: 'Revenue',
    unit: 'currency',
    base: 24300,
    volatility: 0.07,
    deltaRange: [-0.03, 0.12],
  },
];

const CATEGORY_CONFIG = [
  { category: 'North', base: 320 },
  { category: 'South', base: 280 },
  { category: 'East', base: 360 },
  { category: 'West', base: 300 },
  { category: 'Online', base: 420 },
];

const TREND_POINTS = 12;
const TREND_INTERVAL = 5 * 60 * 1000;

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

function randomBetween(random, min, max) {
  return min + (max - min) * random();
}

function createKpi(config, random, timestamp) {
  const { unit, base, volatility, deltaRange } = config;
  const drift = (random() - 0.5) * volatility;
  const value =
    unit === 'percent'
      ? Number(clamp(base + drift * 0.25, 0.4, 0.99).toFixed(3))
      : Math.max(0, Math.round(base * (1 + drift)));
  const delta = Number(randomBetween(random, deltaRange[0], deltaRange[1]).toFixed(3));

  return {
    id: config.id,
    label: config.label,
    unit,
    value,
    delta,
    updatedAt: new Date(timestamp).toISOString(),
  };
}

function formatTimeLabel(timestamp) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function generateTrend(random, baseTimestamp) {
  const start = baseTimestamp - (TREND_POINTS - 1) * TREND_INTERVAL;
  let lastValue = 880 + Math.round(random() * 180);
  const points = [];

  for (let index = 0; index < TREND_POINTS; index += 1) {
    if (index > 0) {
      const trendDrift = (random() - 0.5) * 0.12;
      lastValue = Math.max(120, Math.round(lastValue * (1 + trendDrift)));
    }

    const timestamp = start + index * TREND_INTERVAL;
    points.push({ date: formatTimeLabel(timestamp), value: lastValue });
  }

  return points;
}

function generateCategories(random) {
  return CATEGORY_CONFIG.map((category) => ({
    category: category.category,
    value: Math.max(0, Math.round(category.base * (0.85 + random() * 0.25))),
  }));
}

export function generateInitialFactset(randomOrSeed) {
  const random = resolveRandom(randomOrSeed);
  const generatedAt = Date.now();

  return {
    generatedAt: new Date(generatedAt).toISOString(),
    kpis: KPI_CONFIG.map((config) => createKpi(config, random, generatedAt)),
    trend: generateTrend(random, generatedAt),
    categories: generateCategories(random),
  };
}

const KPI_BY_ID = Object.fromEntries(KPI_CONFIG.map((config) => [config.id, config]));

export function nextTick(previousFactset, randomOrSeed) {
  const random = resolveRandom(randomOrSeed);
  const baseTimestamp = new Date(previousFactset.generatedAt).getTime() || Date.now();
  const generatedAt = baseTimestamp + Math.round(randomBetween(random, 180000, 300000));

  const kpis = previousFactset.kpis.map((kpi) => {
    const config = KPI_BY_ID[kpi.id];
    const volatility = config?.volatility ?? 0.08;
    const deltaRange = config?.deltaRange ?? [-0.04, 0.12];
    const drift = (random() - 0.5) * volatility;

    let nextValue;
    if (kpi.unit === 'percent') {
      nextValue = Number(clamp(kpi.value + drift * 0.2, 0.35, 0.99).toFixed(3));
    } else {
      nextValue = Math.max(0, Math.round(kpi.value * (1 + drift)));
    }

    const deltaDrift = randomBetween(random, -0.02, 0.02);
    const nextDelta = clamp(kpi.delta + deltaDrift, deltaRange[0], deltaRange[1]);

    return {
      ...kpi,
      value: nextValue,
      delta: Number(nextDelta.toFixed(3)),
      updatedAt: new Date(generatedAt).toISOString(),
    };
  });

  const trendSeed = previousFactset.trend.length
    ? previousFactset.trend[previousFactset.trend.length - 1].value
    : 940;
  const trend = previousFactset.trend.slice(-(TREND_POINTS - 1)).concat({
    date: formatTimeLabel(generatedAt),
    value: Math.max(120, Math.round(trendSeed * (1 + (random() - 0.5) * 0.14))),
  });

  const categories = previousFactset.categories.map((category) => ({
    category: category.category,
    value: Math.max(0, Math.round(category.value * (0.94 + random() * 0.12))),
  }));

  return {
    generatedAt: new Date(generatedAt).toISOString(),
    kpis,
    trend,
    categories,
  };
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
