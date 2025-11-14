import * as React from 'react';

import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'ghost';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[rgb(var(--color-accent))] text-white shadow-sm hover:bg-[rgba(var(--color-accent),0.9)] focus-visible:bg-[rgba(var(--color-accent),0.92)]',
  ghost:
    'bg-[rgba(var(--color-card),0.6)] text-[rgb(var(--color-text))] shadow-inner shadow-[rgba(var(--color-overlay),0.12)] hover:bg-[rgba(var(--color-card),0.8)] focus-visible:bg-[rgba(var(--color-card),0.85)]',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(var(--color-accent),0.65)] focus-visible:ring-offset-1 focus-visible:ring-offset-[rgba(var(--color-bg),0.75)] disabled:pointer-events-none disabled:opacity-60',
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
