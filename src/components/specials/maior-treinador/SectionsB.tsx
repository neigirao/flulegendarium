import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ITF_COACHES, ITF_WEIGHTS, ITF_RANKING, ITF_compute_scores, ITF_MAX_SCORES,
  ITFCoach, ITFRankingEntry, ITF_SORTED_BY_JOGOS,
} from '@/data/maior-treinador';
import { ITF_PHOTOS } from '@/data/itf-coach-photos';
import { supabase } from '@/integrations/supabase/client';
import { Kicker } from '../Kicker';
import { Reveal } from '../Reveal';
import { AnimatedNumber } from '../AnimatedNumber';
import { BarRow } from '../charts/BarRow';
import { useInView } from '@/hooks/use-in-view';

const BB = "'Bebas Neue', Impact, sans-serif";

/* ── COACH PORTRAIT (local copy) ─────────────── */
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

/* ── LONGEVIDADE ─────────────────────────────── */
export function LongevidadeSection() {
  const ranked = ITF_SORTED_BY_JOGOS;
  const lider = ranked[0];
  const max = lider.jogos;

  return (
    <section style={{ background: '#F7F5F2', padding: '72px 32px', borderTop: '1px solid #EDE8E0' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Kicker n="04">Longevidade · 0,25 pt por jogo</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 30 }}>LONGEVIDADE</h2>
        <div data-mc="stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 36, alignItems: 'start' }}>
          <Reveal>
            <div style={{ background: 'linear-gradient(160deg,#0D2018,#0A1810)', borderRadius: 18, padding: 28, color: 'white', textAlign: 'center' as const, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 14, left: 0, right: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', color: '#E8B560', textTransform: 'uppercase' as const }}>★ Mais jogos pelo Flu</div>
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                <CoachPortrait coach={lider} size={104} ring="#E8B560" big />
              </div>
              <div style={{ fontFamily: BB, fontSize: 28, letterSpacing: '0.02em', lineHeight: 1.1 }}>{lider.nome}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 18 }}>{lider.periodo}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 22 }}>
                <div>
                  <div style={{ fontFamily: BB, fontSize: 36, color: '#E8B560', lineHeight: 1 }}>
                    <AnimatedNumber value={lider.jogos} />
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>jogos</div>
                </div>
                <div>
                  <div style={{ fontFamily: BB, fontSize: 36, color: 'white', lineHeight: 1 }}>
                    {(lider.jogos * 0.25).toFixed(1)}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>pts</div>
                </div>
              </div>
            </div>
          </Reveal>
          <div>
            {ranked.map((c, i) => (
              <BarRow
                key={c.id} rank={i + 1} label={c.nome}
                sub={`${c.jogos} jogos · ${(c.jogos * 0.25).toFixed(1)} pts`}
                value={c.jogos} display={`${(c.jogos * 0.25).toFixed(1)}`} max={max}
                color={i === 0 ? '#C4944A' : '#94A3B8'} highlight={i === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── TRANSIÇÃO ───────────────────────────────── */
export function TransicaoSection() {
  return (
    <section style={{ background: '#0A1810', padding: '80px 32px', textAlign: 'center' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ fontFamily: BB, fontSize: 'clamp(28px,5vw,56px)', color: 'white', lineHeight: 1.1, letterSpacing: '0.04em', marginBottom: 20 }}>
          4 CATEGORIAS.{' '}
          <span style={{ color: '#E8B560' }}>UMA RÉGUA.</span>
          <br />
          UM SÓ NOME NO TOPO.
        </div>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
          Aproveitamento, títulos, campanhas e longevidade — cada detalhe pesou na balança. Chegou a hora do veredicto.
        </p>
      </div>
    </section>
  );
}

/* ── REVELAÇÃO ───────────────────────────────── */
type Phase = 'idle' | 'counting' | 'revealed';

export function RevelacaoSection() {
  const [ref, inView] = useInView(0.5);
  const [phase, setPhase] = useState<Phase>('idle');
  const [count, setCount] = useState(3);
  const triggered = useRef(false);

  const champ = ITF_RANKING[0];
  const second = ITF_RANKING[1];
  const diff = (champ.itf - second.itf).toFixed(1);
  const champScores = ITF_compute_scores(champ);

  useEffect(() => {
    if (inView && !triggered.current) {
      triggered.current = true;
      setPhase('counting');
    }
  }, [inView]);

  useEffect(() => {
    if (phase !== 'counting') return;
    if (count <= 0) {
      const t = setTimeout(() => setPhase('revealed'), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount(c => c - 1), 900);
    return () => clearTimeout(t);
  }, [phase, count]);

  return (
    <section
      ref={ref}
      style={{ background: 'linear-gradient(160deg,#0D2018 0%,#081510 100%)', padding: '80px 32px', color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%,rgba(196,148,74,0.08),transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
        <Kicker n="✦">A Revelação</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#E8B560', letterSpacing: '0.02em', marginBottom: 40 }}>
          O MAIOR TREINADOR DO FLUMINENSE É…
        </h2>

        {/* Countdown */}
        {phase === 'idle' && (
          <div style={{ fontFamily: BB, fontSize: 80, color: 'rgba(255,255,255,0.08)', lineHeight: 1 }}>…</div>
        )}

        {phase === 'counting' && (
          <div
            key={count}
            style={{
              fontFamily: BB, fontSize: 'clamp(100px,20vw,160px)', color: '#E8B560', lineHeight: 1,
              animation: 'popCount 0.5s ease forwards',
            }}
          >
            {count > 0 ? count : '!'}
          </div>
        )}

        {/* Reveal */}
        {phase === 'revealed' && (
          <div style={{ animation: 'revealUp 0.7s ease forwards' }}>
            {/* Champion portrait */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{ position: 'relative' }}>
                <CoachPortrait coach={champ} size={144} ring="#E8B560" big />
                <div style={{
                  position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)',
                  background: '#E8B560', color: '#0A1810', fontFamily: BB, fontSize: 13,
                  letterSpacing: '0.1em', padding: '3px 14px', borderRadius: 999, whiteSpace: 'nowrap' as const,
                }}>
                  👑 ITF CAMPEÃO
                </div>
              </div>
            </div>

            <div style={{ fontFamily: BB, fontSize: 'clamp(36px,7vw,64px)', color: 'white', letterSpacing: '0.02em', lineHeight: 1, marginTop: 24 }}>
              {champ.nome.toUpperCase()}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6, marginBottom: 28 }}>{champ.periodo}</div>

            {/* ITF Score */}
            <div style={{ display: 'inline-block', background: 'rgba(196,148,74,0.15)', border: '1px solid rgba(196,148,74,0.3)', borderRadius: 16, padding: '20px 36px', marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: '#E8B560', marginBottom: 4 }}>Nota ITF</div>
              <div style={{ fontFamily: BB, fontSize: 64, color: '#E8B560', lineHeight: 1 }}>
                {champ.itf.toFixed(1)}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                +{diff} pts acima de {second.nome}
              </div>
            </div>

            {/* Category bars */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12, maxWidth: 560, margin: '0 auto 32px' }}>
              {ITF_WEIGHTS.map(w => {
                const v = champScores[w.key];
                const maxV = ITF_MAX_SCORES[w.key] || 1;
                const pct = Math.round((v / maxV) * 100);
                return (
                  <div key={w.key} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 10px', textAlign: 'center' as const }}>
                    <div style={{ fontFamily: BB, fontSize: 22, color: w.color, lineHeight: 1 }}>{v.toFixed(0)}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginTop: 4 }}>{w.label}</div>
                    <div style={{ marginTop: 6, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: w.color, borderRadius: 2, transition: 'width 1.2s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
              {champ.legenda}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── RANKING OFICIAL ─────────────────────────── */
export function RankingOficialSection() {
  const all = ITF_RANKING;
  const max = all[0].itf;

  return (
    <section style={{ background: '#F7F5F2', padding: '72px 32px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}><Kicker n="✓">Resultado completo</Kicker></div>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', textAlign: 'center', marginBottom: 8 }}>OS MAIORES TREINADORES DO FLUMINENSE SÃO</h2>
        <p style={{ fontSize: 14, color: '#475569', textAlign: 'center', marginBottom: 36 }}>Os 11 técnicos, ordenados pela nota final do Índice Treinadores do Flu.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {all.map((c, i) => {
            const medal = i === 0 ? '#C4944A' : i === 1 ? '#A8B0BB' : i === 2 ? '#B8754A' : null;
            const scores = ITF_compute_scores(c);
            return (
              <Reveal key={c.id} delay={Math.min(i * 0.03, 0.3)}>
                <div style={{
                  background: 'white', border: medal ? `1.5px solid ${medal}` : '1px solid #E2E8F0', borderRadius: 14,
                  padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16,
                  boxShadow: i === 0 ? '0 8px 24px rgba(196,148,74,0.15)' : 'none',
                }}>
                  <div style={{ fontFamily: BB, fontSize: 26, color: medal || '#CBD5E0', width: 30, textAlign: 'center' as const, flexShrink: 0 }}>
                    {i === 0 ? '👑' : i + 1}
                  </div>
                  <CoachPortrait coach={c} size={i < 3 ? 50 : 42} ring={medal || '#CBD5E0'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: BB, fontSize: i < 3 ? 20 : 17, color: '#1a1a2e', letterSpacing: '0.02em' }}>{c.nome}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{c.periodo}</div>
                    {/* Mini-barras por categoria */}
                    <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap' as const }}>
                      {ITF_WEIGHTS.map(w => {
                        const v = scores[w.key];
                        const maxV = ITF_MAX_SCORES[w.key] || 1;
                        return (
                          <div key={w.key} title={`${w.label}: ${v.toFixed(1)}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <div style={{ width: 28, height: 4, background: '#EFEAE3', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ width: `${(v / maxV) * 100}%`, height: '100%', background: w.color, borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 8, color: '#94A3B8', letterSpacing: '0.04em' }}>{w.short}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' as const, flexShrink: 0, minWidth: 64 }}>
                    <div style={{ fontFamily: BB, fontSize: i < 3 ? 30 : 24, color: medal || '#7A0213', lineHeight: 1 }}>
                      {c.itf.toFixed(1)}
                    </div>
                    <div style={{ height: 5, maxWidth: 64, background: '#EFEAE3', borderRadius: 3, marginTop: 5, overflow: 'hidden', marginLeft: 'auto' }}>
                      <div style={{ width: `${(c.itf / max) * 100}%`, height: 5, background: medal || '#7A0213', borderRadius: 3, transition: 'width 1s ease' }} />
                    </div>
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

/* ── COMPARADOR ──────────────────────────────── */
export function ComparadorSection() {
  const [aId, setAId] = useState('fernando-diniz');
  const [bId, setBId] = useState('abel-braga');

  const ca = ITF_COACHES.find(c => c.id === aId)!;
  const cb = ITF_COACHES.find(c => c.id === bId)!;
  const sa = ITF_compute_scores(ca);
  const sb = ITF_compute_scores(cb);

  const rows: [string, number | string, number | string][] = [
    ['Aproveitamento (%)', sa.aproveitamento.toFixed(1), sb.aproveitamento.toFixed(1)],
    ['Títulos (pts)', sa.titulos.toFixed(0), sb.titulos.toFixed(0)],
    ['Campanhas (pts)', sa.campanhas.toFixed(0), sb.campanhas.toFixed(0)],
    ['Longevidade (pts)', sa.longevidade.toFixed(0), sb.longevidade.toFixed(0)],
    ['Nota ITF', (sa.aproveitamento + sa.titulos + sa.campanhas + sa.longevidade).toFixed(1),
      (sb.aproveitamento + sb.titulos + sb.campanhas + sb.longevidade).toFixed(1)],
  ];

  const Sel = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
    <select
      aria-label={label}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ fontFamily: BB, fontSize: 17, letterSpacing: '0.03em', color: '#7A0213', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 10px', background: 'white', cursor: 'pointer', maxWidth: 180 }}
    >
      {ITF_COACHES.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
    </select>
  );

  return (
    <section style={{ background: 'white', padding: '72px 32px', borderTop: '1px solid #EDE8E0' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}><Kicker n="⇔">Cara a cara</Kicker></div>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', textAlign: 'center', marginBottom: 36 }}>O COMPARADOR</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 18, alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <CoachPortrait coach={ca} size={92} ring="#7A0213" big />
            <Sel value={aId} onChange={setAId} label="Técnico A" />
          </div>
          <div style={{ fontFamily: BB, fontSize: 32, color: '#7A5500' }}>VS</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <CoachPortrait coach={cb} size={92} ring="#006140" big />
            <Sel value={bId} onChange={setBId} label="Técnico B" />
          </div>
        </div>

        <div style={{ background: '#F7F5F2', borderRadius: 16, padding: 20, border: '1px solid #E2E8F0' }}>
          {rows.map(([label, va, vb], i) => {
            const na = parseFloat(String(va));
            const nb = parseFloat(String(vb));
            const aWins = na > nb, bWins = nb > na;
            const isLast = i === rows.length - 1;
            return (
              <div
                key={label}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: isLast ? '14px 0 0' : '11px 0',
                  borderBottom: !isLast ? '1px solid #E7E1D8' : 'none',
                  borderTop: isLast ? '2px solid #C4944A33' : 'none',
                  marginTop: isLast ? 4 : 0,
                }}
              >
                <div style={{ flex: 1, textAlign: 'right' as const, fontFamily: BB, fontSize: isLast ? 28 : 22, color: aWins ? '#7A0213' : '#64748B' }}>
                  {va}{aWins && ' ◀'}
                </div>
                <div style={{ width: 160, textAlign: 'center' as const, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: isLast ? '#C4944A' : '#4B5563', padding: '0 8px' }}>
                  {label}
                </div>
                <div style={{ flex: 1, textAlign: 'left' as const, fontFamily: BB, fontSize: isLast ? 28 : 22, color: bWins ? '#006140' : '#64748B' }}>
                  {bWins && '▶ '}{vb}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── VOTAÇÃO ─────────────────────────────────── */
export function VotacaoSection() {
  const [voted, setVoted] = useState<string | null>(() => {
    try { return localStorage.getItem('itf_voted'); } catch { return null; }
  });
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    supabase
      .from('itf_votes')
      .select('coach_id')
      .then(({ data }) => {
        if (!data) return;
        const counts: Record<string, number> = {};
        data.forEach((r: { coach_id: string }) => {
          counts[r.coach_id] = (counts[r.coach_id] || 0) + 1;
        });
        setVotes(counts);
        setTotal(data.length);
      });
  }, [voted]);

  async function vote(coachId: string) {
    if (voted || loading) return;
    setLoading(true);
    const { error } = await supabase.from('itf_votes').insert({ coach_id: coachId });
    if (!error) {
      try { localStorage.setItem('itf_voted', coachId); } catch {}
      setVoted(coachId);
    }
    setLoading(false);
  }

  function shareResult() {
    const champ = ITF_RANKING[0];
    const text = `Meu voto no maior treinador do Fluminense: ${champ.nome}! Confira o ranking completo em lendasdoflu.com/especiais/maior-treinador`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
    }
  }

  return (
    <section style={{ background: 'white', padding: '72px 32px', borderTop: '1px solid #EDE8E0' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}><Kicker n="🗳">Votação</Kicker></div>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', textAlign: 'center', marginBottom: 8 }}>
          NA SUA OPINIÃO, QUEM É O MAIOR?
        </h2>
        <p style={{ fontSize: 14, color: '#475569', textAlign: 'center', marginBottom: 32 }}>
          {voted ? `Você votou em ${ITF_COACHES.find(c => c.id === voted)?.nome || voted}. Veja os resultados abaixo.` : 'Vote no técnico que você considera o maior da história do Fluminense.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {ITF_RANKING.map(c => {
            const pct = total > 0 ? Math.round(((votes[c.id] || 0) / total) * 100) : 0;
            const isVoted = voted === c.id;
            const isWinner = voted && Object.keys(votes).length > 0 && votes[c.id] === Math.max(...Object.values(votes));
            return (
              <button
                key={c.id}
                onClick={() => vote(c.id)}
                disabled={!!voted || loading}
                style={{
                  background: isVoted ? 'linear-gradient(135deg,#7A0213,#A0021C)' : '#F7F5F2',
                  border: isVoted ? '2px solid #C4944A' : isWinner && voted ? '2px solid #E8B560' : '1px solid #E2E8F0',
                  borderRadius: 14, padding: '14px 16px', cursor: voted ? 'default' : 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  textAlign: 'left' as const,
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => { if (!voted) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Progress bar background */}
                {voted && (
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${pct}%`, background: isVoted ? 'rgba(255,255,255,0.08)' : 'rgba(196,148,74,0.08)',
                    transition: 'width 1s ease',
                  }} />
                )}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CoachPortrait coach={c} size={44} ring={isVoted ? '#E8B560' : '#C4944A'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: BB, fontSize: 15, color: isVoted ? 'white' : '#1a1a2e', letterSpacing: '0.02em', lineHeight: 1.1 }}>{c.nome}</div>
                    {voted && (
                      <div style={{ fontFamily: BB, fontSize: 18, color: isVoted ? '#E8B560' : '#7A0213', lineHeight: 1, marginTop: 3 }}>
                        {pct}%
                        {isWinner && !isVoted && <span style={{ fontSize: 12, marginLeft: 4 }}>👑</span>}
                      </div>
                    )}
                  </div>
                  {isVoted && <span style={{ fontSize: 16 }}>✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        {voted && (
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
              {total} {total === 1 ? 'voto' : 'votos'} registrados
            </div>
            <button
              onClick={shareResult}
              style={{ background: '#006140', color: 'white', border: 'none', borderRadius: 10, padding: '12px 28px', fontFamily: BB, fontSize: 18, letterSpacing: '0.05em', cursor: 'pointer' }}
            >
              📤 COMPARTILHAR
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── CTA ─────────────────────────────────────── */
export function CTASection() {
  const navigate = useNavigate();
  return (
    <section style={{ background: 'linear-gradient(160deg,#7A0213,#4D000D)', color: 'white', padding: '80px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(36px,6vw,64px)', lineHeight: 0.95, letterSpacing: '0.02em', marginBottom: 16 }}>
          CONCORDOU COM O RESULTADO?
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 32 }}>
          Você conhece as lendas que esses técnicos comandaram? Coloque seu conhecimento tricolor à prova no quiz do Fluminense.
        </p>
        <button
          onClick={() => navigate('/selecionar-modo-jogo')}
          style={{ background: '#E8B560', color: '#4D000D', border: 'none', borderRadius: 12, padding: '17px 44px', fontFamily: BB, fontSize: 24, letterSpacing: '0.05em', cursor: 'pointer', boxShadow: '0 12px 32px rgba(0,0,0,0.3)', transition: 'transform 0.15s', display: 'inline-flex', alignItems: 'center', gap: 10 }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          🏆 JOGAR LENDAS DO FLU
        </button>
        <div style={{ marginTop: 28, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>lendasdoflu.com</div>
      </div>
    </section>
  );
}
