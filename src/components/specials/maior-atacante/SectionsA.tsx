import { useState } from 'react';
import { ILF_PLAYERS, ILF_WEIGHTS, ILF_RANKING, ILF_compute, ILF_compute_scores, ILF_MAX_SCORES, ILF_media, ILFPlayer } from '@/data/maior-atacante';
import { Portrait } from '../Portrait';
import { Kicker } from '../Kicker';
import { Reveal } from '../Reveal';
import { AnimatedNumber } from '../AnimatedNumber';
import { BarRow } from '../charts/BarRow';

const BB = "'Bebas Neue', Impact, sans-serif";

/* ── HERO ────────────────────────────────────── */
interface HeroProps { onStart: () => void }

export function HeroSection({ onStart }: HeroProps) {
  return (
    <section style={{
      background: 'radial-gradient(ellipse at 50% 0%, #0F2A1E 0%, #081510 60%, #050D0A 100%)',
      color: 'white', padding: '0 0 60px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ height: 5, background: 'linear-gradient(90deg,#7A0213 33%,#FAFAFA 33% 66%,#006140 66%)' }} />

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 32px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: '#E8B560', marginBottom: 20 }}>
          <span style={{ width: 28, height: 2, background: '#E8B560' }} />
          Índice Lendas do Flu
          <span style={{ width: 28, height: 2, background: '#E8B560' }} />
        </div>

        <h1 style={{ fontFamily: BB, fontSize: 'clamp(30px,4.6vw,56px)', lineHeight: 1.08, letterSpacing: '0.01em', margin: '0 auto 24px', maxWidth: 820 }}>
          QUEM É O <span style={{ color: '#E8B560' }}>MAIOR ATACANTE</span> DA HISTÓRIA DO FLUMINENSE?
        </h1>
        <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 640, margin: '0 auto 36px' }}>
          Analisamos 15 lendas tricolores com uma metodologia exclusiva para descobrir quem foi o atacante mais importante da história do clube.
        </p>

        <div style={{ position: 'relative', width: 'min(420px,86vw)', height: 230, margin: '8px auto 30px' }}>
          <svg viewBox="0 0 420 230" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
            <defs>
              <radialGradient id="heroGlow" cx="50%" cy="42%" r="60%">
                <stop offset="0%" stopColor="#1F5A3E" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#0A1810" stopOpacity="0" />
              </radialGradient>
              <pattern id="net" width="15" height="15" patternUnits="userSpaceOnUse">
                <path d="M0 0 L15 15 M15 0 L0 15" stroke="rgba(255,255,255,0.13)" strokeWidth="0.8" />
              </pattern>
              <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#C9CFCB" />
              </linearGradient>
            </defs>

            <ellipse cx="210" cy="100" rx="220" ry="130" fill="url(#heroGlow)" />

            <rect x="60" y="34" width="300" height="150" fill="url(#net)" />
            <rect x="54" y="28" width="312" height="8" rx="3" fill="url(#postGrad)" />
            <rect x="54" y="28" width="8" height="158" rx="3" fill="url(#postGrad)" />
            <rect x="358" y="28" width="8" height="158" rx="3" fill="url(#postGrad)" />

            <path d="M210 200 Q 300 150 332 56" stroke="#E8B560" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 9" fill="none" opacity="0.7">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2.4s" repeatCount="indefinite" />
            </path>
            {([-32,-16,0,16,32] as number[]).map((a, i) => (
              <line key={i} x1="332" y1="52"
                x2={332 + 26 * Math.cos((a - 90) * Math.PI / 180)}
                y2={52  + 26 * Math.sin((a - 90) * Math.PI / 180)}
                stroke="#E8B560" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
            ))}

            <g transform="translate(332,52)">
              <defs>
                <radialGradient id="ballShade" cx="38%" cy="32%" r="75%">
                  <stop offset="0%"   stopColor="#FFFFFF" />
                  <stop offset="62%"  stopColor="#F2F2F2" />
                  <stop offset="100%" stopColor="#C5CBC8" />
                </radialGradient>
              </defs>
              <ellipse cx="2" cy="15" rx="13" ry="3.5" fill="rgba(0,0,0,0.35)" />
              <circle r="14" fill="url(#ballShade)" stroke="#0A1810" strokeWidth="0.6" />
              <path d="M0 -6 L5.7 -1.9 L3.5 4.9 L-3.5 4.9 L-5.7 -1.9 Z" fill="#10231A" />
              <g stroke="#10231A" strokeWidth="1.3" strokeLinecap="round">
                <line x1="0" y1="-6"   x2="0"    y2="-13.5" />
                <line x1="5.7"  y1="-1.9" x2="12.8" y2="-4.4" />
                <line x1="3.5"  y1="4.9"  x2="8.4"  y2="10.9" />
                <line x1="-3.5" y1="4.9"  x2="-8.4" y2="10.9" />
                <line x1="-5.7" y1="-1.9" x2="-12.8" y2="-4.4" />
              </g>
              <g fill="#10231A">
                <path d="M-13.5 -3.8 L-9.5 -6.4 L-7.5 -2.2 Z" opacity="0.92" />
                <path d="M13.5 -3.8 L9.5 -6.4 L7.5 -2.2 Z"   opacity="0.92" />
                <path d="M0 -14 L3.4 -12 L-3.4 -12 Z"          opacity="0.92" />
                <path d="M7.6 11.6 L4.6 13.4 L9.6 9 Z"          opacity="0.85" />
                <path d="M-7.6 11.6 L-4.6 13.4 L-9.6 9 Z"       opacity="0.85" />
              </g>
              <ellipse cx="-4.5" cy="-5.5" rx="4" ry="2.6" fill="rgba(255,255,255,0.75)" transform="rotate(-30 -4.5 -5.5)" />
            </g>
          </svg>

          <img
            src="/lovable-uploads/6b2888cd-7dd2-4048-b4ca-c9636e93d4a6.webp"
            alt="Fluminense"
            style={{ position: 'absolute', top: '52%', left: '50%', transform: 'translate(-50%,-50%)', height: 108, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }}
          />
        </div>

        <div style={{ fontFamily: BB, fontSize: 17, color: '#E8B560', letterSpacing: '0.08em', marginBottom: 6 }}>
          15 LENDAS · UM TÍTULO EM DISPUTA
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 36, letterSpacing: '0.04em' }}>
          De Welfare a Cano — mais de um século de artilheiros tricolores
        </div>

        <button
          onClick={onStart}
          style={{ background: '#7A0213', color: 'white', border: 'none', borderRadius: 12, padding: '17px 40px', fontFamily: BB, fontSize: 22, letterSpacing: '0.05em', cursor: 'pointer', boxShadow: '0 10px 30px rgba(122,2,19,0.5)', transition: 'transform 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          COMEÇAR A ANÁLISE ↓
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(20px,5vw,64px)', marginTop: 48, flexWrap: 'wrap' as const }}>
          {[['15', 'candidatos'], ['6', 'critérios'], ['100+', 'anos de história']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: BB, fontSize: 46, color: '#E8B560', lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', fontWeight: 700, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FINALISTAS ──────────────────────────────── */
export function FinalistasSection() {
  const [sel, setSel] = useState<ILFPlayer | null>(null);
  return (
    <section id="finalistas" style={{ background: '#F7F5F2', padding: '72px 32px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <Kicker n="">Candidatos</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 8 }}>JOGADORES ANALISADOS</h2>
        <p style={{ fontSize: 15, color: '#64748B', maxWidth: 560, marginBottom: 36 }}>De Welfare a Cano — mais de um século de artilheiros. Clique em um nome para ver os detalhes.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
          {ILF_PLAYERS.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.05}>
              <div
                onClick={() => setSel(p)}
                style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, padding: 18, cursor: 'pointer', transition: 'transform 0.18s, box-shadow 0.18s', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Portrait player={p} size={64} ring="#C4944A" />
                  <div>
                    <div style={{ fontFamily: BB, fontSize: 22, color: '#1a1a2e', letterSpacing: '0.02em', lineHeight: 1 }}>{p.nome}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{p.periodo}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {sel && (
        <div
          onClick={() => setSel(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(8,16,12,0.55)', zIndex: 60, backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: 'min(440px, 92vw)', height: '100%', background: '#0A1810', color: 'white', overflowY: 'auto', boxShadow: '-12px 0 40px rgba(0,0,0,0.4)', animation: 'slideInRight 0.3s ease' }}
          >
            <div style={{ height: 5, background: 'linear-gradient(90deg,#7A0213 33%,#FAFAFA 33% 66%,#006140 66%)' }} />
            <div style={{ padding: 28 }}>
              <button onClick={() => setSel(null)} style={{ float: 'right', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>✕</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
                <Portrait player={sel} size={88} ring="#E8B560" big />
                <div>
                  <div style={{ fontFamily: BB, fontSize: 32, letterSpacing: '0.02em', lineHeight: 0.95 }}>{sel.nome}</div>
                  <div style={{ fontSize: 12, color: '#E8B560', fontWeight: 600 }}>{sel.apelido}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{sel.periodo} · {sel.posicao}</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 22, fontStyle: 'italic', borderLeft: '3px solid #C4944A', paddingLeft: 14 }}>{sel.legenda}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
                {[['Gols', sel.gols], ['Jogos', sel.jogos], ['Média', ILF_media(sel).toFixed(2)]].map(([l, v]) => (
                  <div key={String(l)} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 8px', textAlign: 'center' as const }}>
                    <div style={{ fontFamily: BB, fontSize: 24, color: '#E8B560' }}>{v}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Pontuação por critério</div>
              {(() => { const selScores = ILF_compute_scores(sel); return ILF_WEIGHTS.map(w => (
                <div key={w.key} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                    <span style={{ color: 'rgba(255,255,255,0.65)' }}>{w.label}</span>
                    <span style={{ fontFamily: BB, color: 'white' }}>{selScores[w.key].toFixed(1)}</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(selScores[w.key] / ILF_MAX_SCORES[w.key]) * 100}%`, height: '100%', background: '#C4944A', borderRadius: 4 }} />
                  </div>
                </div>
              )); })()}
              <div style={{ marginTop: 22, padding: 16, background: 'linear-gradient(135deg, rgba(196,148,74,0.18), rgba(122,2,19,0.18))', borderRadius: 12, textAlign: 'center' as const }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', fontWeight: 700 }}>Nota ILF</div>
                <div style={{ fontFamily: BB, fontSize: 48, color: '#E8B560', lineHeight: 1 }}>{ILF_compute(sel).toFixed(1)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ── METODOLOGIA ─────────────────────────────── */
const CRITERION_DETAIL: Record<string, { pts: string; desc: string }> = {
  producao:    { pts: '1 pt/gol',        desc: 'Cada gol marcado pelo clube vale 1 ponto.' },
  classicos:   { pts: '+0.5 pt/gol',     desc: 'Gols em Fla-Flu, Flu-Vasco e Flu-Botafogo recebem bônus adicional.' },
  decisivos:   { pts: '+0.25 · +0.5 · +1 · +2',  desc: 'Gols em oitavas (+0.25), quartas (+0.5), semifinais (+1) e finais (+2) de Copa do Brasil, Libertadores e Copa Rio.' },
  titulos:     { pts: '30–400 pts',       desc: 'Carioca 30 · Brasileiro 100 · Libertadores 200 · Mundial 400.' },
  campanhas:   { pts: '5–160 pts',        desc: 'Pontos por fase alcançada em cada campeonato da temporada.' },
  longevidade: { pts: '0.25 pt/jogo',    desc: 'Cada partida disputada pelo Fluminense contribui ao total.' },
};

export function MetodologiaSection() {
  return (
    <section style={{ background: '#F7F5F2', padding: '72px 32px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Kicker n="">Régua</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 8 }}>COMO DESCOBRIR O MAIOR ATACANTE DO FLUMINENSE?</h2>
        <p style={{ fontSize: 15, color: '#64748B', maxWidth: 580, marginBottom: 40 }}>A soma total de pontos brutos por todas as conquistas e contribuições — sem normalização. 6 critérios, cada conquista com seu valor absoluto.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {ILF_WEIGHTS.map((w, i) => {
            const detail = CRITERION_DETAIL[w.key];
            return (
              <div key={w.key} style={{ background: 'white', border: '1px solid #EDE8E0', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 10, background: w.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: BB, fontSize: 18, color: 'white', letterSpacing: '0.02em' }}>{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: BB, fontSize: 17, color: '#1a1a2e', letterSpacing: '0.02em' }}>{w.label}</span>
                    <span style={{ fontFamily: BB, fontSize: 14, color: w.color, letterSpacing: '0.02em', flexShrink: 0 }}>{detail.pts}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, margin: 0 }}>{detail.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 32, background: '#0A1810', borderRadius: 16, padding: '28px 32px', color: 'white', overflowX: 'auto' as const }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#E8B560', marginBottom: 14 }}>A Fórmula</div>
          <div style={{ fontFamily: BB, fontSize: 'clamp(16px,2.4vw,24px)', letterSpacing: '0.02em', lineHeight: 1.6, color: 'rgba(255,255,255,0.92)' }}>
            ILF = Gols + Clássicos + Decisivos + Títulos + Campanhas + Longevidade
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── PRODUÇÃO OFENSIVA ───────────────────────── */
export function ProducaoSection() {
  const ranked = [...ILF_PLAYERS].sort((a, b) => b.gols - a.gols);
  const lider = ranked[0];
  const max = lider.gols;
  return (
    <section style={{ background: '#fff', padding: '72px 32px', borderTop: '1px solid #EDE8E0' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Kicker n="01">Gols · 1 pt por gol</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 30 }}>GOLS</h2>
        <div data-mc="stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 36, alignItems: 'start' }}>
          <Reveal>
            <div style={{ background: 'linear-gradient(160deg,#0D2018,#0A1810)', borderRadius: 18, padding: 28, color: 'white', textAlign: 'center' as const, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 14, left: 0, right: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', color: '#E8B560', textTransform: 'uppercase' as const }}>★ Líder da categoria</div>
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', marginBottom: 14 }}><Portrait player={lider} size={104} ring="#E8B560" big /></div>
              <div style={{ fontFamily: BB, fontSize: 34, letterSpacing: '0.02em', lineHeight: 1 }}>{lider.nome}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 18 }}>{lider.periodo}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 22 }}>
                <div><div style={{ fontFamily: BB, fontSize: 32, color: '#E8B560' }}><AnimatedNumber value={lider.gols} /></div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>gols</div></div>
                <div><div style={{ fontFamily: BB, fontSize: 32, color: 'white' }}>{lider.jogos}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>jogos</div></div>
                <div><div style={{ fontFamily: BB, fontSize: 32, color: 'white' }}>{ILF_media(lider).toFixed(2)}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>média</div></div>
              </div>
            </div>
          </Reveal>
          <div>
            {ranked.map((p, i) => (
              <BarRow key={p.id} rank={i + 1} label={p.nome} sub={`${p.gols} gols · ${ILF_media(p).toFixed(2)} média`}
                value={p.gols} display={p.gols} max={max}
                color={i === 0 ? '#C4944A' : '#7A0213'} highlight={i === 0} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── TÍTULOS ─────────────────────────────────── */
const TITLE_PTS: Record<string, number> = { Libertadores: 200, Brasileiro: 100, 'Série C': 100, 'Copa do Brasil': 80, Recopa: 40, Carioca: 30, 'Rio-SP': 10, 'Primeira Liga': 10, 'Copa Rio': 10, Mundial: 400 };
const BADGE_COLOR: Record<string, string> = { Libertadores: '#C4944A', Brasileiro: '#006140', 'Série C': '#006140', 'Copa do Brasil': '#7A0213', 'Rio-SP': '#AF1E35', 'Primeira Liga': '#AF1E35', Carioca: '#AF1E35', Recopa: '#E8B560', 'Copa Rio': '#64748B', Mundial: '#E8B560' };
const BADGE_ICON: Record<string, string> = { Libertadores: '🏆', Brasileiro: '🥇', 'Série C': '🥇', 'Copa do Brasil': '🥈', 'Rio-SP': '🎖️', 'Primeira Liga': '🎖️', Carioca: '🏅', Recopa: '🏆', 'Copa Rio': '🎖️', Mundial: '🌍' };

const TITULOS_DATA: Array<{ id: string; items: [string, number][] }> = [
  { id: 'waldo',     items: [['Rio-SP', 2], ['Carioca', 1]] },
  { id: 'fred',      items: [['Brasileiro', 2], ['Carioca', 2]] },
  { id: 'cano',      items: [['Libertadores', 1], ['Recopa', 1], ['Carioca', 2]] },
  { id: 'orlando',   items: [['Carioca', 2]] },
  { id: 'hercules',  items: [['Carioca', 5]] },
  { id: 'tele',      items: [['Carioca', 2], ['Rio-SP', 2]] },
  { id: 'welfare',   items: [['Carioca', 2]] },
  { id: 'russo',     items: [['Carioca', 5]] },
  { id: 'preguinho', items: [['Carioca', 2]] },
  { id: 'washington',items: [['Brasileiro', 1], ['Carioca', 3]] },
  { id: 'magno',     items: [['Série C', 1], ['Primeira Liga', 1], ['Carioca', 1]] },
  { id: 'ezio',      items: [['Carioca', 1]] },
  { id: 'escurinho', items: [['Carioca', 2], ['Rio-SP', 1]] },
  { id: 'jair',      items: [['Carioca', 2], ['Rio-SP', 1]] },
  { id: 'zeze',      items: [['Carioca', 2]] },
];

export function TitulosSection() {
  const calcPts = (items: [string, number][]) => items.reduce((s, [t, n]) => s + (TITLE_PTS[t] || 40) * n, 0);
  const rows = TITULOS_DATA.flatMap(t => {
    const player = ILF_PLAYERS.find(p => p.id === t.id);
    if (!player) return [];
    return [{ ...player, items: t.items, pts: calcPts(t.items) }];
  }).sort((a, b) => b.pts - a.pts);
  const maxPts = Math.max(...rows.map(r => r.pts));

  return (
    <section style={{ background: '#F7F5F2', padding: '72px 32px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Kicker n="04">Títulos</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 8 }}>TÍTULOS</h2>
        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 30 }}>Cada conquista vale pontos diferentes: Mundial (400) · Libertadores (200) · Brasileiro (100) · Copa do Brasil (80) · Recopa (40) · Carioca (30) · Rio-SP e Copa Rio (10).</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {rows.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{ fontFamily: BB, fontSize: 28, color: i === 0 ? '#C4944A' : '#CBD5E0', width: 28, textAlign: 'center' as const }}>{i + 1}</div>
                <Portrait player={p} size={52} ring="#C4944A" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: BB, fontSize: 20, color: '#1a1a2e', letterSpacing: '0.02em' }}>{p.nome}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' as const }}>
                    {p.items.map(([t, n]) => (
                      <span key={t} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px 3px 6px', borderRadius: 5, color: 'white', background: BADGE_COLOR[t] || '#64748B', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 12 }}>{BADGE_ICON[t] || '🏆'}</span>{n}× {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right' as const, minWidth: 90 }}>
                  <div style={{ fontFamily: BB, fontSize: 30, color: '#7A0213', lineHeight: 1 }}><AnimatedNumber value={p.pts} /></div>
                  <div style={{ height: 6, width: 90, background: '#EFEAE3', borderRadius: 4, marginTop: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(p.pts / maxPts) * 100}%`, height: '100%', background: i === 0 ? '#C4944A' : '#7A0213', borderRadius: 4 }} />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CAMPANHAS ───────────────────────────────── */
const BRASILEIRO_ANOS: Record<string, Array<{ ano: string; label: string; color: string }>> = {
  fred: [
    { ano: '2011', label: '3º lugar', color: '#64748B' },
  ],
  cano: [
    { ano: '2022', label: '3º lugar', color: '#64748B' },
  ],
};

const TITULO_ANOS: Record<string, Partial<Record<string, string>>> = {
  waldo:      { carioca: '1959', rio_sp: '1957, 1960' },
  fred:       { carioca: '2012, 2022', brasileiro: '2010, 2012' },
  cano:       { carioca: '2022, 2023', libertadores: '2023' },
  orlando:    { carioca: '1946, 1951' },
  hercules:   { carioca: '1936, 1937, 1938, 1940, 1941' },
  tele:       { carioca: '1951, 1959', rio_sp: '1957, 1960' },
  welfare:    { carioca: '1917, 1918' },
  russo:      { carioca: '1936, 1937, 1938, 1940, 1941' },
  preguinho:  { carioca: '1931, 1936' },
  washington: { carioca: '1983, 1984, 1985', brasileiro: '1984' },
  magno:      { carioca: '2002', brasileiro: '1999', rio_sp: '2016' },
  ezio:       { carioca: '1995' },
  escurinho:  { carioca: '1951, 1959', rio_sp: '1957' },
  jair:       { carioca: '1951, 1959', rio_sp: '1957' },
  zeze:       { carioca: '1946, 1951' },
};

function getCompPhases(p: ILFPlayer) {
  const lib = (p.campanhas_raw.libertadores_vice || 0) > 0 ? { label: 'Vice-campeão', color: '#7A0213' }
    : (p.campanhas_raw.libertadores_semi || 0) > 0 ? { label: 'Semifinal', color: '#006140' }
    : (p.campanhas_raw.libertadores_quartas || 0) > 0 ? { label: 'Quartas de Final', color: '#64748B' }
    : null;
  const copa = (p.campanhas_raw.copa_brasil_vice || 0) > 0 ? { label: 'Vice-campeão', color: '#7A0213' }
    : (p.campanhas_raw.copa_brasil_semi || 0) > 0 ? { label: 'Semifinal', color: '#006140' }
    : (p.campanhas_raw.copa_brasil_quartas || 0) > 0 ? { label: 'Quartas de Final', color: '#64748B' }
    : null;
  const bra = (p.campanhas_raw.brasileiro_2 || 0) > 0 ? { label: '2º lugar', color: '#7A0213' }
    : (p.campanhas_raw.brasileiro_3 || 0) > 0 ? { label: '3º lugar', color: '#64748B' }
    : null;
  const munList: { label: string; color: string }[] = [
    ...((p.campanhas_raw.mundial_vice || 0) > 0 ? [{ label: 'Vice-campeão', color: '#E8B560' }] : []),
    ...((p.campanhas_raw.mundial_3 || 0) > 0 ? [{ label: '3º lugar', color: '#64748B' }] : []),
    ...((p.campanhas_raw.mundial_semi || 0) > 0 ? [{ label: 'Semifinal', color: '#94A3B8' }] : []),
  ];
  return { lib, copa, bra, munList };
}

export function CampanhasSection() {
  const players = [...ILF_PLAYERS].sort((a, b) => ILF_compute_scores(b).campanhas - ILF_compute_scores(a).campanhas);

  return (
    <section style={{ background: '#fff', padding: '72px 32px', borderTop: '1px solid #EDE8E0' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Kicker n="05">Campanhas</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 8 }}>CAMPANHAS</h2>
        <p style={{ fontSize: 15, color: '#64748B', marginBottom: 30, maxWidth: 640, lineHeight: 1.6 }}>
          Marcar gols é importante — mas <strong style={{ color: '#1a1a2e' }}>até onde o time chegou</strong> com aquele atacante em campo também conta. Libertadores (120→30pts), Copa Brasil (48→12pts), Brasileirão (60→30pts), Mundial (160→40pts).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
          {players.map((p, idx) => {
            const phases = getCompPhases(p);
            const campPts = ILF_compute_scores(p).campanhas;
            const hasAny = phases.lib || phases.copa || phases.bra || phases.munList.length > 0;
            return (
              <Reveal key={p.id} delay={idx * 0.04}>
                <div style={{ background: '#F7F5F2', border: '1px solid #E2E8F0', borderRadius: 14, padding: '18px 20px', height: '100%', boxSizing: 'border-box' as const }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Portrait player={p} size={44} ring="#C4944A" />
                      <div style={{ fontFamily: BB, fontSize: 19, color: '#1a1a2e', letterSpacing: '0.02em' }}>{p.nome}</div>
                    </div>
                    {campPts > 0 && <div style={{ fontFamily: BB, fontSize: 20, color: '#7A0213' }}>{campPts.toFixed(0)} pts</div>}
                  </div>
                  {hasAny ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {phases.lib && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Libertadores</span>
                          <span style={{ background: phases.lib.color, color: 'white', padding: '3px 10px', borderRadius: 999, fontWeight: 700, fontSize: 11 }}>{phases.lib.label}</span>
                        </div>
                      )}
                      {phases.copa && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Copa do Brasil</span>
                          <span style={{ background: phases.copa.color, color: 'white', padding: '3px 10px', borderRadius: 999, fontWeight: 700, fontSize: 11 }}>{phases.copa.label}</span>
                        </div>
                      )}
                      {phases.bra && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600, paddingTop: 3, flexShrink: 0 }}>Brasileirão</span>
                          {BRASILEIRO_ANOS[p.id] ? (
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, justifyContent: 'flex-end' }}>
                              {BRASILEIRO_ANOS[p.id].map(({ ano, label, color }) => (
                                <span key={ano} style={{ background: color, color: 'white', padding: '2px 8px', borderRadius: 999, fontWeight: 700, fontSize: 10, whiteSpace: 'nowrap' as const }}>
                                  {ano} · {label}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ background: phases.bra.color, color: 'white', padding: '3px 10px', borderRadius: 999, fontWeight: 700, fontSize: 11 }}>{phases.bra.label}</span>
                          )}
                        </div>
                      )}
                      {phases.munList.map((mun, mi) => (
                        <div key={mi} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Mundial de Clubes</span>
                          <span style={{ background: mun.color, color: mun.color === '#E8B560' ? '#1a1a2e' : 'white', padding: '3px 10px', borderRadius: 999, fontWeight: 700, fontSize: 11 }}>{mun.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>Sem título registrado</div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── LONGEVIDADE ─────────────────────────────── */
export function LongevidadeSection() {
  const ranked = [...ILF_PLAYERS].sort((a, b) => b.jogos - a.jogos);
  const lider = ranked[0];
  const max = lider.jogos;
  return (
    <section style={{ background: '#F7F5F2', padding: '72px 32px', borderTop: '1px solid #EDE8E0' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Kicker n="06">Longevidade · 0.25 pt por jogo</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 30 }}>LONGEVIDADE</h2>
        <div data-mc="stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 36, alignItems: 'start' }}>
          <Reveal>
            <div style={{ background: 'linear-gradient(160deg,#0D2018,#0A1810)', borderRadius: 18, padding: 28, color: 'white', textAlign: 'center' as const, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 14, left: 0, right: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', color: '#E8B560', textTransform: 'uppercase' as const }}>★ Mais jogos pelo Flu</div>
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', marginBottom: 14 }}><Portrait player={lider} size={104} ring="#E8B560" big /></div>
              <div style={{ fontFamily: BB, fontSize: 34, letterSpacing: '0.02em', lineHeight: 1 }}>{lider.nome}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 18 }}>{lider.periodo}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 22 }}>
                <div><div style={{ fontFamily: BB, fontSize: 32, color: '#E8B560' }}><AnimatedNumber value={lider.jogos} /></div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>jogos</div></div>
                <div><div style={{ fontFamily: BB, fontSize: 32, color: 'white' }}>{(lider.jogos * 0.25).toFixed(0)}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>pts</div></div>
              </div>
            </div>
          </Reveal>
          <div>
            {ranked.map((p, i) => (
              <BarRow key={p.id} rank={i + 1} label={p.nome} sub={`${p.jogos} jogos · ${(p.jogos * 0.25).toFixed(0)} pts`}
                value={p.jogos} display={p.jogos} max={max}
                color={i === 0 ? '#C4944A' : '#94A3B8'} highlight={i === 0} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
