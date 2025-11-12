import * as React from 'react';

import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'ghost';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 focus-visible:bg-sky-400',
  ghost:
    'border border-slate-800/70 bg-slate-900/40 text-slate-200 hover:bg-slate-800/60 focus-visible:bg-slate-800/60',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60',
          variantStyles[variant],
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
