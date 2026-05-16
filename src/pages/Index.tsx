import React, { useEffect, useCallback } from "react";
import { Rocket, Instagram } from "lucide-react";
import { SEOManager } from "@/components/seo/SEOManager";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "@/hooks/analytics";
import { GameTypeRankings } from "@/components/home/GameTypeRankings";
import { GameModesPreview } from "@/components/home/GameModesPreview";
import { useLinkPrefetch, useRoutePrefetch } from "@/hooks/use-route-prefetch";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { cn } from "@/lib/utils";

const HOW_IT_WORKS = [
  { num: '1', color: 'bg-primary shadow-[0_6px_18px_rgba(122,2,19,0.3)]',  title: 'VEJA',      desc: 'Uma foto ou camisa de um ídolo do Fluminense aparece na sua tela.' },
  { num: '2', color: 'bg-secondary shadow-[0_6px_18px_rgba(0,97,64,0.3)]', title: 'RESPONDA',  desc: 'Digite o nome ou escolha a era correta. Use apelidos — o sistema é esperto.' },
  { num: '3', color: 'bg-[#C4944A] shadow-[0_6px_18px_rgba(196,148,74,0.3)]', title: 'PONTUE',    desc: 'Ganhe pontos, suba o nível e dispute o topo do ranking tricolor.' },
] as const;

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackFunnelPageView: trackPageView } = useAnalytics();
  const { onMouseEnter } = useLinkPrefetch();

  useRoutePrefetch();

  useEffect(() => {
    trackPageView('home');
  }, [trackPageView]);

  const { data: homeStats } = useQuery({
    queryKey: ['home-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_home_stats');
      if (error) {
        logger.maintenance('home-stats-rpc-failed', { error: error.message });
        throw error;
      }
      return data as unknown as { player_count: number; jersey_count: number; today_players: number };
    },
    staleTime: 5 * 60 * 1000,
  });

  const playerCount = homeStats?.player_count ?? 188;
  const jerseyCount = homeStats?.jersey_count ?? 50;
  const todayPlayers = homeStats?.today_players ?? 0;

  const handlePrefetchGameMode = useCallback(() => onMouseEnter('/selecionar-modo-jogo'), [onMouseEnter]);
  const handleStartGame = useCallback(() => navigate('/selecionar-modo-jogo'), [navigate]);
  const handleViewRanking = useCallback(() => navigate('/estatisticas'), [navigate]);

  return (
    <>
      <SEOManager
        title="Lendas do Flu | Quiz de Jogadores e Camisas Históricas do Fluminense"
        description="🏆 3 modos de quiz: Jogadores, Por Década e Camisas Históricas! Teste seus conhecimentos sobre os ídolos e uniformes tricolores."
        schema="WebSite"
      />

      <div className="min-h-screen page-warm bg-tricolor-vertical-border">
        <TopNavigation />

        <div className="pt-20 safe-area-top">

          {/* ── HERO ── */}
          <section className="max-w-[1240px] mx-auto px-7 pt-12 pb-7">
            <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-12 items-center">

              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.12em] uppercase text-accent mb-4">
                  <span className="w-6 h-0.5 bg-accent inline-block" />
                  Quiz · Fluminense FC · Desde 1902
                </div>

                <h1 className="font-display text-[clamp(48px,7vw,72px)] leading-[0.92] tracking-[0.02em] text-primary mb-4">
                  DE CASTILHO<br />A <span className="text-secondary">CANO</span>,<br />VOCÊ SABE?
                </h1>

                <p className="text-[17px] text-foreground/75 leading-[1.55] mb-7 max-w-[480px]">
                  Das Laranjeiras ao Maracanã — <strong className="text-foreground">3 modos de quiz</strong> para provar que você é um verdadeiro tricolor. Sem cadastro pra começar.
                </p>

                <div className="flex gap-3 items-center flex-wrap mb-6">
                  <button
                    onClick={handleStartGame}
                    onMouseEnter={handlePrefetchGameMode}
                    data-testid="play-button"
                    className="bg-primary text-white rounded-[12px] px-7 py-4 font-display text-[20px] tracking-[0.05em] shadow-[0_8px_24px_rgba(122,2,19,0.32)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(122,2,19,0.4)] transition-all duration-150 flex items-center gap-2.5"
                  >
                    <Rocket className="w-5 h-5" />
                    ADIVINHE AGORA
                  </button>
                  <button
                    onClick={handleViewRanking}
                    className="bg-transparent text-primary border-[1.5px] border-primary rounded-[12px] px-5 py-[15px] text-sm font-semibold hover:bg-primary hover:text-white transition-all duration-150"
                  >
                    Ver Ranking
                  </button>
                </div>

                <div className="inline-flex items-center gap-3.5 bg-white border border-border rounded-full px-4 py-2 shadow-[0_2px_10px_rgba(0,0,0,0.05)] text-[13px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_0_4px_rgba(34,197,94,0.2)] animate-pulse flex-shrink-0" />
                  <span><strong className="text-foreground">{todayPlayers || 42}</strong> tricolores jogaram hoje</span>
                  <span className="w-px h-3.5 bg-border flex-shrink-0" />
                  <span><strong className="text-foreground">{playerCount}</strong> ídolos no banco</span>
                </div>

                {user && (
                  <p className="text-muted-foreground text-sm mt-4">
                    👋 Olá, <span className="font-semibold text-foreground">{user.user_metadata?.full_name || 'Tricolor'}</span>!
                  </p>
                )}
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.12em] uppercase text-[#C4944A] bg-white border border-[#C4944A]/25 px-3.5 py-1.5 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C4944A] flex-shrink-0" />
                  Quem é esse ídolo?
                </div>

                <button
                  onClick={handleStartGame}
                  className="w-full max-w-[360px] aspect-[4/5] bg-white border border-border rounded-[24px] relative shadow-[0_16px_48px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-[0_22px_56px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer"
                  aria-label="Começar quiz — adivinhe o jogador"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[5px] z-10"
                    style={{ background: 'linear-gradient(90deg, #7A0213 33%, white 33% 66%, #006140 66%)' }}
                  />

                  <div className="absolute top-4 right-4 bg-white border border-border px-2.5 py-1 rounded-[7px] text-[9px] font-extrabold tracking-[0.1em] text-accent uppercase flex items-center gap-1 shadow-sm z-10">
                    ⚡ Fácil
                  </div>

                  <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-[#F7F5F2] to-[#ECE7DF] px-6 pt-6 overflow-hidden">
                    <img
                      src="/lovable-uploads/6b2888cd-7dd2-4048-b4ca-c9636e93d4a6.webp"
                      alt="Jogador misterioso"
                      className="max-w-[72%] max-h-[80%] object-contain"
                      style={{ filter: 'blur(6px) grayscale(0.3)', opacity: 0.45 }}
                      loading="eager"
                    />
                  </div>

                  <div className="px-4 py-3.5 flex justify-between items-center bg-white border-t border-border">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-[0.08em] font-bold">
                      Era: <strong className="text-accent">Anos 90</strong>
                    </div>
                    <div className="bg-primary text-white px-4 py-2 rounded-[8px] font-display text-[13px] tracking-[0.05em] shadow-[0_4px_12px_rgba(122,2,19,0.28)] flex items-center gap-1.5">
                      ▶ Adivinhar
                    </div>
                  </div>
                </button>

                <div className="grid grid-cols-3 gap-3 max-w-[340px] w-full">
                  {[
                    { val: playerCount, label: 'Ídolos',  color: 'text-primary' },
                    { val: jerseyCount, label: 'Camisas', color: 'text-secondary' },
                    { val: 6,           label: 'Décadas', color: 'text-[#C4944A]' },
                  ].map(({ val, label, color }) => (
                    <div key={label} className="bg-white border border-border rounded-[10px] px-2 py-2.5 text-center shadow-sm">
                      <div className={cn('font-display text-[22px] leading-none', color)}>{val}</div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-[0.08em] font-bold mt-1">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── GAME MODES ── */}
          <section className="max-w-[1240px] mx-auto px-7 pb-14" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 520px' }}>
            <GameModesPreview playerCount={playerCount} jerseyCount={jerseyCount} />
          </section>

          {/* ── HOW IT WORKS ── */}
          <section className="bg-white border-y border-border py-12" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 360px' }}>
            <div className="max-w-[1100px] mx-auto px-7">
              <div className="text-center mb-9">
                <h2 className="font-display text-[30px] text-primary tracking-[0.03em]">COMO FUNCIONA?</h2>
                <p className="text-[14px] text-muted-foreground mt-1.5">Em 3 passos você vira lenda</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-9">
                {HOW_IT_WORKS.map(({ num, color, title, desc }) => (
                  <div key={num} className="text-center">
                    <div className={cn('w-16 h-16 rounded-full text-white font-display text-[28px] flex items-center justify-center mx-auto mb-3.5', color)}>
                      {num}
                    </div>
                    <h3 className="font-display text-[22px] text-primary tracking-[0.03em] mb-1.5">{title}</h3>
                    <p className="text-[14px] text-muted-foreground leading-[1.55]">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── HALL DA FAMA ── */}
          <section className="max-w-[1240px] mx-auto px-7 py-14" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 700px' }}>
            <GameTypeRankings />
          </section>

          <div className="inline-flex items-center gap-2 text-primary w-full justify-center pb-10">
            <Instagram className="w-5 h-5" />
            <a
              href="https://www.instagram.com/lendasdoflu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-bold hover:text-primary/80 transition-colors"
            >
              @lendasdoflu
            </a>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Index;
