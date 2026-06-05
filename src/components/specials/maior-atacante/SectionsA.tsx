import { useState } from 'react';
import { ILF_PLAYERS, ILF_WEIGHTS, ILF_RANKING, ILF_compute, ILF_compute_scores, ILF_MAX_SCORES, ILF_media, ILFPlayer, ILF_SORTED_BY_GOLS, ILF_SORTED_BY_JOGOS, ILF_SORTED_BY_CAMPANHAS } from '@/data/maior-atacante';
import { Portrait } from '../Portrait';
import { Kicker } from '../Kicker';
import { Reveal } from '../Reveal';
import { AnimatedNumber } from '../AnimatedNumber';
import { BarRow } from '../charts/BarRow';

const BB = "'Bebas Neue', Impact, sans-serif";

/* ── HERO ────────────────────────────────────── */
interface HeroProps { onStart: () => void }

export function HeroSection({ onStart }: HeroProps) {
  const ids = ['fred', 'waldo', 'cano', 'orlando', 'hercules'];
  const duelo = ids.map(id => ILF_PLAYERS.find(p => p.id === id)).filter((p): p is ILFPlayer => !!p);
  return (
    <section style={{
      background: 'radial-gradient(ellipse at 50% 0%, #0F2A1E 0%, #081510 60%, #050D0A 100%)',
      color: 'white', padding: '80px 0 60px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: '#E8B560', marginBottom: 20 }}>
          <span style={{ width: 28, height: 2, background: '#E8B560' }} />
          Índice Lendas do Flu
          <span style={{ width: 28, height: 2, background: '#E8B560' }} />
        </div>

        <h1 style={{ fontFamily: BB, fontSize: 'clamp(34px, 5.2vw, 64px)', lineHeight: 1.0, letterSpacing: '0.01em', margin: '0 auto 20px', maxWidth: 820 }}>
          QUEM É O <span style={{ color: '#E8B560' }}>MAIOR ATACANTE</span> DA HISTÓRIA DO FLUMINENSE?
        </h1>
        <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 640, margin: '0 auto 36px' }}>
          Analisamos 15 lendas tricolores com uma metodologia exclusiva para descobrir quem foi o atacante mais importante da história do clube.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 'clamp(4px,1.5vw,18px)', marginBottom: 40, flexWrap: 'wrap' as const }}>
          {duelo.map((p, i) => {
            const center = i === 2;
            return (
              <div key={p.id} style={{ textAlign: 'center', transform: center ? 'scale(1.18)' : 'scale(1)', zIndex: center ? 2 : 1, margin: center ? '0 8px' : 0 }}>
                <Portrait player={p} size={center ? 92 : 72} ring={center ? '#E8B560' : 'rgba(255,255,255,0.25)'} big={center} />
                <div style={{ fontFamily: BB, fontSize: center ? 16 : 13, marginTop: 8, color: center ? '#E8B560' : 'rgba(255,255,255,0.7)', letterSpacing: '0.03em' }}>{p.nome}</div>
              </div>
            );
          })}
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
          {[['15', 'candidatos'], ['7', 'critérios'], ['100+', 'anos de história']].map(([v, l]) => (
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
        <Kicker n="01">Os Candidatos</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 8 }}>OS 15 FINALISTAS</h2>
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
                <div style={{ position: 'absolute', top: 12, right: 14, fontFamily: BB, fontSize: 26, color: '#EFEAE3' }}>{String(i + 1).padStart(2, '0')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <Portrait player={p} size={64} ring="#C4944A" />
                  <div>
                    <div style={{ fontFamily: BB, fontSize: 22, color: '#1a1a2e', letterSpacing: '0.02em', lineHeight: 1 }}>{p.nome}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{p.periodo}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 0, borderTop: '1px dashed #E2E8F0', paddingTop: 12 }}>
                  {[['Gols', p.gols], ['Jogos', p.jogos], ['Média', ILF_media(p).toFixed(2)]].map(([l, v], k) => (
                    <div key={String(l)} style={{ flex: 1, textAlign: 'center' as const, borderRight: k < 2 ? '1px solid #F0EDE8' : 'none' }}>
                      <div style={{ fontFamily: BB, fontSize: 19, color: k === 0 ? '#7A0213' : '#1a1a2e', lineHeight: 1 }}>{v}</div>
                      <div style={{ fontSize: 9, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
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
const CRITERION_SCALE: Record<string, string> = {
  producao: '1pt/gol', classicos: '+0.5pt', decisivos: '+0.5–2pt',
  titulos: '30–400pts', campanhas: '5–160pts', premiacoes: '10–35pts', longevidade: '0.25pt/jogo',
};

export function MetodologiaSection() {
  return (
    <section style={{ background: '#F7F5F2', padding: '72px 32px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Kicker n="02">A Régua</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 8 }}>COMO DESCOBRIR O MAIOR ATACANTE DO FLUMINENSE?</h2>
        <p style={{ fontSize: 15, color: '#64748B', maxWidth: 580, marginBottom: 40 }}>A soma total de pontos brutos por todas as conquistas e contribuições — sem normalização. Cada conquista tem seu valor absoluto.</p>

        <div data-mc="stack" style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 320px) 1fr', gap: 44, alignItems: 'center' }}>
          <div style={{ background: '#0A1810', borderRadius: 16, padding: 24, color: 'white' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#E8B560', marginBottom: 16 }}>ESCALA DE PONTOS</div>
            {[
              ['Gol', '1 pt'],
              ['Bônus clássico', '+0.5 pt'],
              ['Bônus semifinal', '+1 pt'],
              ['Bônus final', '+2 pt'],
              ['Carioca', '30 pts'],
              ['Brasileiro', '100 pts'],
              ['Libertadores', '200 pts'],
              ['Mundial', '400 pts'],
              ['Por jogo', '0.25 pt'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: 13 }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
                <span style={{ fontFamily: BB, color: '#E8B560', fontSize: 15 }}>{val}</span>
              </div>
            ))}
          </div>
          <div>
            {ILF_WEIGHTS.map(w => (
              <div key={w.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0', borderBottom: '1px solid #EDE8E0' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: w.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14, color: '#1a1a2e', fontWeight: 500 }}>{w.label}</span>
                <span style={{ fontFamily: BB, fontSize: 16, color: w.color, letterSpacing: '0.02em' }}>{CRITERION_SCALE[w.key]}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 40, background: '#0A1810', borderRadius: 16, padding: '28px 32px', color: 'white', overflowX: 'auto' as const }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#E8B560', marginBottom: 14 }}>A Fórmula</div>
          <div style={{ fontFamily: BB, fontSize: 'clamp(16px,2.4vw,24px)', letterSpacing: '0.02em', lineHeight: 1.6, color: 'rgba(255,255,255,0.92)' }}>
            ILF = Produção + Bônus Clássicos + Bônus Decisivos + Títulos + Campanhas + Premiações + Longevidade
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── PRODUÇÃO OFENSIVA ───────────────────────── */
export function ProducaoSection() {
  const ranked = ILF_SORTED_BY_GOLS;
  const lider = ranked[0];
  const max = lider.gols;
  return (
    <section style={{ background: '#fff', padding: '72px 32px', borderTop: '1px solid #EDE8E0' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Kicker n="03">Gols · 1 pt por gol</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 30 }}>GOLS</h2>
        <div data-mc="stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 36, alignItems: 'center' }}>
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
const TITLE_PTS: Record<string, number> = { Libertadores: 200, Brasileiro: 100, 'Copa do Brasil': 80, Recopa: 40, Carioca: 30, 'Rio-SP': 10, 'Copa Rio': 10, Mundial: 400 };
const BADGE_COLOR: Record<string, string> = { Libertadores: '#C4944A', Brasileiro: '#006140', 'Copa do Brasil': '#7A0213', 'Rio-SP': '#AF1E35', Carioca: '#AF1E35', Recopa: '#E8B560', 'Copa Rio': '#64748B', Mundial: '#E8B560' };
const BADGE_ICON: Record<string, string> = { Libertadores: '🏆', Brasileiro: '🥇', 'Copa do Brasil': '🥈', 'Rio-SP': '🎖️', Carioca: '🏅', Recopa: '🏆', 'Copa Rio': '🎖️', Mundial: '🌍' };

const TITULOS_DATA: Array<{ id: string; items: [string, number][] }> = [
  { id: 'waldo',     items: [['Rio-SP', 1], ['Carioca', 1]] },
  { id: 'fred',      items: [['Brasileiro', 2], ['Carioca', 2]] },
  { id: 'cano',      items: [['Libertadores', 1], ['Recopa', 1], ['Carioca', 2]] },
  { id: 'orlando',   items: [['Carioca', 2]] },
  { id: 'hercules',  items: [['Carioca', 5]] },
  { id: 'tele',      items: [['Carioca', 2], ['Rio-SP', 2]] },
  { id: 'welfare',   items: [['Carioca', 2]] },
  { id: 'russo',     items: [['Carioca', 5]] },
  { id: 'preguinho', items: [['Carioca', 2]] },
  { id: 'washington',items: [['Brasileiro', 1], ['Carioca', 3]] },
  { id: 'magno',     items: [['Carioca', 1]] },
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
        <Kicker n="04">Títulos Conquistados</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 8 }}>PONTOS POR TÍTULOS CONQUISTADOS</h2>
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
interface CampEntry {
  Libertadores: number;
  CopaBrasil: number;
  brasileiro: { pos: number; times: number } | null;
}

const CAMP_DATA: Record<string, CampEntry> = {
  cano:       { Libertadores: 100, CopaBrasil: 60,  brasileiro: { pos: 8,  times: 20 } },
  fred:       { Libertadores: 60,  CopaBrasil: 60,  brasileiro: { pos: 1,  times: 20 } },
  washington: { Libertadores: 40,  CopaBrasil: 0,   brasileiro: { pos: 1,  times: 30 } },
  magno:      { Libertadores: 0,   CopaBrasil: 40,  brasileiro: { pos: 1,  times: 20 } },
  waldo:      { Libertadores: 0,   CopaBrasil: 0,   brasileiro: null },
};

const KNOCKOUT_LEGEND = [
  { v: 100, label: 'Campeão', color: '#C4944A' },
  { v: 80,  label: 'Vice',    color: '#7A0213' },
  { v: 60,  label: 'Semifinal', color: '#006140' },
  { v: 40,  label: 'Quartas', color: '#64748B' },
];

export function CampanhasSection() {
  const players = ILF_SORTED_BY_CAMPANHAS;
  const valLabel = (v: number) => KNOCKOUT_LEGEND.find(l => l.v === v)?.label || '—';
  const posColor = (pos: number) => pos === 1 ? '#C4944A' : pos <= 4 ? '#006140' : pos <= 10 ? '#64748B' : '#94A3B8';

  return (
    <section style={{ background: '#fff', padding: '72px 32px', borderTop: '1px solid #EDE8E0' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Kicker n="05">Campanhas Históricas</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 8 }}>CAMPANHAS HISTÓRICAS</h2>
        <p style={{ fontSize: 15, color: '#64748B', marginBottom: 8, maxWidth: 640, lineHeight: 1.6 }}>
          Marcar gols é importante — mas <strong style={{ color: '#1a1a2e' }}>até onde o time chegou</strong> com aquele atacante em campo também conta.
        </p>
        <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 22, maxWidth: 640, lineHeight: 1.6 }}>
          Nos mata-matas (Libertadores, Copa do Brasil e Mundial), cada fase vale pontos: <strong>campeão=200/80/400</strong>, vice=120/48/160, semi=60/24/40, quartas=30/12. No Brasileirão: 1º=100pts, 2º=60pts, 3º=30pts.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const, marginBottom: 28 }}>
          {KNOCKOUT_LEGEND.map(l => (
            <div key={l.v} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F7F5F2', border: '1px solid #E2E8F0', borderRadius: 999, padding: '6px 14px' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a2e' }}>{l.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F7F5F2', border: '1px dashed #CBD5E0', borderRadius: 999, padding: '6px 14px' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a2e' }}>Brasileirão</span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>colocação na tabela</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18 }}>
          {players.map((p, idx) => {
            const cd = CAMP_DATA[p.id];
            const br = cd?.brasileiro;
            return (
              <Reveal key={p.id} delay={idx * 0.06}>
                <div style={{ background: '#F7F5F2', border: '1px solid #E2E8F0', borderRadius: 14, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <Portrait player={p} size={46} ring="#C4944A" />
                    <div style={{ fontFamily: BB, fontSize: 20, color: '#1a1a2e', letterSpacing: '0.02em' }}>{p.nome}</div>
                  </div>
                  {(['Libertadores', 'CopaBrasil'] as const).map(key => {
                    const v = cd ? cd[key] : 0;
                    const label = key === 'CopaBrasil' ? 'Copa do Brasil' : key;
                    const color = key === 'CopaBrasil' ? '#7A0213' : '#C4944A';
                    return (
                      <div key={key} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 11, marginBottom: 4 }}>
                          <span style={{ color: '#64748B', fontWeight: 600 }}>{label}</span>
                          <span style={{ color: v >= 100 ? '#C4944A' : '#94A3B8', fontWeight: 700, fontSize: 11 }}>{valLabel(v)}</span>
                        </div>
                        <div style={{ height: 8, background: '#EFEAE3', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${v}%`, height: 8, background: color, borderRadius: 4, transition: 'width 1s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ color: '#64748B', fontWeight: 600, fontSize: 11 }}>Brasileirão</span>
                      {br ? (
                        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 5 }}>
                          <span style={{ fontFamily: BB, fontSize: 22, color: posColor(br.pos), lineHeight: 1 }}>{br.pos}º</span>
                          <span style={{ fontSize: 10, color: '#94A3B8' }}>de {br.times}{br.pos === 1 ? ' · Campeão 🥇' : ''}</span>
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>Era pré-Brasileirão</span>
                      )}
                    </div>
                    {br && (
                      <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 16 }}>
                        {Array.from({ length: br.times }).map((_, k) => (
                          <div key={k} style={{ flex: 1, height: k + 1 === br.pos ? 16 : 7, borderRadius: 2, background: k + 1 === br.pos ? posColor(br.pos) : '#E2DDD5' }} />
                        ))}
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

/* ── LONGEVIDADE ─────────────────────────────── */
export function LongevidadeSection() {
  const ranked = ILF_SORTED_BY_JOGOS;
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
