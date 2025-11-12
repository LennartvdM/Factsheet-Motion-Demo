import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MetricAreaChart from "../components/charts/MetricAreaChart";
import MotionLink from "../components/MotionLink";
import { companies } from "../data/companies";
import { useLiveMetrics } from "../hooks/useLiveMetrics";

const AssetDetails = (): JSX.Element => {
  const { assetId } = useParams<{ assetId: string }>();
  const { companies: liveCompanies } = useLiveMetrics();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const company = useMemo(() => {
    return liveCompanies.find((entry) => entry.id === assetId) ?? companies.find((entry) => entry.id === assetId);
  }, [assetId, liveCompanies]);

  if (!company) {
    return (
      <div className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-8 text-slate-200">
        <p className="text-lg font-semibold">We could not find that factsheet.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sky-500/90 px-4 py-2 text-sm font-semibold text-white"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <MotionLink to="/" transitionId="nav-overview" className="px-0 text-sky-300 hover:text-sky-200">
          ← Back to overview
        </MotionLink>
        <span aria-hidden>•</span>
        <span>Updated {new Date().toLocaleTimeString()}</span>
      </div>
      <header className="rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-900/90 via-slate-900/40 to-slate-900/80 p-8 shadow-lg">
        <p className="text-xs uppercase tracking-widest text-slate-400">{company.sector}</p>
        <motion.h1
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
          className="mt-3 text-3xl font-semibold text-white"
          style={{ viewTransitionName: `asset-${company.id}` }}
        >
          {company.name}
        </motion.h1>
        <p className="mt-4 max-w-2xl text-base text-slate-300">{company.description}</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {company.metrics.map((metric) => (
            <div key={metric.id} className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{metric.label}</dt>
              <dd className="mt-2 text-2xl font-semibold text-white">
                {metric.value.toLocaleString(undefined, {
                  maximumFractionDigits: metric.unit === "%" ? 1 : 2,
                  minimumFractionDigits: metric.unit === "%" ? 1 : 0
                })}
                {metric.unit}
              </dd>
              <dd className="mt-1 text-xs text-slate-400">Δ {metric.delta.toFixed(2)}{metric.unit ?? ""} vs last close</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="rounded-3xl border border-slate-800/60 bg-slate-950/40 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Performance journey</h2>
            <p className="text-sm text-slate-400">Fund growth relative to its benchmark.</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />Fund</span>
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-400" aria-hidden />Benchmark</span>
          </div>
        </div>
        <div className="mt-6">
          <MetricAreaChart data={company.performance} />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800/60 bg-slate-950/40 p-6">
        <h2 className="text-xl font-semibold text-white">Key highlights</h2>
        <motion.ul
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: shouldReduceMotion ? 0 : 0.12 }
            }
          }}
          className="mt-4 space-y-3"
        >
          {company.highlights.map((highlight, index) => (
            <motion.li
              key={highlight}
              variants={{
                hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
                visible: { opacity: 1, y: 0 }
              }}
              className="rounded-2xl border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
            >
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-xs font-semibold text-sky-300">
                {index + 1}
              </span>
              {highlight}
            </motion.li>
          ))}
        </motion.ul>
      </section>
    </div>
  );
};

export default AssetDetails;
