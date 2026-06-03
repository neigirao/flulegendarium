import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ILF_PLAYERS, ILF_WEIGHTS, ILF_RANKING, ILF_compute, ILF_compute_scores, ILF_MAX_SCORES, ILFPlayer } from '@/data/maior-atacante';
import { Portrait } from '../Portrait';
import { Kicker } from '../Kicker';
import { Reveal } from '../Reveal';
import { AnimatedNumber } from '../AnimatedNumber';
import { Radar } from '../charts/Radar';
import { useInView } from '@/hooks/use-in-view';

const BB = "'Bebas Neue', Impact, sans-serif";

/* ── CLÁSSICOS ───────────────────────────────── */
export function ClassicosSection() {
  const allByClassicos = [...ILF_PLAYERS].sort((a, b) => {
    const sa = a.classicos.Flamengo + a.classicos.Vasco + a.classicos.Botafogo;
    const sb = b.classicos.Flamengo + b.classicos.Vasco + b.classicos.Botafogo;
    return sb - sa;
  });
  const rei = allByClassicos[0];
  const [sel, setSel] = useState<ILFPlayer>(allByClassicos[0]);

  const axes = [{ label: 'Flamengo' }, { label: 'Vasco' }, { label: 'Botafogo' }];
  const series = [{ color: '#7A0213', fill: 'rgba(122,2,19,0.18)', values: [sel.classicos.Flamengo, sel.classicos.Vasco, sel.classicos.Botafogo] }];
  const maxVal = Math.max(...ILF_PLAYERS.map(p => Math.max(p.classicos.Flamengo, p.classicos.Vasco, p.classicos.Botafogo)));

  return (
    <section style={{ background: '#F7F5F2', padding: '72px 32px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Kicker n="02">Clássicos · +0.5pt por gol</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 30 }}>CLÁSSICOS</h2>
        <div data-mc="stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, alignItems: 'center' }}>
          <div>
            <div style={{ background: 'linear-gradient(135deg,#7A0213,#4D000D)', borderRadius: 16, padding: 24, color: 'white', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 18 }}>
              <Portrait player={rei} size={72} ring="#E8B560" big />
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', color: '#E8B560', textTransform: 'uppercase' as const, marginBottom: 4 }}>👑 Rei dos Clássicos</div>
                <div style={{ fontFamily: BB, fontSize: 30, lineHeight: 0.95 }}>{rei.nome}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{rei.classicos.Flamengo + rei.classicos.Vasco + rei.classicos.Botafogo} gols em clássicos</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
              {allByClassicos.map(p => (
                <button key={p.id} onClick={() => setSel(p)} style={{ padding: '6px 12px', borderRadius: 8, border: sel.id === p.id ? '2px solid #7A0213' : '1px solid #E2E8F0', background: sel.id === p.id ? 'rgba(122,2,19,0.07)' : 'white', color: sel.id === p.id ? '#7A0213' : '#64748B', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>{p.nome}</button>
              ))}
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
              {[['Flamengo', sel.classicos.Flamengo], ['Vasco', sel.classicos.Vasco], ['Botafogo', sel.classicos.Botafogo]].map(([l, v]) => (
                <div key={String(l)} style={{ flex: 1, background: 'white', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 8px', textAlign: 'center' as const }}>
                  <div style={{ fontFamily: BB, fontSize: 26, color: '#7A0213', lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginTop: 2 }}>vs {l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Radar axes={axes} series={series} size={320} max={maxVal || 35} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── DECISIVOS ───────────────────────────────── */
const COMP_LABEL: Record<string, string> = {
  libertadores: 'Libertadores',
  copa_brasil: 'Copa Brasil',
  carioca: 'Carioca',
  rio_sp: 'Rio-SP',
  copa_rio: 'Copa Rio',
};

export function DecisivosSection() {
  const rows = [...ILF_PLAYERS]
    .map(p => ({ ...p, totalDec: p.decisivos.finais + p.decisivos.semis + p.decisivos.quartas }))
    .sort((a, b) => b.totalDec - a.totalDec)
    .slice(0, 8);

  return (
    <section style={{ background: 'linear-gradient(160deg,#0A1810,#0D2018)', color: 'white', padding: '72px 32px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}><Kicker n="03" light>Decisivos · +0.5/1/2pts</Kicker></div>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(28px,4.5vw,46px)', textAlign: 'center', letterSpacing: '0.02em', marginBottom: 8, lineHeight: 1 }}>DECISIVOS</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 40 }}>Gols em finais (+2pts), semifinais (+1pt) e quartas (+0.5pt) — quem aparecia quando o Flu mais precisava.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map((p, i) => {
            const breakdown = Object.entries(p.decisivos_por_competicao).filter(([, v]) => v > 0);
            return (
              <Reveal key={p.id} delay={i * 0.05}>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontFamily: BB, fontSize: 26, color: i === 0 ? '#E8B560' : 'rgba(255,255,255,0.3)', width: 26, textAlign: 'center' as const, flexShrink: 0 }}>{i + 1}</div>
                  <Portrait player={p} size={48} ring={i === 0 ? '#E8B560' : 'rgba(255,255,255,0.25)'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: BB, fontSize: 20, letterSpacing: '0.02em' }}>{p.nome}</div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 5, flexWrap: 'wrap' as const }}>
                      {breakdown.map(([comp, gols]) => (
                        <span key={comp} style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.07)', borderRadius: 5, padding: '2px 8px', whiteSpace: 'nowrap' as const }}>
                          <span style={{ color: '#E8B560', fontWeight: 700 }}>{gols}</span> {COMP_LABEL[comp] || comp}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                      <span>🏆 {p.decisivos.finais} finais</span>
                      <span>{p.decisivos.semis} semis</span>
                      <span>{p.decisivos.quartas} quartas</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                    <div style={{ fontFamily: BB, fontSize: 30, color: i === 0 ? '#E8B560' : 'white', lineHeight: 1 }}><AnimatedNumber value={p.totalDec} /></div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>gols decisivos</div>
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

export function PremiacoesSection() { return null; }

export function LegadoSection() { return null; }

/* ── TRANSIÇÃO ───────────────────────────────── */
export function TransicaoSection() {
  const [ref, inView] = useInView(0.4);
  return (
    <section ref={ref} style={{ background: '#0A1810', color: 'white', padding: '90px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        height: 4, width: 120, margin: '0 auto 40px', borderRadius: 2,
        background: 'linear-gradient(90deg,#7A0213 33%,#FAFAFA 33% 66%,#006140 66%)',
        opacity: inView ? 1 : 0, transform: inView ? 'scaleX(1)' : 'scaleX(0.3)', transition: 'all 0.7s ease',
      }} />
      <div style={{ maxWidth: 640, margin: '0 auto', opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.7s ease 0.15s' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#E8B560', marginBottom: 20 }}>Fim da análise</div>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(30px,5vw,52px)', lineHeight: 1.0, letterSpacing: '0.02em', marginBottom: 18 }}>
          {ILF_WEIGHTS.length} CATEGORIAS. <span style={{ color: '#E8B560' }}>UMA RÉGUA.</span><br />UM SÓ NOME NO TOPO.
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 36 }}>
          {ILF_WEIGHTS.map((w, i) => (
            <span key={w.key}>{i > 0 ? (i === ILF_WEIGHTS.length - 1 ? ' e ' : ', ') : ''}<span style={{ color: 'rgba(255,255,255,0.85)' }}>{w.label.toLowerCase()}</span></span>
          ))} — tudo foi contado. O Índice Lendas do Flu chegou ao seu veredito.
        </p>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 700 }}>
          A revelação começa abaixo
          <span style={{ fontSize: 22, animation: 'bounceArrow 1.6s ease-in-out infinite' }}>↓</span>
        </div>
      </div>
    </section>
  );
}

/* ── REVELAÇÃO FINAL ─────────────────────────── */
type Phase = 'idle' | 'counting' | 'revealed';

export function RevelacaoSection() {
  const [ref, inView] = useInView(0.5);
  const [phase, setPhase] = useState<Phase>('idle');
  const [count, setCount] = useState(3);
  const champ = ILF_RANKING[0];
  const second = ILF_RANKING[1];
  const diff = (champ.ilf - second.ilf).toFixed(1);

  useEffect(() => {
    if (inView && phase === 'idle') setPhase('counting');
  }, [inView, phase]);

  useEffect(() => {
    if (phase !== 'counting') return;
    if (count <= 0) { setPhase('revealed'); return; }
    const t = setTimeout(() => setCount(c => c - 1), 850);
    return () => clearTimeout(t);
  }, [phase, count]);

  return (
    <section ref={ref} style={{ background: 'radial-gradient(ellipse at 50% 40%, #14301F 0%, #081510 55%, #040A07 100%)', color: 'white', padding: '90px 32px', minHeight: 620, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
      {phase !== 'revealed' ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#E8B560', marginBottom: 24 }}>A Revelação</div>
          <div key={count} style={{ fontFamily: BB, fontSize: 'clamp(100px,22vw,220px)', color: 'white', lineHeight: 0.9, textShadow: '0 0 60px rgba(232,181,96,0.4)' }}>
            <span style={{ display: 'inline-block', animation: 'popCount 0.85s ease' }}>{count > 0 ? count : '🏆'}</span>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>Maior atacante da história do Fluminense...</div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', animation: 'revealUp 0.8s cubic-bezier(0.2,0.7,0.2,1)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#E8B560', marginBottom: 6 }}>O Maior Atacante da História do Fluminense</div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <div style={{ position: 'relative' }}>
              <Portrait player={champ} size={180} ring="#E8B560" big />
              <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 40 }}>👑</div>
            </div>
          </div>
          <h2 style={{ fontFamily: BB, fontSize: 'clamp(56px,11vw,120px)', color: 'white', lineHeight: 0.9, letterSpacing: '0.02em', marginBottom: 4, textShadow: '0 0 60px rgba(232,181,96,0.3)' }}>{champ.nome}</h2>
          <div style={{ fontSize: 15, color: '#E8B560', fontWeight: 600, marginBottom: 24 }}>{champ.apelido} · {champ.periodo}</div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 28, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(232,181,96,0.3)', borderRadius: 18, padding: '20px 36px', flexWrap: 'wrap' as const, justifyContent: 'center' }}>
            <div>
              <div style={{ fontFamily: BB, fontSize: 64, color: '#E8B560', lineHeight: 1 }}><AnimatedNumber value={champ.ilf} decimals={1} /></div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', fontWeight: 700 }}>Nota ILF</div>
            </div>
            <div style={{ width: 1, height: 56, background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ textAlign: 'left' as const }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Vantagem sobre o 2º ({second.nome})</div>
              <div style={{ fontFamily: BB, fontSize: 30, color: 'white' }}>+{diff} pontos</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, maxWidth: 720, margin: '28px auto 0' }}>
            {ILF_WEIGHTS.map(w => (
              <div key={w.key} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 8px' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 3 }}>{w.short}</div>
                <div style={{ fontFamily: BB, fontSize: 22, color: '#E8B560' }}>{ILF_compute_scores(champ)[w.key].toFixed(0)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ── RANKING OFICIAL ─────────────────────────── */
export function RankingOficialSection() {
  const all = ILF_RANKING;
  const max = all[0].ilf;
  return (
    <section style={{ background: '#F7F5F2', padding: '72px 32px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}><Kicker n="✓">Resultado completo</Kicker></div>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', textAlign: 'center', marginBottom: 8 }}>O RANKING OFICIAL ILF</h2>
        <p style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 36 }}>Os 15 finalistas, ordenados pela nota final do Índice Lendas do Flu.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {all.map((p, i) => {
            const medal = i === 0 ? '#C4944A' : i === 1 ? '#A8B0BB' : i === 2 ? '#B8754A' : null;
            return (
              <Reveal key={p.id} delay={Math.min(i * 0.03, 0.3)}>
                <div style={{ background: 'white', border: medal ? `1.5px solid ${medal}` : '1px solid #E2E8F0', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: i === 0 ? '0 8px 24px rgba(196,148,74,0.15)' : 'none' }}>
                  <div style={{ fontFamily: BB, fontSize: 26, color: medal || '#CBD5E0', width: 30, textAlign: 'center' as const }}>{i + 1}</div>
                  <Portrait player={p} size={i < 3 ? 50 : 42} ring={medal || '#CBD5E0'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: BB, fontSize: i < 3 ? 20 : 17, color: '#1a1a2e', letterSpacing: '0.02em' }}>{p.nome}{i === 0 ? ' 👑' : ''}</div>
                    <div style={{ height: 5, maxWidth: 280, background: '#EFEAE3', borderRadius: 3, marginTop: 5, overflow: 'hidden' }}>
                      <div style={{ width: `${(p.ilf / max) * 100}%`, height: 5, background: medal || '#7A0213', borderRadius: 3, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                  <div style={{ fontFamily: BB, fontSize: i < 3 ? 30 : 24, color: medal || '#7A0213', lineHeight: 1 }}>{p.ilf.toFixed(1)}</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── VOTAÇÃO ─────────────────────────────────── */
export function VotacaoSection() {
  const allVote = ILF_RANKING;
  const [voted, setVoted] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, number>>(() => {
    const base: Record<string, number> = {};
    allVote.forEach((p, i) => { base[p.id] = Math.max(10, 420 - i * 28); });
    try { return JSON.parse(localStorage.getItem('ilf_votos') || 'null') || base; } catch { return base; }
  });

  const vote = (id: string) => {
    if (voted) return;
    const next = { ...results, [id]: (results[id] || 0) + 1 };
    setResults(next);
    setVoted(id);
    try { localStorage.setItem('ilf_votos', JSON.stringify(next)); } catch { /* ignore */ }
  };

  const total = allVote.reduce((s, p) => s + (results[p.id] || 0), 0) || 1;

  const share = async () => {
    const escolha = voted ? ILF_PLAYERS.find(p => p.id === voted)?.nome : allVote[0].nome;
    const texto = `Pra mim, o maior atacante da história do Fluminense é ${escolha}! 🏆 Vote no estudo do Lendas do Flu:`;
    const url = 'https://lendasdoflu.com/especiais/maior-atacante';
    if (navigator.share) {
      try { await navigator.share({ title: 'Maior Atacante da História do Fluminense', text: texto, url }); return; } catch { /* ignore */ }
    }
    try { await navigator.clipboard.writeText(`${texto} ${url}`); alert('Link copiado!'); }
    catch { window.open(`https://wa.me/?text=${encodeURIComponent(`${texto} ${url}`)}`, '_blank'); }
  };

  return (
    <section style={{ background: 'linear-gradient(160deg,#0D2018,#081510)', color: 'white', padding: '72px 32px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}><Kicker n="★" light>A voz da torcida</Kicker></div>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(30px,5vw,50px)', textAlign: 'center', letterSpacing: '0.02em', marginBottom: 8, lineHeight: 1 }}>E PRA VOCÊ, QUEM É O MAIOR?</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: 36 }}>A régua do ILF deu o veredito — mas a palavra final é da arquibancada.</p>

        <div data-mc="vote" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: 10, marginBottom: 28 }}>
          {allVote.map(p => {
            const pct = Math.round(((results[p.id] || 0) / total) * 100);
            const isVote = voted === p.id;
            return (
              <button key={p.id} onClick={() => vote(p.id)} disabled={!!voted} style={{ background: isVote ? 'rgba(232,181,96,0.15)' : 'rgba(255,255,255,0.04)', border: isVote ? '2px solid #E8B560' : '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '16px 10px', cursor: voted ? 'default' : 'pointer', color: 'white', transition: 'all 0.2s', textAlign: 'center' as const }}
                onMouseEnter={e => { if (!voted) e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Portrait player={p} size={54} ring={isVote ? '#E8B560' : 'rgba(255,255,255,0.2)'} big={isVote} /></div>
                <div style={{ fontFamily: BB, fontSize: 16, letterSpacing: '0.02em', lineHeight: 1.1, marginBottom: 2 }}>{p.nome}</div>
                {voted ? (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                      <div style={{ width: `${pct}%`, height: 5, background: isVote ? '#E8B560' : 'rgba(255,255,255,0.35)', borderRadius: 3, transition: 'width 0.6s ease' }} />
                    </div>
                    <div style={{ fontFamily: BB, fontSize: 18, color: isVote ? '#E8B560' : 'rgba(255,255,255,0.7)' }}>{pct}%</div>
                  </div>
                ) : (
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#E8B560', marginTop: 4 }}>Votar →</div>
                )}
              </button>
            );
          })}
        </div>
        {voted && (
          <div style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 24 }}>
            ✓ Voto registrado em <strong style={{ color: '#E8B560' }}>{ILF_PLAYERS.find(p => p.id === voted)?.nome}</strong> · {total.toLocaleString('pt-BR')} votos
          </div>
        )}
        <div style={{ textAlign: 'center' }}>
          <button onClick={share} style={{ background: '#fff', color: '#0D2018', border: 'none', borderRadius: 12, padding: '14px 32px', fontFamily: BB, fontSize: 18, letterSpacing: '0.05em', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', display: 'inline-flex', alignItems: 'center', gap: 10, transition: 'transform 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            📤 COMPARTILHAR MINHA ESCOLHA
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── COMPARADOR ──────────────────────────────── */
export function ComparadorSection() {
  const [aId, setAId] = useState('waldo');
  const [bId, setBId] = useState('fred');
  const pa = ILF_PLAYERS.find(p => p.id === aId)!;
  const pb = ILF_PLAYERS.find(p => p.id === bId)!;

  const rows: [string, number | string, number | string][] = [
    ['Gols', pa.gols, pb.gols],
    ['Títulos (pts)', ILF_compute_scores(pa).titulos.toFixed(0), ILF_compute_scores(pb).titulos.toFixed(0)],
    ['Clássicos (gols)', pa.classicos.Flamengo + pa.classicos.Vasco + pa.classicos.Botafogo, pb.classicos.Flamengo + pb.classicos.Vasco + pb.classicos.Botafogo],
    ['Decisivos (gols)', pa.decisivos.finais + pa.decisivos.semis + pa.decisivos.quartas, pb.decisivos.finais + pb.decisivos.semis + pb.decisivos.quartas],
    ['Nota ILF', ILF_compute(pa).toFixed(1), ILF_compute(pb).toFixed(1)],
  ];

  const Sel = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ fontFamily: BB, fontSize: 20, letterSpacing: '0.03em', color: '#7A0213', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 10px', background: 'white', cursor: 'pointer', maxWidth: 160 }}>
      {ILF_PLAYERS.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
    </select>
  );

  return (
    <section style={{ background: '#fff', padding: '72px 32px', borderTop: '1px solid #EDE8E0' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}><Kicker n="10">Cara a cara</Kicker></div>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', textAlign: 'center', marginBottom: 36 }}>O COMPARADOR</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 18, alignItems: 'center', marginBottom: 24 }}>
          <div style={{ textAlign: 'center' }}><Portrait player={pa} size={92} ring="#7A0213" big /><div style={{ marginTop: 10 }}><Sel value={aId} onChange={setAId} /></div></div>
          <div style={{ fontFamily: BB, fontSize: 32, color: '#C4944A' }}>VS</div>
          <div style={{ textAlign: 'center' }}><Portrait player={pb} size={92} ring="#006140" big /><div style={{ marginTop: 10 }}><Sel value={bId} onChange={setBId} /></div></div>
        </div>
        <div style={{ background: '#F7F5F2', borderRadius: 16, padding: 20, border: '1px solid #E2E8F0' }}>
          {rows.map(([label, va, vb], i) => {
            const na = parseFloat(String(va)), nb = parseFloat(String(vb));
            const aWins = na > nb, bWins = nb > na;
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', padding: '11px 0', borderBottom: i < rows.length - 1 ? '1px solid #E7E1D8' : 'none' }}>
                <div style={{ flex: 1, textAlign: 'right' as const, fontFamily: BB, fontSize: 24, color: aWins ? '#7A0213' : '#94A3B8' }}>{va}{aWins && ' ◀'}</div>
                <div style={{ width: 150, textAlign: 'center' as const, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#94A3B8' }}>{label}</div>
                <div style={{ flex: 1, textAlign: 'left' as const, fontFamily: BB, fontSize: 24, color: bWins ? '#006140' : '#94A3B8' }}>{bWins && '▶ '}{vb}</div>
              </div>
            );
          })}
        </div>
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
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(36px,6vw,64px)', lineHeight: 0.95, letterSpacing: '0.02em', marginBottom: 16 }}>VOCÊ REALMENTE CONHECE AS LENDAS DO FLU?</h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 32 }}>Dos 15 finalistas, quantos você reconheceria apenas pela foto? Coloque seu conhecimento tricolor à prova.</p>
        <button onClick={() => navigate('/selecionar-modo-jogo')} style={{ background: '#E8B560', color: '#4D000D', border: 'none', borderRadius: 12, padding: '17px 44px', fontFamily: BB, fontSize: 24, letterSpacing: '0.05em', cursor: 'pointer', boxShadow: '0 12px 32px rgba(0,0,0,0.3)', transition: 'transform 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          🏆 JOGAR LENDAS DO FLU
        </button>
        <div style={{ marginTop: 28, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>lendasdoflu.com</div>
      </div>
    </section>
  );
}
