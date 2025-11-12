import clsx from "clsx";
import { forwardRef } from "react";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { startViewTransition } from "../utils/view-transition";

type MotionLinkBaseProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">;

type MotionLinkProps = MotionLinkBaseProps & {
  to: string;
  children: ReactNode;
  transitionId?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

const MotionLink = forwardRef<HTMLAnchorElement, MotionLinkProps>(function MotionLink(
  { to, children, className, transitionId, onClick, style, ...rest },
  ref
) {
  const navigate = useNavigate();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    startViewTransition(() => navigate(to));
  };

  return (
    <a
      {...rest}
      href={to}
      ref={ref}
      style={transitionId ? { ...style, viewTransitionName: transitionId } : style}
      onClick={handleClick}
      className={clsx(
        "rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400",
        className
      )}
    >
      {children}
    </a>
  );
});

export default MotionLink;
