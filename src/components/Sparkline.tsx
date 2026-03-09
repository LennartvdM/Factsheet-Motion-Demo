/**
 * A tiny inline SVG sparkline chart.
 * Shows the trend shape without axes, labels, or interactivity.
 * Designed to sit inside metric cards.
 */

type SparklineProps = {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
};

export function Sparkline({
  values,
  width = 80,
  height = 28,
  color = 'rgba(var(--color-accent), 0.8)',
  className,
}: SparklineProps) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = 2;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * innerW;
    const y = padding + innerH - ((v - min) / range) * innerH;
    return `${x},${y}`;
  });

  const linePath = `M${points.join(' L')}`;

  // gradient fill below the line
  const first = points[0];
  const last = points[points.length - 1];
  const fillPath = `${linePath} L${last.split(',')[0]},${height} L${first.split(',')[0]},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#spark-fill)" />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* dot on latest value */}
      <circle
        cx={Number(points[points.length - 1].split(',')[0])}
        cy={Number(points[points.length - 1].split(',')[1])}
        r={2}
        fill={color}
      />
    </svg>
  );
}

export default Sparkline;
