import { motion, useReducedMotion } from "framer-motion";
import MetricAreaChart from "../components/charts/MetricAreaChart";
import LiveMetricCard from "../components/LiveMetricCard";
import UpdatesList from "../components/UpdatesList";
import { useLiveMetrics } from "../hooks/useLiveMetrics";

const Dashboard = (): JSX.Element => {
  const { companies, updates } = useLiveMetrics();
  const featured = companies[0];
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-900/80 via-slate-900/20 to-slate-900/60 p-8 shadow-2xl shadow-slate-950/30">
        <motion.h1
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
          className="text-3xl font-semibold text-white sm:text-4xl"
        >
          Live climate factsheets
        </motion.h1>
        <p className="mt-4 max-w-2xl text-base text-slate-300">
          Monitor renewable and climate-tech funds with live updates, immersive motion, and
          accessibility-aware design. Click a fund to dive deeper into its factsheet with shared
          element transitions.
        </p>
        {featured ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-800/60 bg-slate-950/40 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Featured fund</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white" style={{ viewTransitionName: `asset-${featured.id}` }}>
                    {featured.name}
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  Outperforming
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-300">{featured.description}</p>
              <div className="mt-6">
                <MetricAreaChart data={featured.performance} />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-800/60 bg-slate-950/40 p-6">
              <h3 className="text-lg font-semibold text-white">Live activity feed</h3>
              <p className="mt-2 text-sm text-slate-400">
                Updates stream in from the mock SSE service. Keep this panel open to observe the
                metrics evolving.
              </p>
              <div className="mt-4 max-h-72 overflow-y-auto pr-1">
                <UpdatesList updates={updates} />
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Portfolio pulse</h2>
            <p className="text-sm text-slate-400">
              A snapshot of the live climate transition strategies we monitor.
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Shared element transitions</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {companies.map((company) => (
            <LiveMetricCard key={company.id} company={company} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
