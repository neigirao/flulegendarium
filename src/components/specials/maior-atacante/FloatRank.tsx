import { useState, useEffect } from 'react';
import { ILF_RANKING } from '@/data/maior-atacante';

export function FloatRank() {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? window.scrollY / h : 0;
      setProgress(p);
      setShow(p > 0.12 && p < 0.86);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const top = ILF_RANKING.slice(0, 5);

  return (
    <>
      {/* Scroll progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, height: 4, background: 'linear-gradient(90deg, #7A0213, #C4944A)', zIndex: 40, transition: 'width 0.1s linear', width: `${progress * 100}%` }} />

      {/* Floating leaderboard */}
      <div style={{
        position: 'fixed', right: 20, bottom: 20, zIndex: 90,
        background: 'rgba(10,24,16,0.94)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(232,181,96,0.3)', borderRadius: 14, padding: '14px 16px', width: 200, color: 'white',
        boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
        opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.4s, transform 0.4s', pointerEvents: show ? 'auto' : 'none',
        display: 'none',
      }}
        className="float-rank-panel"
      >
        <style>{`@media (min-width: 641px) { .float-rank-panel { display: block !important; } }`}</style>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#E8B560', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          ⚡ Placar Parcial ILF
        </div>
        {top.map((p, i) => {
          const hidden = i === 0;
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12 }}>
              <span style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 14, width: 16, color: 'rgba(255,255,255,0.5)' }}>{i + 1}</span>
              <span style={{ flex: 1, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', filter: hidden ? 'blur(5px)' : 'none', userSelect: hidden ? 'none' : 'auto' }}>
                {hidden ? 'Líder oculto' : p.nome}
              </span>
              <span style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", color: '#E8B560', filter: hidden ? 'blur(5px)' : 'none' }}>
                {p.ilf.toFixed(1)}
              </span>
            </div>
          );
        })}
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 8, textAlign: 'center' as const }}>Role até o fim para a revelação</div>
      </div>
    </>
  );
}
