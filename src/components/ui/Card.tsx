import * as React from 'react';

import { cn } from '../../lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-soft bg-[rgba(var(--color-card),0.75)] p-6 shadow-lg shadow-[rgba(var(--color-overlay),0.2)] backdrop-blur transition-colors',
        className
      )}
      {...props}
    />
  );
}

export default Card;
