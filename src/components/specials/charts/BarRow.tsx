import { Reveal } from '../Reveal';

interface BarRowProps {
  rank: number;
  label: string;
  sub: string;
  value: number;
  display: number | string;
  max: number;
  color?: string;
  highlight?: boolean;
}

export function BarRow({ rank, label, sub, value, display, max, color = '#7A0213', highlight = false }: BarRowProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <Reveal delay={rank * 0.04}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <span style={{
            fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 18,
            color: highlight ? '#C4944A' : '#CBD5E0', width: 20, textAlign: 'center' as const,
          }}>{rank}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>{label}</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>{sub}</div>
          </div>
          <span style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 22, color }}>{display}</span>
        </div>
        <div style={{ height: 8, background: '#EFEAE3', borderRadius: 4, overflow: 'hidden', marginLeft: 30 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 1s ease' }} />
        </div>
      </div>
    </Reveal>
  );
}
