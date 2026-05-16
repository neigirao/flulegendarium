import React, { useEffect, useCallback } from "react";
import { RootLayout } from "@/components/RootLayout";
import { SEOManager } from "@/components/seo/SEOManager";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/analytics";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { DailyChallengeWidget } from "@/components/challenges/DailyChallengeWidget";
import { usePlayStreak } from "@/hooks/use-play-streak";

const DECADES = [
  { num: '60s', lab: 'Tricampeão' },
  { num: '70s', lab: 'Bi 70/71' },
  { num: '80s', lab: 'Brasileiro', featured: true },
  { num: '90s', lab: 'Romário' },
  { num: '00s', lab: 'Volta' },
  { num: '10s+', lab: 'Glória' },
] as const;

const GameModeSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackFunnelPageView: trackPageView, trackGameModeClick } = useAnalytics();

  useEffect(() => {
    trackPageView('game_selection');
  }, [trackPageView]);

  const { data: homeStats } = useQuery({
    queryKey: ['home-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_home_stats');
      if (error) throw error;
      return data as unknown as { player_count: number; jersey_count: number; today_players: number };
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: userBest } = useQuery({
    queryKey: ['user-best', user?.id],
    queryFn: async () => {
      const [adaptive, jersey] = await Promise.all([
        supabase.from('rankings').select('score').eq('user_id', user!.id).order('score', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('jersey_game_rankings').select('score').eq('user_id', user!.id).order('score', { ascending: false }).limit(1).maybeSingle(),
      ]);
      return {
        adaptive: adaptive.data?.score ?? null,
        jersey: jersey.data?.score ?? null,
        total: (adaptive.data?.score ?? 0) + (jersey.data?.score ?? 0) || null,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const playerCount = homeStats?.player_count ?? 188;
  const jerseyCount = homeStats?.jersey_count ?? 50;
  const todayPlayers = homeStats?.today_players ?? 0;

  const handleMode = useCallback((mode: string, path: string) => {
    trackGameModeClick(mode);
    navigate(path);
  }, [trackGameModeClick, navigate]);

  const { streak, bestStreak } = usePlayStreak();
  const initial = user?.user_metadata?.full_name?.[0]?.toUpperCase() ?? 'T';
  const userName = user?.user_metadata?.full_name || 'Tricolor';

  return (
    <>
      <SEOManager
        title="Escolha seu Modo de Jogo — Quiz Fluminense | Lendas do Flu"
        description="🎮 3 modos de quiz: Adaptativo, Por Década e Camisas Históricas. Teste seus conhecimentos sobre os ídolos do Fluminense!"
        schema="Game"
      />
      <RootLayout>
        <div data-testid="game-mode-page" className="min-h-screen page-warm bg-tricolor-vertical-border">
          <div className="max-w-[1180px] mx-auto px-7 pt-8 pb-16">

            {/* Back button */}
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 border border-border rounded-[8px] px-3.5 py-2 text-[12px] text-muted-foreground hover:text-primary hover:border-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao início
            </button>

            {/* Page heading */}
            <div className="text-center mb-9">
              <div className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.12em] uppercase text-accent mb-2.5">
                <span className="w-6 h-0.5 bg-accent inline-block" />
                {playerCount} ídolos · {jerseyCount} camisas · 3 modos
                <span className="w-6 h-0.5 bg-accent inline-block" />
              </div>
              <h1 className="font-display text-[48px] leading-none tracking-[0.03em] text-primary mb-2.5">
                ESCOLHA SEU MODO DE JOGO
              </h1>
              <p className="text-[15px] text-muted-foreground max-w-[520px] mx-auto leading-[1.6]">
                De Castilho a Cano — escolha como quer ser desafiado. Cada modo testa um tipo diferente de conhecimento tricolor.
              </p>
            </div>

            {/* Welcome strip */}
            <div className="max-w-[680px] mx-auto mb-7 bg-white border border-border rounded-[14px] px-5 py-3.5 flex items-center gap-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-[#AF1E35] flex items-center justify-center text-white font-display text-[20px] flex-shrink-0">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-foreground mb-0.5">
                  👋 Olá, <strong>{userName}</strong>!
                </div>
                <div className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  Sua pontuação será salva automaticamente no ranking
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {streak > 0 && (
                  <div className="text-center" title={`Melhor sequência: ${bestStreak} dias`}>
                    <div className="font-display text-[22px] text-accent leading-none">🔥 {streak}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-[0.1em] font-bold mt-0.5">Dias seguidos</div>
                  </div>
                )}
                {userBest?.total ? (
                  <div className="text-right">
                    <div className="font-display text-[24px] text-primary leading-none">{userBest.total.toLocaleString('pt-BR')}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-[0.1em] font-bold mt-0.5">Total geral</div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Mode cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px] mb-8">

              {/* ── Mode 1: Adivinhe o Jogador ── */}
              <button
                data-testid="game-mode-adaptive"
                onClick={() => handleMode('adaptive', '/quiz-adaptativo')}
                className="group bg-white border-[1.5px] border-border rounded-[18px] overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)] transition-all duration-200 flex flex-col text-left relative"
              >
                <div className="absolute top-0 left-0 right-0 h-[6px] bg-primary z-10" />
                <div className="aspect-video relative overflow-hidden flex items-center justify-center px-5 pt-5 pb-4 bg-gradient-to-b from-[rgba(122,2,19,0.04)] to-[rgba(122,2,19,0.08)]">
                  <img
                    src="/lovable-uploads/6b2888cd-7dd2-4048-b4ca-c9636e93d4a6.webp"
                    alt="Jogador misterioso"
                    className="max-h-full max-w-[60%] object-contain"
                    style={{ filter: 'blur(5px) grayscale(0.2)', opacity: 0.5 }}
                  />
                  <span className="absolute right-4 bottom-3 font-display text-[64px] leading-none text-primary/18 select-none">?</span>
                </div>
                <div className="px-5 pt-4 pb-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h2 className="font-display text-[22px] tracking-[0.03em] text-foreground flex-1 leading-[1.1]">ADIVINHE O JOGADOR</h2>
                    <span className="text-[9px] font-extrabold tracking-[0.08em] uppercase px-2 py-1 rounded-[5px] bg-primary/10 text-primary flex-shrink-0">Adaptável</span>
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-[1.55] mb-3.5 flex-1">
                    Veja a foto, digite o nome. A dificuldade aumenta a cada acerto — começa fácil, vira lenda.
                  </p>
                  <div className="flex gap-3 pt-3.5 border-t border-dashed border-border mb-3.5">
                    <div className="flex-1">
                      <div className="font-display text-[16px] text-primary leading-none">{playerCount}</div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-[0.06em] font-bold mt-0.5">Ídolos</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-[16px] text-primary leading-none">4 níveis</div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-[0.06em] font-bold mt-0.5">Dificuldade</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-[16px] text-primary leading-none">{userBest?.adaptive ? `${userBest.adaptive} pts` : '—'}</div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-[0.06em] font-bold mt-0.5">Seu recorde</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 rounded-[10px] bg-primary text-white font-display text-[15px] tracking-[0.05em] shadow-[0_4px_12px_rgba(122,2,19,0.25)] group-hover:translate-x-0.5 transition-transform">
                    <span>JOGAR AGORA</span>
                    <span>→</span>
                  </div>
                </div>
              </button>

              {/* ── Mode 2: Por Década ── */}
              <button
                data-testid="game-mode-decade"
                onClick={() => handleMode('decade', '/quiz-decada')}
                className="group bg-white border-[1.5px] border-border rounded-[18px] overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)] transition-all duration-200 flex flex-col text-left relative"
              >
                <div className="absolute top-0 left-0 right-0 h-[6px] bg-secondary z-10" />
                <div className="aspect-video relative overflow-hidden flex items-center justify-center px-5 pt-5 pb-4 bg-gradient-to-b from-[rgba(0,97,64,0.04)] to-[rgba(0,97,64,0.08)]">
                  <div className="grid grid-cols-3 gap-1.5 w-full max-w-[240px]">
                    {DECADES.map(({ num, lab, featured }) => (
                      <div
                        key={num}
                        className={cn(
                          'rounded-[8px] px-1 py-2 text-center shadow-sm',
                          featured
                            ? 'bg-secondary border border-secondary'
                            : 'bg-white border border-secondary/20'
                        )}
                      >
                        <div className={cn('font-display text-[18px] leading-none', featured ? 'text-white' : 'text-secondary')}>{num}</div>
                        <div className={cn('text-[8px] uppercase tracking-[0.06em] font-bold mt-0.5', featured ? 'text-white/80' : 'text-muted-foreground')}>{lab}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-5 pt-4 pb-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h2 className="font-display text-[22px] tracking-[0.03em] text-foreground flex-1 leading-[1.1]">POR DÉCADA</h2>
                    <span className="text-[9px] font-extrabold tracking-[0.08em] uppercase px-2 py-1 rounded-[5px] bg-secondary/10 text-secondary flex-shrink-0">6 Eras</span>
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-[1.55] mb-3.5 flex-1">
                    Escolha uma era do Flu e teste seus conhecimentos sobre os ídolos daquela época específica.
                  </p>
                  <div className="flex gap-3 pt-3.5 border-t border-dashed border-border mb-3.5">
                    <div className="flex-1">
                      <div className="font-display text-[16px] text-secondary leading-none">6</div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-[0.06em] font-bold mt-0.5">Décadas</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-[16px] text-secondary leading-none">~30</div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-[0.06em] font-bold mt-0.5">Por era</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-[16px] text-secondary leading-none">—</div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-[0.06em] font-bold mt-0.5">Sua melhor</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 rounded-[10px] bg-secondary text-white font-display text-[15px] tracking-[0.05em] shadow-[0_4px_12px_rgba(0,97,64,0.25)] group-hover:translate-x-0.5 transition-transform">
                    <span>ESCOLHER ERA</span>
                    <span>→</span>
                  </div>
                </div>
              </button>

              {/* ── Mode 3: Quiz das Camisas ── */}
              <button
                data-testid="game-mode-jersey"
                onClick={() => handleMode('jersey', '/quiz-camisas')}
                className="group bg-white border-[1.5px] border-accent/40 rounded-[18px] overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)] transition-all duration-200 flex flex-col text-left relative shadow-[0_8px_24px_rgba(196,148,74,0.08)]"
              >
                <div className="absolute top-0 left-0 right-0 h-[6px] bg-accent z-10" />
                {/* NOVO! ribbon */}
                <div className="absolute top-[18px] right-0 bg-accent text-white text-[10px] font-extrabold tracking-[0.08em] px-2.5 py-1 rounded-l-[5px] z-20 shadow-[-2px_4px_8px_rgba(196,148,74,0.3)]">
                  NOVO!
                </div>
                <div className="aspect-video relative overflow-hidden flex flex-col items-center justify-center px-5 pt-5 pb-4 bg-gradient-to-b from-[rgba(196,148,74,0.05)] to-[rgba(196,148,74,0.1)]">
                  <div className="text-[64px] leading-none mb-2">👕</div>
                  <div className="flex gap-1.5">
                    {(['2013', '2016', '2015'] as const).map((y, i) => (
                      <span
                        key={y}
                        className={cn(
                          'rounded-[6px] px-2 py-0.5 font-display text-[11px] tracking-[0.03em]',
                          i === 1
                            ? 'bg-accent text-white border border-accent'
                            : 'bg-white border border-accent/30 text-accent'
                        )}
                      >
                        {y}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="px-5 pt-4 pb-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h2 className="font-display text-[22px] tracking-[0.03em] text-foreground flex-1 leading-[1.1]">QUIZ DAS CAMISAS</h2>
                    <span className="text-[9px] font-extrabold tracking-[0.08em] uppercase px-2 py-1 rounded-[5px] bg-accent/15 text-[#A07628] flex-shrink-0">Histórico</span>
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-[1.55] mb-3.5 flex-1">
                    Veja a camisa histórica e descubra de qual era é — cada opção vem com contexto da época do clube.
                  </p>
                  <div className="flex gap-3 pt-3.5 border-t border-dashed border-border mb-3.5">
                    <div className="flex-1">
                      <div className="font-display text-[16px] text-accent leading-none">{jerseyCount}+</div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-[0.06em] font-bold mt-0.5">Camisas</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-[16px] text-accent leading-none">3 opções</div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-[0.06em] font-bold mt-0.5">Por rodada</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-[16px] text-accent leading-none">{userBest?.jersey ? `${userBest.jersey} pts` : '—'}</div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-[0.06em] font-bold mt-0.5">Seu recorde</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 rounded-[10px] bg-accent text-white font-display text-[15px] tracking-[0.05em] shadow-[0_4px_12px_rgba(196,148,74,0.3)] group-hover:translate-x-0.5 transition-transform">
                    <span>JOGAR AGORA</span>
                    <span>→</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Daily Challenges */}
            <div className="max-w-[680px] mx-auto mb-6">
              <DailyChallengeWidget compact maxChallenges={2} />
            </div>

            {/* Live activity bar */}
            <div className="max-w-[680px] mx-auto bg-white border border-border rounded-[14px] px-5 py-4 flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <div className="w-11 h-11 rounded-[12px] bg-[rgba(34,197,94,0.1)] flex items-center justify-center text-[20px] flex-shrink-0">
                🔥
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-foreground mb-0.5 flex items-center gap-1.5">
                  <span className="w-[7px] h-[7px] rounded-full bg-[#22C55E] shadow-[0_0_0_3px_rgba(34,197,94,0.25)] animate-pulse flex-shrink-0" />
                  <strong>{todayPlayers || 42} tricolores</strong> jogaram hoje
                </div>
                <div className="text-[12px] text-muted-foreground">
                  Mais popular agora:{' '}
                  <strong className="text-primary">Adivinhe o Jogador</strong>
                  {' · '}seguido por{' '}
                  <strong className="text-accent">Quiz das Camisas</strong>
                </div>
              </div>
              <button
                onClick={() => navigate('/estatisticas')}
                className="text-[12px] text-secondary font-semibold hover:text-secondary/80 transition-colors whitespace-nowrap flex-shrink-0"
              >
                Ver Ranking ao Vivo →
              </button>
            </div>

          </div>
        </div>
      </RootLayout>
    </>
  );
};

export default GameModeSelection;
