import { Dialog } from "@headlessui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Fragment } from "react";

export type AboutDialogProps = {
  open: boolean;
  onClose: () => void;
};

const AboutDialog = ({ open, onClose }: AboutDialogProps): JSX.Element => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <Dialog as={Fragment} open={open} onClose={onClose} className="relative z-50">
          <motion.div
            className="fixed inset-0 bg-slate-950/70"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
          />
          <div className="fixed inset-0 flex items-center justify-center px-4 py-6 sm:px-0">
            <Dialog.Panel
              as={motion.div}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
              className="w-full max-w-lg rounded-2xl border border-slate-700/60 bg-slate-900/90 p-6 shadow-2xl backdrop-blur"
            >
              <Dialog.Title className="text-lg font-semibold text-white">About this demo</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-slate-300">
                Factsheet Motion Demo showcases a micro-interaction rich factsheet built with React,
                Framer Motion, Tailwind CSS, and a mock Server-Sent Events stream. It emphasises
                accessible motion and real-time storytelling.
              </Dialog.Description>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p>
                  Use the live dashboard to explore fund performance, drill into specific assets,
                  and watch the activity feed update in real time. Shared element transitions tie the
                  journey together.
                </p>
                <p>
                  Toggle reduced-motion in your system preferences to see motion gracefully scale
                  down for accessibility.
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                >
                  Got it
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      ) : null}
    </AnimatePresence>
  );
};

export default AboutDialog;
