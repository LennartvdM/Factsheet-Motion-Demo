import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import AppHeader from "./components/AppHeader";

const App = (): JSX.Element => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const variants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 16
    },
    animate: {
      opacity: 1,
      y: 0
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -16
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AppHeader onOpenAbout={() => setIsAboutOpen(true)} isAboutOpen={isAboutOpen} onCloseAbout={() => setIsAboutOpen(false)} />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-16 pt-6 sm:px-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={location.pathname} variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: "easeInOut" }} className="flex-1">
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
