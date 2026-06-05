import { ReactNode } from 'react';

interface KickerProps {
  n: string | number;
  children: ReactNode;
  light?: boolean;
}

export function Kicker({ n, children, light }: KickerProps) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      {n !== '' && (
        <span style={{
          fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 15, letterSpacing: '0.06em',
          color: light ? '#E8B560' : '#7A5500',
          background: light ? 'rgba(196,148,74,0.15)' : 'rgba(196,148,74,0.12)',
          padding: '3px 10px', borderRadius: 6,
        }}>{n}</span>
      )}
      <span style={{
        fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' as const,
        color: light ? 'rgba(255,255,255,0.75)' : '#4B5563',
      }}>{children}</span>
    </div>
  );
}
