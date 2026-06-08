import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ITF_COACHES, ITF_WEIGHTS, ITF_RANKING, ITF_compute_scores, ITF_MAX_SCORES,
  ITFCoach, ITF_SORTED_BY_JOGOS,
} from '@/data/maior-treinador';
import { ITF_PHOTOS } from '@/data/itf-coach-photos';
import { Kicker } from '../Kicker';
import { Reveal } from '../Reveal';
import { AnimatedNumber } from '../AnimatedNumber';
import { BarRow } from '../charts/BarRow';

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
        <Kicker n="05">Longevidade · 0.25 pt por jogo</Kicker>
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
                    {(lider.jogos * 0.25).toFixed(0)}
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
                sub={`${c.jogos} jogos · ${(c.jogos * 0.25).toFixed(0)} pts`}
                value={c.jogos} display={c.jogos} max={max}
                color={i === 0 ? '#C4944A' : '#94A3B8'} highlight={i === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── LEGADO ──────────────────────────────────── */
const LEGADO_CARDS = [
  {
    id: 'fernando-diniz',
    destaque: 'O Campeão da América',
    texto: 'Em apenas 786 dias à frente do Fluminense, Fernando Diniz transformou o clube e escreveu o capítulo mais glorioso da história tricolor. A Copa Libertadores de 2023 — conquistada com um 2×1 épico sobre o Boca Juniors no Maracanã lotado — coroou um trabalho pautado em posse de bola audaciosa, liberdade criativa e uma identidade coletiva única. Diniz também venceu a Recopa Sul-Americana 2024, chegou à final do Mundial de Clubes e conquistou dois Cariocas. Nenhum técnico na história do Flu entregou tanto em tão pouco tempo.',
    cor: '#C4944A',
    titulo: 'Libertadores 2023 · Recopa 2024 · 2× Carioca',
  },
  {
    id: 'abel-braga',
    destaque: 'O Técnico do Coração',
    texto: 'Quatro passagens, uma lealdade irrestrita e os títulos que a geração Fred merecia. Abel Braga foi o arquiteto do Brasileirão 2012 — o campeonato mais dominante da história recente do Flu, com 77 pontos, a sequência de 11 jogos sem derrota no início da era Fred-Thiago Silva-Marcelo e a terceira estrela dourada na camiseta. Com três Cariocas em décadas diferentes, Abel atravessou o clube em momentos de euforia e de crise, sempre voltando ao Maracanã. Nenhum técnico foi mais vezes diretor técnico do Fluminense moderno.',
    cor: '#7A0213',
    titulo: 'Brasileiro 2012 · 3× Carioca',
  },
  {
    id: 'renato-gaucho',
    destaque: 'O Eterno Gaúcho',
    texto: 'Ídolo como jogador, campeão como treinador — Renato Gaúcho é um dos poucos que transcendeu as categorias do futebol tricolor. Em 2007 conquistou a Copa do Brasil, o primeiro título nacional do Flu na competição. Em 2008, levou o clube à sua primeira final de Libertadores da era moderna. E em 2025, assumiu o desafio do Mundial de Clubes, chegando à semifinal e mostrando que a paixão não envelhece. Seis passagens como técnico — sempre retornando quando o Fluminense precisava de quem o amasse de verdade.',
    cor: '#006140',
    titulo: 'Copa do Brasil 2007 · Vice Libertadores 2008 · Semi Mundial 2025',
  },
];

export function LegadoSection() {
  return (
    <section style={{ background: 'white', padding: '72px 32px', borderTop: '1px solid #EDE8E0' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Kicker n="">Legado</Kicker>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', marginBottom: 8 }}>OS TRÊS PILARES DA HISTÓRIA TRICOLOR</h2>
        <p style={{ fontSize: 15, color: '#475569', maxWidth: 580, marginBottom: 40, lineHeight: 1.6 }}>
          Entre os 15 técnicos analisados, três moldaram o clube de forma definitiva — cada um à sua maneira e em sua época.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {LEGADO_CARDS.map((card, i) => {
            const coach = ITF_COACHES.find(c => c.id === card.id);
            if (!coach) return null;
            return (
              <Reveal key={card.id} delay={i * 0.12}>
                <div style={{ background: '#F7F5F2', border: `1.5px solid ${card.cor}22`, borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ height: 5, background: `linear-gradient(90deg, ${card.cor}, ${card.cor}88)` }} />
                  <div style={{ padding: '24px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <CoachPortrait coach={coach} size={72} ring={card.cor} big />
                      <div>
                        <div style={{ fontFamily: BB, fontSize: 22, color: '#1a1a2e', letterSpacing: '0.02em', lineHeight: 1 }}>{coach.nome}</div>
                        <div style={{ fontSize: 11, color: card.cor, fontWeight: 700, marginTop: 4 }}>{card.destaque}</div>
                        <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{coach.periodo}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.65, margin: 0, flex: 1 }}>{card.texto}</p>
                    <div style={{ fontSize: 10, fontWeight: 700, color: card.cor, letterSpacing: '0.06em', borderTop: `1px solid ${card.cor}33`, paddingTop: 10, marginTop: 'auto' }}>
                      {card.titulo}
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

/* ── RANKING OFICIAL ─────────────────────────── */
export function RankingOficialSection() {
  const all = ITF_RANKING;
  const max = all[0].itf;

  return (
    <section style={{ background: '#F7F5F2', padding: '72px 32px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}><Kicker n="✓">Resultado completo</Kicker></div>
        <h2 style={{ fontFamily: BB, fontSize: 'clamp(32px,5vw,52px)', color: '#7A0213', letterSpacing: '0.02em', textAlign: 'center', marginBottom: 8 }}>OS MAIORES TREINADORES DO FLUMINENSE SÃO</h2>
        <p style={{ fontSize: 14, color: '#475569', textAlign: 'center', marginBottom: 36 }}>Os 15 finalistas, ordenados pela nota final do Índice Treinadores do Flu.</p>
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
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{c.apelido}</div>
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
    ['Clássicos (%)', sa.classicos.toFixed(1), sb.classicos.toFixed(1)],
    ['Longevidade (pts)', sa.longevidade.toFixed(0), sb.longevidade.toFixed(0)],
    ['Nota ITF', (sa.aproveitamento + sa.titulos + sa.campanhas + sa.classicos + sa.longevidade).toFixed(1),
      (sb.aproveitamento + sb.titulos + sb.campanhas + sb.classicos + sb.longevidade).toFixed(1)],
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
