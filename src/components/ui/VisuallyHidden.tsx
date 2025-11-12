import * as React from 'react';

export type VisuallyHiddenProps = React.HTMLAttributes<HTMLSpanElement>;

export function VisuallyHidden({ className, style, ...props }: VisuallyHiddenProps) {
  return (
    <span
      className={className}
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
        ...style,
      }}
      {...props}
    />
  );
}

export default VisuallyHidden;
