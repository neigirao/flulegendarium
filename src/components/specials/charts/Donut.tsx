interface Segment {
  value: number;
  color: string;
  label: string;
}

interface DonutProps {
  segments: Segment[];
  size?: number;
  thickness?: number;
}

export function Donut({ segments, size = 280, thickness = 46 }: DonutProps) {
  const center = size / 2;
  const radius = center - thickness / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  let cumAngle = -90;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const rotation = cumAngle;
        cumAngle += pct * 360;
        return (
          <circle
            key={i}
            cx={center} cy={center} r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={0}
            transform={`rotate(${rotation} ${center} ${center})`}
          />
        );
      })}
    </svg>
  );
}
