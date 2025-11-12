import { useEffect, useMemo, useState } from "react";
import { Company, Metric, companies } from "../data/companies";

type MetricState = Record<string, Record<string, number>>;

export type MetricUpdate = {
  assetId: string;
  metricId: string;
  value: number;
  timestamp: string;
  delta: number;
};

const buildInitialState = (): MetricState => {
  return companies.reduce<MetricState>((acc, company) => {
    acc[company.id] = company.metrics.reduce<Record<string, number>>((metricAcc, metric) => {
      metricAcc[metric.id] = metric.value;
      return metricAcc;
    }, {});
    return acc;
  }, {});
};

export const useLiveMetrics = () => {
  const [metricState, setMetricState] = useState<MetricState>(() => buildInitialState());
  const [updates, setUpdates] = useState<MetricUpdate[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const source = new EventSource(
      (import.meta.env.VITE_SSE_URL as string | undefined) ?? "http://localhost:7070/api/metrics-stream"
    );

    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as MetricUpdate;
        setMetricState((prev) => ({
          ...prev,
          [parsed.assetId]: {
            ...prev[parsed.assetId],
            [parsed.metricId]: parsed.value
          }
        }));
        setUpdates((prev) => [parsed, ...prev].slice(0, 8));
      } catch (error) {
        console.warn("Failed to parse SSE payload", error);
      }
    };

    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
    };
  }, []);

  const enrichedCompanies = useMemo<Company[]>(() => {
    return companies.map((company) => ({
      ...company,
      metrics: company.metrics.map<Metric>((metric) => ({
        ...metric,
        value: metricState[company.id]?.[metric.id] ?? metric.value
      }))
    }));
  }, [metricState]);

  return { companies: enrichedCompanies, updates };
};
