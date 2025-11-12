import { motion, useReducedMotion } from "framer-motion";
import { Company } from "../data/companies";
import MotionLink from "./MotionLink";

const LiveMetricCard = ({ company }: { company: Company }): JSX.Element => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      layout
      initial={false}
      whileHover={shouldReduceMotion ? undefined : { translateY: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-900/80 to-slate-900/30 p-6 shadow-lg shadow-slate-950/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">{company.sector}</p>
          <h3 className="mt-2 text-xl font-semibold text-white" style={{ viewTransitionName: `asset-${company.id}` }}>
            {company.name}
          </h3>
        </div>
        <div className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
          Live
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-300">{company.description}</p>
      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {company.metrics.map((metric) => (
          <div key={metric.id} className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{metric.label}</dt>
            <dd className="mt-2 flex items-end gap-2">
              <span className="text-2xl font-semibold text-white">
                {metric.value.toLocaleString(undefined, {
                  maximumFractionDigits: metric.unit === "%" ? 1 : 2,
                  minimumFractionDigits: metric.unit === "%" ? 1 : 0
                })}
                {metric.unit}
              </span>
              <span
                className="text-xs font-medium"
                aria-label={`Change ${metric.delta >= 0 ? "up" : "down"} ${Math.abs(metric.delta).toFixed(2)}${metric.unit ?? ""}`}
              >
                <span className={metric.delta >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {metric.delta >= 0 ? "▲" : "▼"} {Math.abs(metric.delta).toFixed(2)}
                  {metric.unit ?? ""}
                </span>
              </span>
            </dd>
          </div>
        ))}
      </dl>
      <MotionLink
        to={`/asset/${company.id}`}
        transitionId={`asset-${company.id}`}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900/80 px-4 py-2 text-sm font-semibold text-sky-300 shadow-inner shadow-sky-900/60 hover:text-sky-200"
        aria-label={`View detailed factsheet for ${company.name}`}
      >
        View factsheet
        <span aria-hidden>→</span>
      </MotionLink>
    </motion.article>
  );
};

export default LiveMetricCard;
