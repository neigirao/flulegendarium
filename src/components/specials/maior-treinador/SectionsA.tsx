import { useState } from 'react';
import {
  ITF_COACHES, ITF_WEIGHTS, ITF_compute_scores, ITF_MAX_SCORES,
  ITFCoach, ITF_SORTED_BY_APROVEITAMENTO, ITF_SORTED_BY_TITULOS, ITF_SORTED_BY_CAMPANHAS, ITF_SORTED_BY_CLASSICOS,
  CAMPANHA_PONTOS_T,
} from '@/data/maior-treinador';
import { ITF_PHOTOS } from '@/data/itf-coach-photos';
import { Kicker } from '../Kicker';
import { Reveal } from '../Reveal';
import { AnimatedNumber } from '../AnimatedNumber';
import { BarRow } from '../charts/BarRow';

const BB = "'Bebas Neue', Impact, sans-serif";

/* ── COACH PORTRAIT ──────────────────────────── */
function supabaseTransform(src: string, displaySize: number): string {
  if (!src.includes('supabase.co/storage/v1/object/public/')) return src;
  const w = Math.min(Math.ceil(displaySize * 2), 400);
  return src.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
    + `?width=${w}&quality=75&format=webp`;
}

interface CoachPortraitProps {
  coach: ITFCoach;
  size?: number;
  ring?: string;
  big?: boolean;
}

function CoachPortrait({ coach, size = 96, ring = '#C4944A', big }: CoachPortraitProps) {
  const rawSrc = ITF_PHOTOS[coach.id];
  const [imgSrc, setImgSrc] = useState(() => rawSrc ? supabaseTransform(rawSrc, size) : rawSrc);
  const [failed, setFailed] = useState(false);
  const showPhoto = !!imgSrc && !failed;

  function handleError() {
    if (rawSrc && imgSrc !== rawSrc) {
      setImgSrc(rawSrc);
    } else {
      setFailed(true);
    }
  }

  const initials = coach.nome.split(' ').map(w => w[0]).slice(0, 2).join('');
  const border = big ? 4 : 3;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%', overflow: 'hidden',
        background: 'linear-gradient(160deg, #0D2018 0%, #143026 55%, #0A1810 100%)',
        border: `${border}px solid ${ring}`,
        display: 'flex', alignItems: showPhoto ? 'center' : 'flex-end', justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)', position: 'relative',
      }}>
        {showPhoto ? (
          <img
            src={imgSrc}
            alt={coach.nome}
            loading="lazy"
            width={size}
            height={size}
            onError={handleError}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
          />
        ) : (
          <>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '22%',
              background: 'linear-gradient(90deg,#7A0213 33%,#FAFAFA 33% 66%,#006140 66%)',
              opacity: 0.85,
            }} />
            <span style={{
              fontFamily: BB,
              fontSize: size * 0.42, color: 'rgba(255,255,255,0.92)',
              letterSpacing: '0.02em', zIndex: 1, marginBottom: '14%',
            }}>
              {initials}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ── HERO ────────────────────────────────────── */
interface HeroProps { onStart: () => void }

export function HeroSection({ onStart }: HeroProps) {
  return (
    <section style={{
      background: 'radial-gradient(ellipse at 50% 0%, #0F2A1E 0%, #081510 60%, #050D0A 100%)',
      color: 'white', padding: '0 0 60px', position: 'relative', overflow: 'hidden',
      minHeight: 'clamp(560px, 80vh, 760px)',
    }}>
      <div style={{ height: 5, background: 'linear-gradient(90deg,#7A0213 33%,#FAFAFA 33% 66%,#006140 66%)' }} />

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 32px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: '#E8B560', marginBottom: 20 }}>
          <span style={{ width: 28, height: 2, background: '#E8B560' }} />
          Índice Treinadores do Flu
          <span style={{ width: 28, height: 2, background: '#E8B560' }} />
        </div>

        <h1 style={{ fontFamily: BB, fontSize: 'clamp(30px,4.6vw,56px)', lineHeight: 1.08, letterSpacing: '0.01em', margin: '0 auto 24px', maxWidth: 820 }}>
          QUEM É O <span style={{ color: '#E8B560' }}>MAIOR TREINADOR</span> DA HISTÓRIA DO FLUMINENSE?
        </h1>
        <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 640, margin: '0 auto 36px' }}>
          Analisamos 15 técnicos tricolores com uma metodologia exclusiva para descobrir quem foi o treinador mais importante da história do clube.
        </p>

        {/* SVG: prancheta tática */}
        <div style={{ position: 'relative', width: 'min(380px,86vw)', height: 220, margin: '8px auto 30px' }}>
          <svg viewBox="0 0 380 220" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
            <defs>
              <radialGradient id="heroGlowT" cx="50%" cy="42%" r="60%">
                <stop offset="0%" stopColor="#1F5A3E" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0A1810" stopOpacity="0" />
              </radialGradient>
            </defs>

            <ellipse cx="190" cy="110" rx="200" ry="120" fill="url(#heroGlowT)" />

            {/* Prancheta: fundo */}
            <rect x="60" y="20" width="260" height="180" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />

            {/* Gramado */}
            <rect x="72" y="32" width="236" height="156" rx="6" fill="#0D4A28" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />

            {/* Linhas do campo */}
            <line x1="190" y1="32" x2="190" y2="188" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <rect x="72" y="32" width="236" height="156" rx="6" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <circle cx="190" cy="110" r="26" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            {/* Área esquerda */}
            <rect x="72" y="75" width="40" height="70" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1" />
            {/* Área direita */}
            <rect x="268" y="75" width="40" height="70" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1" />

            {/* Jogadores lado esquerdo (4-4-2) */}
            {/* Goleiro */}
            <circle cx="86" cy="110" r="7" fill="#7A0213" stroke="#E8B560" strokeWidth="1.5" />
            {/* Zagueiros */}
            <circle cx="110" cy="82" r="6" fill="#006140" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <circle cx="110" cy="110" r="6" fill="#006140" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <circle cx="110" cy="138" r="6" fill="#006140" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            {/* Meias */}
            <circle cx="145" cy="70" r="6" fill="#C4944A" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <circle cx="145" cy="95" r="6" fill="#C4944A" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <circle cx="145" cy="125" r="6" fill="#C4944A" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <circle cx="145" cy="150" r="6" fill="#C4944A" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            {/* Atacantes */}
            <circle cx="172" cy="90" r="6" fill="#FAFAFA" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
            <circle cx="172" cy="130" r="6" fill="#FAFAFA" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />

            {/* Seta tática com animação */}
            <path d="M172 90 Q 200 70 220 85" stroke="#E8B560" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 5" fill="none" opacity="0.7">
              <animate attributeName="opacity" values="0.2;0.9;0.2" dur="2.4s" repeatCount="indefinite" />
            </path>
            <path d="M172 130 Q 210 150 230 135" stroke="#E8B560" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 5" fill="none" opacity="0.7">
              <animate attributeName="opacity" values="0.2;0.9;0.2" dur="2.8s" repeatCount="indefinite" />
            </path>
          </svg>

          <img
            src="/lovable-uploads/flu-logo-sm.webp"
            alt="Fluminense"
            fetchPriority="high"
            width={80}
            height={80}
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 80, height: 80, objectFit: 'contain' as const, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }}
          />
        </div>

        <div style={{ fontFamily: BB, fontSize: 17, color: '#E8B560', letterSpacing: '0.08em', marginBottom: 6 }}>
          15 TÉCNICOS · UM LEGADO EM DISPUTA
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 36, letterSpacing: '0.04em' }}>
          De Luís Vinhaes a Fernando Diniz — mais de 80 anos de história tricolor
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
          {([['15', 'técnicos'], ['5', 'critérios'], ['80+', 'anos de história']] as [string, string][]).map(([v, l]) => (
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

/* ── METODOLOGIA ─────────────────────────────── */
const CRITERIOS = [
  {
    key: 'aproveitamento',
    label: 'Aproveitamento',
    pct: '35%',
    desc: '% de pontos por jogo no Fluminense',
    color: '#7A0213',
  },
  {
    key: 'titulos',
    label: 'Títulos',
    pct: '25%',
    desc: 'Pontuação pelo peso de cada título conquistado',
    color: '#C4944A',
  },
  {
    key: 'campanhas',
    label: 'Campanhas',
    pct: '20%',
    desc: 'Finais e semifinais de torneios expressivos',
    color: '#006140',
  },
  {
    key: 'classicos',
    label: 'Clássicos',
    pct: '15%',
    desc: 'Aproveitamento nos clássicos contra Fla, Vasco e Botafogo',
    color: '#AF1E35',
  },
  {
    key: 'longevidade',
    label: 'Longevidade',
    pct: '10%',
    desc: 'Total de jogos dirigidos pelo clube',
    color: '#94A3B8',
  },
];

export function MetodologiaSection() {
  return (
    <section style={{ background: '#F7F5F2', padding: '72px 32px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Kicker n="">Régua</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 8 }}>COMO DESCOBRIR O MAIOR TREINADOR DO FLUMINENSE?</h2>
        <p style={{ fontSize: 15, color: '#475569', maxWidth: 600, marginBottom: 40, lineHeight: 1.6 }}>
          A soma direta de pontos brutos por todas as categorias — sem normalização. 5 critérios, cada conquista e performance com seu valor absoluto.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {CRITERIOS.map((c, i) => {
            const badgeTextColor = c.color === '#C4944A' || c.color === '#94A3B8' ? '#1a1a2e' : 'white';
            return (
              <div key={c.key} style={{ background: 'white', border: '1px solid #EDE8E0', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 10, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: BB, fontSize: 18, color: badgeTextColor, letterSpacing: '0.02em' }}>{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: BB, fontSize: 17, color: '#1a1a2e', letterSpacing: '0.02em' }}>{c.label}</span>
                    <span style={{ fontFamily: BB, fontSize: 14, color: c.color, letterSpacing: '0.02em', flexShrink: 0 }}>{c.pct}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, margin: 0 }}>{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 32, background: '#0A1810', borderRadius: 16, padding: '28px 32px', color: 'white', overflowX: 'auto' as const }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#E8B560', marginBottom: 14 }}>A Fórmula</div>
          <div style={{ fontFamily: BB, fontSize: 'clamp(14px,2.2vw,22px)', letterSpacing: '0.02em', lineHeight: 1.6, color: 'rgba(255,255,255,0.92)' }}>
            Maior Treinador do Flu = Aproveitamento + Títulos + Campanhas + Clássicos + Longevidade
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FINALISTAS ──────────────────────────────── */
export function FinalistasSection() {
  const [sel, setSel] = useState<ITFCoach | null>(null);
  return (
    <section id="finalistas-t" style={{ background: 'white', padding: '72px 32px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <Kicker n="">Candidatos</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 8 }}>TÉCNICOS ANALISADOS</h2>
        <p style={{ fontSize: 15, color: '#475569', maxWidth: 560, marginBottom: 36 }}>De Luís Vinhaes a Fernando Diniz — mais de 80 anos de estratégia tricolor. Clique em um nome para ver os detalhes.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
          {ITF_COACHES.map((c, i) => (
            <Reveal key={c.id} delay={(i % 4) * 0.05}>
              <div
                onClick={() => setSel(c)}
                style={{ background: '#F7F5F2', border: '1px solid #E2E8F0', borderRadius: 16, padding: 18, cursor: 'pointer', transition: 'transform 0.18s, box-shadow 0.18s', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <CoachPortrait coach={c} size={64} ring="#C4944A" />
                  <div>
                    <div style={{ fontFamily: BB, fontSize: 18, color: '#1a1a2e', letterSpacing: '0.02em', lineHeight: 1.1 }}>{c.nome}</div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{c.periodo}</div>
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
                <CoachPortrait coach={sel} size={88} ring="#E8B560" big />
                <div>
                  <div style={{ fontFamily: BB, fontSize: 28, letterSpacing: '0.02em', lineHeight: 0.95 }}>{sel.nome}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{sel.periodo}</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 22, fontStyle: 'italic', borderLeft: '3px solid #C4944A', paddingLeft: 14 }}>{sel.legenda}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
                {[
                  ['Jogos', sel.jogos],
                  ['Vitórias', sel.vitorias],
                  ['Aproveit.', `${((sel.vitorias * 3 + sel.empates) / (sel.jogos * 3) * 100).toFixed(0)}%`],
                ].map(([l, v]) => (
                  <div key={String(l)} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 8px', textAlign: 'center' as const }}>
                    <div style={{ fontFamily: BB, fontSize: 22, color: '#E8B560' }}>{v}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Pontuação por critério</div>
              {(() => {
                const selScores = ITF_compute_scores(sel);
                return ITF_WEIGHTS.map(w => (
                  <div key={w.key} style={{ marginBottom: 9 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span style={{ color: 'rgba(255,255,255,0.65)' }}>{w.label}</span>
                      <span style={{ fontFamily: BB, color: 'white' }}>{selScores[w.key].toFixed(1)}</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${ITF_MAX_SCORES[w.key] > 0 ? (selScores[w.key] / ITF_MAX_SCORES[w.key]) * 100 : 0}%`, height: '100%', background: '#C4944A', borderRadius: 4 }} />
                    </div>
                  </div>
                ));
              })()}
              <div style={{ marginTop: 22, padding: 16, background: 'linear-gradient(135deg, rgba(196,148,74,0.18), rgba(122,2,19,0.18))', borderRadius: 12, textAlign: 'center' as const }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', fontWeight: 700 }}>Nota Maior Treinador do Flu</div>
                <div style={{ fontFamily: BB, fontSize: 48, color: '#E8B560', lineHeight: 1 }}>
                  {(ITF_compute_scores(sel).aproveitamento + ITF_compute_scores(sel).titulos + ITF_compute_scores(sel).campanhas + ITF_compute_scores(sel).classicos + ITF_compute_scores(sel).longevidade).toFixed(1)}
                </div>
              </div>
              {sel.premios.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>Destaques</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {sel.premios.map((p, i) => (
                      <li key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', paddingLeft: 14, borderLeft: '2px solid rgba(196,148,74,0.4)', lineHeight: 1.4 }}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ── APROVEITAMENTO ──────────────────────────── */
export function AproveitamentoSection() {
  const ranked = ITF_SORTED_BY_APROVEITAMENTO;
  const lider = ranked[0];
  const liderPct = ITF_compute_scores(lider).aproveitamento;
  const max = liderPct;

  return (
    <section style={{ background: '#F7F5F2', padding: '72px 32px', borderTop: '1px solid #EDE8E0' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Kicker n="01">Aproveitamento · % de pontos/jogo</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 30 }}>APROVEITAMENTO</h2>
        <div data-mc="stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 36, alignItems: 'start' }}>
          <Reveal>
            <div style={{ background: 'linear-gradient(160deg,#0D2018,#0A1810)', borderRadius: 18, padding: 28, color: 'white', textAlign: 'center' as const, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 14, left: 0, right: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', color: '#E8B560', textTransform: 'uppercase' as const }}>★ Líder da categoria</div>
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                <CoachPortrait coach={lider} size={104} ring="#E8B560" big />
              </div>
              <div style={{ fontFamily: BB, fontSize: 28, letterSpacing: '0.02em', lineHeight: 1.1 }}>{lider.nome}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 18 }}>{lider.periodo}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap' as const }}>
                <div>
                  <div style={{ fontFamily: BB, fontSize: 36, color: '#E8B560', lineHeight: 1 }}>
                    <AnimatedNumber value={Math.round(liderPct)} />%
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>aproveit.</div>
                </div>
                <div>
                  <div style={{ fontFamily: BB, fontSize: 36, color: 'white', lineHeight: 1 }}>{lider.vitorias}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>vitórias</div>
                </div>
                <div>
                  <div style={{ fontFamily: BB, fontSize: 36, color: 'white', lineHeight: 1 }}>{lider.jogos}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>jogos</div>
                </div>
              </div>
            </div>
          </Reveal>
          <div>
            {ranked.map((c, i) => {
              const pct = ITF_compute_scores(c).aproveitamento;
              return (
                <BarRow
                  key={c.id} rank={i + 1} label={c.nome}
                  sub={`${pct.toFixed(1)}% · ${c.vitorias}V ${c.empates}E ${c.derrotas}D`}
                  value={pct} display={`${pct.toFixed(1)}%`} max={max}
                  color={i === 0 ? '#C4944A' : '#7A0213'} highlight={i === 0}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── TÍTULOS ─────────────────────────────────── */
const BADGE_COLOR_T: Record<string, string> = {
  libertadores: '#C4944A', brasileiro: '#006140', copa_brasil: '#7A0213',
  recopa: '#E8B560', carioca: '#AF1E35', rio_sp: '#64748B', copa_rio: '#64748B',
  mundial: '#E8B560', primeira_liga: '#AF1E35', taca_guanabara: '#64748B', serie_c: '#006140',
};
const BADGE_ICON_T: Record<string, string> = {
  libertadores: '🏆', brasileiro: '🥇', copa_brasil: '🏅', recopa: '🏆', carioca: '🎖️',
  rio_sp: '🎖️', copa_rio: '🎖️', mundial: '🌍', primeira_liga: '🥈', taca_guanabara: '🎖️', serie_c: '🥇',
};
const BADGE_LABEL_T: Record<string, string> = {
  libertadores: 'Libertadores', brasileiro: 'Brasileiro', copa_brasil: 'Copa do Brasil',
  recopa: 'Recopa', carioca: 'Carioca', rio_sp: 'Rio-SP', copa_rio: 'Copa Rio',
  mundial: 'Mundial', primeira_liga: 'Primeira Liga', taca_guanabara: 'Taça Guanabara', serie_c: 'Série C',
};

export function TitulosSection() {
  const rows = ITF_SORTED_BY_TITULOS.map(c => ({
    ...c,
    pts: ITF_compute_scores(c).titulos,
  }));
  const maxPts = Math.max(...rows.map(r => r.pts), 1);

  return (
    <section style={{ background: 'white', padding: '72px 32px', borderTop: '1px solid #EDE8E0' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Kicker n="02">Títulos</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 8 }}>TÍTULOS</h2>
        <p style={{ fontSize: 14, color: '#475569', marginBottom: 30 }}>
          Cada conquista vale pontos diferentes: Mundial (200) · Libertadores (100) · Brasileiro (50) · Copa do Brasil (40) · Recopa (20) · Carioca (15) · Série C (8) · Rio-SP, Copa Rio, Primeira Liga (5) · Taça Guanabara (3).
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {rows.map((c, i) => {
            const tituloEntries = Object.entries(c.titulos_raw) as [string, number][];
            return (
              <Reveal key={c.id} delay={i * 0.05}>
                <div style={{ background: '#F7F5F2', border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{ fontFamily: BB, fontSize: 28, color: i === 0 ? '#C4944A' : '#CBD5E0', width: 28, textAlign: 'center' as const }}>{i + 1}</div>
                  <CoachPortrait coach={c} size={52} ring="#C4944A" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: BB, fontSize: 20, color: '#1a1a2e', letterSpacing: '0.02em' }}>{c.nome}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' as const }}>
                      {tituloEntries.length > 0 ? tituloEntries.map(([t, n]) => (
                        <span key={t} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px 3px 6px', borderRadius: 5, color: BADGE_COLOR_T[t] === '#E8B560' ? '#1a1a2e' : 'white', background: BADGE_COLOR_T[t] || '#64748B', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 12 }}>{BADGE_ICON_T[t] || '🏆'}</span>{n}× {BADGE_LABEL_T[t] || t}
                        </span>
                      )) : (
                        <span style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>Sem títulos registrados</span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' as const, minWidth: 90 }}>
                    <div style={{ fontFamily: BB, fontSize: 30, color: c.pts > 0 ? '#7A0213' : '#CBD5E0', lineHeight: 1 }}>
                      {c.pts > 0 ? <AnimatedNumber value={c.pts} /> : '—'}
                    </div>
                    {c.pts > 0 && (
                      <div style={{ height: 6, width: 90, background: '#EFEAE3', borderRadius: 4, marginTop: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${(c.pts / maxPts) * 100}%`, height: '100%', background: i === 0 ? '#C4944A' : '#7A0213', borderRadius: 4 }} />
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── CAMPANHAS ───────────────────────────────── */
type CampanhaKey = keyof typeof CAMPANHA_PONTOS_T;

const CAMPANHA_LABEL: Record<CampanhaKey, string> = {
  libertadores_vice: 'Vice-campeão Libertadores',
  libertadores_semi: 'Semifinal Libertadores',
  libertadores_quartas: 'Quartas Libertadores',
  libertadores_oitavas: 'Oitavas Libertadores',
  sulamericana_vice: 'Vice-campeão Sul-Americana',
  sulamericana_semi: 'Semifinal Sul-Americana',
  copa_brasil_vice: 'Vice-campeão Copa do Brasil',
  copa_brasil_semi: 'Semifinal Copa do Brasil',
  copa_brasil_quartas: 'Quartas Copa do Brasil',
  copa_brasil_oitavas: 'Oitavas Copa do Brasil',
  brasileiro_2: '2º lugar Brasileiro',
  brasileiro_3: '3º lugar Brasileiro',
  brasileiro_4: '4º lugar Brasileiro',
  brasileiro_5: '5º lugar Brasileiro',
  brasileiro_6: '6º lugar Brasileiro',
  mundial_vice: 'Vice-campeão Mundial',
  mundial_3: '3º lugar Mundial',
  mundial_semi: 'Semifinal Mundial',
};

const CAMPANHA_COLOR: Partial<Record<CampanhaKey, string>> = {
  libertadores_vice: '#7A0213', libertadores_semi: '#006140', libertadores_quartas: '#64748B', libertadores_oitavas: '#94A3B8',
  sulamericana_vice: '#7A0213', sulamericana_semi: '#006140',
  copa_brasil_vice: '#E8B560', copa_brasil_semi: '#006140', copa_brasil_quartas: '#64748B', copa_brasil_oitavas: '#94A3B8',
  brasileiro_2: '#7A0213', brasileiro_3: '#64748B', brasileiro_4: '#94A3B8', brasileiro_5: '#94A3B8', brasileiro_6: '#94A3B8',
  mundial_vice: '#E8B560', mundial_3: '#64748B', mundial_semi: '#64748B',
};

export function CampanhasSection() {
  const coaches = ITF_SORTED_BY_CAMPANHAS;

  return (
    <section style={{ background: '#F7F5F2', padding: '72px 32px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Kicker n="03">Campanhas</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 8 }}>CAMPANHAS</h2>
        <p style={{ fontSize: 15, color: '#64748B', marginBottom: 30, maxWidth: 640, lineHeight: 1.6 }}>
          Finais e fases avançadas contam — até onde o time chegou com aquele técnico no banco. Libertadores, Copa do Brasil, Mundial e Brasileirão têm seus pontos específicos.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
          {coaches.map((c, idx) => {
            const campPts = ITF_compute_scores(c).campanhas;
            const campEntries = Object.entries(c.campanhas_raw) as [CampanhaKey, number][];
            const hasAny = campEntries.length > 0;
            return (
              <Reveal key={c.id} delay={idx * 0.04}>
                <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: '18px 20px', height: '100%', boxSizing: 'border-box' as const }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <CoachPortrait coach={c} size={44} ring="#C4944A" />
                      <div style={{ fontFamily: BB, fontSize: 17, color: '#1a1a2e', letterSpacing: '0.02em' }}>{c.nome}</div>
                    </div>
                    {campPts > 0 && <div style={{ fontFamily: BB, fontSize: 20, color: '#7A0213' }}>{campPts.toFixed(0)} pts</div>}
                  </div>
                  {hasAny ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {campEntries.map(([k, n]) => {
                        const label = CAMPANHA_LABEL[k] || k;
                        const color = CAMPANHA_COLOR[k] || '#64748B';
                        const textColor = color === '#E8B560' ? '#1a1a2e' : 'white';
                        return (
                          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, color: '#64748B' }}>{label}</span>
                            <span style={{ background: color, color: textColor, padding: '2px 9px', borderRadius: 999, fontWeight: 700, fontSize: 10, whiteSpace: 'nowrap' as const }}>
                              {n > 1 ? `${n}×` : ''} {CAMPANHA_PONTOS_T[k]} pts
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>Sem campanhas registradas</div>
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

/* ── CLÁSSICOS ───────────────────────────────── */
export function ClassicosSection() {
  const coaches = ITF_SORTED_BY_CLASSICOS;

  return (
    <section style={{ background: 'white', padding: '72px 32px', borderTop: '1px solid #EDE8E0' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Kicker n="04">Clássicos · aproveitamento %</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 8 }}>CLÁSSICOS</h2>
        <p style={{ fontSize: 14, color: '#475569', marginBottom: 36 }}>
          Aproveitamento de pontos nos clássicos contra Flamengo, Vasco e Botafogo — quem dominava os rivais históricos.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {coaches.map((c, i) => {
            const classicoPct = ITF_compute_scores(c).classicos;
            const cl = c.classicos;
            const totV = cl.Flamengo.v + cl.Vasco.v + cl.Botafogo.v;
            const totE = cl.Flamengo.e + cl.Vasco.e + cl.Botafogo.e;
            const totD = cl.Flamengo.d + cl.Vasco.d + cl.Botafogo.d;
            return (
              <Reveal key={c.id} delay={i * 0.04}>
                <div style={{ background: '#F7F5F2', border: '1px solid #E2E8F0', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontFamily: BB, fontSize: 24, color: i === 0 ? '#C4944A' : '#CBD5E0', width: 28, textAlign: 'center' as const, flexShrink: 0 }}>{i + 1}</div>
                  <CoachPortrait coach={c} size={48} ring={i === 0 ? '#C4944A' : '#E2E8F0'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: BB, fontSize: 19, color: '#1a1a2e', letterSpacing: '0.02em' }}>{c.nome}</div>
                    <div style={{ display: 'flex', gap: 14, marginTop: 5, fontSize: 11, color: '#64748B', flexWrap: 'wrap' as const }}>
                      <span><span style={{ fontWeight: 700, color: '#7A0213' }}>{cl.Flamengo.v}</span>V <span style={{ fontWeight: 700, color: '#64748B' }}>{cl.Flamengo.e}</span>E <span style={{ fontWeight: 700, color: '#94A3B8' }}>{cl.Flamengo.d}</span>D vs Fla</span>
                      <span><span style={{ fontWeight: 700, color: '#7A0213' }}>{cl.Vasco.v}</span>V <span style={{ fontWeight: 700, color: '#64748B' }}>{cl.Vasco.e}</span>E <span style={{ fontWeight: 700, color: '#94A3B8' }}>{cl.Vasco.d}</span>D vs Vas</span>
                      <span><span style={{ fontWeight: 700, color: '#7A0213' }}>{cl.Botafogo.v}</span>V <span style={{ fontWeight: 700, color: '#64748B' }}>{cl.Botafogo.e}</span>E <span style={{ fontWeight: 700, color: '#94A3B8' }}>{cl.Botafogo.d}</span>D vs Bot</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' as const, flexShrink: 0, minWidth: 70 }}>
                    <div style={{ fontFamily: BB, fontSize: 26, color: i === 0 ? '#C4944A' : '#7A0213', lineHeight: 1 }}>{classicoPct.toFixed(0)}%</div>
                    <div style={{ fontSize: 9, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>{totV}V {totE}E {totD}D</div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
