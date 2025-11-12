import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import clsx from "clsx";
import AboutDialog from "./AboutDialog";
import MotionLink from "./MotionLink";

const navigation = [
  { name: "Overview", to: "/" },
  { name: "Insights", to: "/insights" }
];

type AppHeaderProps = {
  onOpenAbout: () => void;
  onCloseAbout: () => void;
  isAboutOpen: boolean;
};

const AppHeader = ({ onOpenAbout, onCloseAbout, isAboutOpen }: AppHeaderProps): JSX.Element => {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="border-b border-slate-800/60 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
        <div className="flex items-center gap-4">
          <MotionLink to="/" className="flex items-center gap-2 text-base font-semibold text-white">
            <span
              aria-hidden
              className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 font-semibold text-slate-900"
              style={{ viewTransitionName: "app-logo" }}
            >
              FM
            </span>
            Factsheet Motion
          </MotionLink>
        </div>
        <nav className="hidden items-center gap-2 sm:flex" aria-label="Primary">
          {navigation.map((item) => (
            <MotionLink
              key={item.name}
              to={item.to}
              className={clsx(
                pathname === item.to
                  ? "bg-slate-800/70 text-white shadow"
                  : "text-slate-300 hover:bg-slate-800/50",
                "transition-all"
              )}
              transitionId={`nav-${item.name.toLowerCase()}`}
            >
              {item.name}
            </MotionLink>
          ))}
          <button
            type="button"
            onClick={onOpenAbout}
            className="ml-2 rounded-md bg-sky-500/90 px-3 py-2 text-sm font-semibold text-white shadow-inner shadow-sky-900/50 transition hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            About
          </button>
        </nav>
        <button
          type="button"
          className="rounded-md p-2 text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 sm:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        >
          {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>
      {menuOpen ? (
        <div className="sm:hidden">
          <nav className="space-y-1 border-t border-slate-800/60 bg-slate-900/90 px-4 py-4" aria-label="Mobile">
            {navigation.map((item) => (
              <MotionLink
                key={item.name}
                to={item.to}
                className={clsx(
                  pathname === item.to ? "bg-slate-800/70 text-white" : "text-slate-300 hover:bg-slate-800/50",
                  "block rounded-md px-3 py-2"
                )}
                onClick={closeMenu}
              >
                {item.name}
              </MotionLink>
            ))}
            <button
              type="button"
              onClick={() => {
                closeMenu();
                onOpenAbout();
              }}
              className="block w-full rounded-md bg-sky-500/90 px-3 py-2 text-left text-sm font-semibold text-white shadow-inner shadow-sky-900/50"
            >
              About
            </button>
          </nav>
        </div>
      ) : null}
      <AboutDialog open={isAboutOpen} onClose={() => {
        onCloseAbout();
        closeMenu();
      }} />
    </header>
  );
};

export default AppHeader;
