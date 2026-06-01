interface RadarAxis {
  label: string;
}

interface RadarSeries {
  color: string;
  fill: string;
  values: number[];
}

interface RadarProps {
  axes: RadarAxis[];
  series: RadarSeries[];
  size?: number;
  max?: number;
}

export function Radar({ axes, series, size = 320, max = 100 }: RadarProps) {
  const center = size / 2;
  const r = size * 0.36;
  const n = axes.length;
  const angle = (i: number) => (i * 2 * Math.PI) / n - Math.PI / 2;
  const pt = (val: number, i: number): [number, number] => {
    const a = angle(i);
    const d = (val / max) * r;
    return [center + d * Math.cos(a), center + d * Math.sin(a)];
  };
  const toPath = (pts: [number, number][]) =>
    pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ') + 'Z';

  const gridFracs = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridFracs.map(frac => (
        <polygon
          key={frac}
          points={axes.map((_, i) => pt(max * frac, i).join(',')).join(' ')}
          fill="none" stroke="#E2DDD5" strokeWidth={1}
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(max, i);
        return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#E2DDD5" strokeWidth={1} />;
      })}
      {series.map((s, si) => {
        const pts = s.values.map((v, i) => pt(v, i));
        return (
          <g key={si}>
            <path d={toPath(pts)} fill={s.fill} stroke={s.color} strokeWidth={2} />
            {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill={s.color} />)}
          </g>
        );
      })}
      {axes.map((ax, i) => {
        const [x, y] = pt(max * 1.22, i);
        return (
          <text
            key={i} x={x} y={y}
            textAnchor="middle" dominantBaseline="middle"
            style={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }}
          >
            {ax.label}
          </text>
        );
      })}
    </svg>
  );
}
