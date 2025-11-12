import { motion, useReducedMotion } from "framer-motion";
import MotionLink from "../components/MotionLink";
import { useLiveMetrics } from "../hooks/useLiveMetrics";

const Insights = (): JSX.Element => {
  const { companies } = useLiveMetrics();
  const shouldReduceMotion = useReducedMotion();

  const topPerformer = [...companies].sort((a, b) => {
    const aValue = a.metrics.find((metric) => metric.id === "returnYtd")?.value ?? 0;
    const bValue = b.metrics.find((metric) => metric.id === "returnYtd")?.value ?? 0;
    return bValue - aValue;
  })[0];

  const highestESG = [...companies].sort((a, b) => {
    const aValue = a.metrics.find((metric) => metric.id === "esgScore")?.value ?? 0;
    const bValue = b.metrics.find((metric) => metric.id === "esgScore")?.value ?? 0;
    return bValue - aValue;
  })[0];

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-800/60 bg-slate-950/40 p-8">
        <motion.h1
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
          className="text-3xl font-semibold text-white"
        >
          Insights snapshot
        </motion.h1>
        <p className="mt-4 max-w-2xl text-sm text-slate-300">
          Key observations derived from the live metrics. Each insight updates as new data arrives.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {topPerformer ? (
          <motion.article
            layout
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
            className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-emerald-100"
          >
            <h2 className="text-xl font-semibold text-white">Momentum leader</h2>
            <p className="mt-2 text-sm">
              {topPerformer.name} is delivering a year-to-date return of
              <span className="font-semibold"> {
                topPerformer.metrics.find((metric) => metric.id === "returnYtd")?.value.toFixed(1)
              }%</span>, leading the peer group.
            </p>
            <MotionLink
              to={`/asset/${topPerformer.id}`}
              transitionId={`asset-${topPerformer.id}`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 hover:text-white"
            >
              Review factsheet
              <span aria-hidden>→</span>
            </MotionLink>
          </motion.article>
        ) : null}

        {highestESG ? (
          <motion.article
            layout
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
            className="rounded-3xl border border-sky-500/40 bg-sky-500/10 p-6 text-sky-100"
          >
            <h2 className="text-xl font-semibold text-white">ESG standout</h2>
            <p className="mt-2 text-sm">
              {highestESG.name} holds the highest ESG score at
              <span className="font-semibold"> {
                highestESG.metrics.find((metric) => metric.id === "esgScore")?.value.toFixed(0)
              }</span>
              , reflecting industry-leading stewardship.
            </p>
            <MotionLink
              to={`/asset/${highestESG.id}`}
              transitionId={`asset-${highestESG.id}`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sky-500/20 px-4 py-2 text-sm font-semibold text-sky-100 hover:text-white"
            >
              View stewardship actions
              <span aria-hidden>→</span>
            </MotionLink>
          </motion.article>
        ) : null}
      </section>
    </div>
  );
};

export default Insights;
