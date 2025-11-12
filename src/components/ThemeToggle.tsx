import { useTheme } from '@/theme/ThemeProvider';
import { motion } from 'framer-motion';

const themes = [
  { id: 'default', label: 'Default' },
  { id: 'dark', label: 'Dark' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'sunset', label: 'Sunset' }
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {themes.map((option) => {
        const isActive = theme === option.id;

        return (
          <motion.button
            key={option.id}
            type="button"
            onClick={() => setTheme(option.id)}
            whileTap={{ scale: 0.95 }}
            className={`rounded-full px-3 py-1 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-bg))] ${
              isActive
                ? 'bg-[rgb(var(--color-accent))] text-white shadow-sm'
                : 'bg-[rgba(var(--color-card),0.75)] text-[rgb(var(--color-text))] hover:bg-[rgba(var(--color-card),0.9)]'
            }`}
          >
            {option.label}
          </motion.button>
        );
      })}
    </div>
  );
}
