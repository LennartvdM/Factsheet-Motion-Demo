import { motion } from 'framer-motion';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const chartData = [
  { month: 'Jan', value: 12 },
  { month: 'Feb', value: 18 },
  { month: 'Mar', value: 24 },
  { month: 'Apr', value: 32 },
  { month: 'May', value: 28 }
];

export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 p-8">
      <motion.section
        className="max-w-xl space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-lg shadow-cyan-500/10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.h1
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Factsheet Motion Demo
        </motion.h1>
        <motion.p
          className="text-slate-300"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Animated insights with Tailwind CSS, Framer Motion, and Recharts.
        </motion.p>
        <motion.div
          className="h-64 w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 24, right: 24, bottom: 16, left: 16 }}>
              <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={{ stroke: '#334155' }} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={{ stroke: '#334155' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', borderColor: '#1e293b' }}
                labelStyle={{ color: '#38bdf8' }}
              />
              <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.section>
    </main>
  );
}
