import { motion, useReducedMotion } from "framer-motion";
import { MetricUpdate } from "../hooks/useLiveMetrics";

const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 }
};

type UpdatesListProps = {
  updates: MetricUpdate[];
};

const UpdatesList = ({ updates }: UpdatesListProps): JSX.Element => {
  const shouldReduceMotion = useReducedMotion();

  if (!updates.length) {
    return (
      <p className="text-sm text-slate-400">Waiting for live activity…</p>
    );
  }

  return (
    <motion.ul
      variants={shouldReduceMotion ? undefined : containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-3"
    >
      {updates.map((update) => (
        <motion.li
          key={`${update.assetId}-${update.metricId}-${update.timestamp}`}
          variants={shouldReduceMotion ? undefined : itemVariants}
          className="rounded-2xl border border-slate-800/70 bg-slate-950/60 px-4 py-3 text-sm text-slate-200"
        >
          <span className="font-semibold text-sky-300">{update.assetId.replace(/-/g, " ")}</span> updated
          <span className="text-white"> {update.metricId}</span> to
          <span className="text-emerald-300"> {update.value.toFixed(2)}</span> at
          <time dateTime={update.timestamp} className="ml-1 text-xs text-slate-400">
            {new Date(update.timestamp).toLocaleTimeString()}
          </time>
        </motion.li>
      ))}
    </motion.ul>
  );
};

export default UpdatesList;
