import React, { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Instagram, User, LogIn, BarChart3, ChevronRight } from "lucide-react";
import { SEOManager } from "@/components/seo/SEOManager";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useAnalytics } from "@/hooks/analytics";
import { GameTypeRankings } from "@/components/home/GameTypeRankings";
import { GameModesPreview } from "@/components/home/GameModesPreview";
import { useLinkPrefetch, useRoutePrefetch } from "@/hooks/use-route-prefetch";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackFunnelPageView: trackPageView, trackAuthPromptShown } = useAnalytics();
  const { onMouseEnter } = useLinkPrefetch();

  useRoutePrefetch();

  useEffect(() => {
    trackPageView('home');
  }, [trackPageView]);

  // Unified home stats RPC
  const { data: homeStats } = useQuery({
    queryKey: ['home-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_home_stats');
      if (error) {
        logger.maintenance('home-stats-rpc-failed', { error: error.message });
        throw error;
      }

      const result = data as unknown as { player_count: number; jersey_count: number; today_players: number };

      logger.maintenance('home-stats-rpc-success', {
        playerCount: result?.player_count,
        jerseyCount: result?.jersey_count,
        todayPlayers: result?.today_players,
      });

      return result;
    },
    staleTime: 5 * 60 * 1000,
  });

  const playerCount = homeStats?.player_count;
  const jerseyCount = homeStats?.jersey_count;
  const todayPlayers = homeStats?.today_players;

  const handlePrefetchGameMode = useCallback(() => {
    onMouseEnter('/selecionar-modo-jogo');
  }, [onMouseEnter]);

  const handleStartGame = () => {
    navigate('/selecionar-modo-jogo');
  };

  const handleLoginClick = () => {
    trackAuthPromptShown('home_banner');
    navigate('/auth');
  };

  return (
    <>
      <SEOManager 
        title="Lendas do Flu | Quiz de Jogadores e Camisas Históricas do Fluminense"
        description="🏆 3 modos de quiz: Jogadores, Por Década e Camisas Históricas! Teste seus conhecimentos sobre os ídolos e uniformes tricolores."
        schema="WebSite"
      />
      
      <div className="min-h-screen page-warm bg-tricolor-vertical-border">
        <TopNavigation />
        
        <div className="pt-24 min-h-screen safe-area-top" style={{ containIntrinsicSize: '0 800px', contentVisibility: 'visible' }}>
          {/* Hero Section */}
          <section className="container mx-auto px-4 pt-16 pb-8 text-center">
            <h1 className="text-display-hero text-primary mb-6 drop-shadow-sm">
              LENDAS DO FLU
            </h1>
            <p className="text-display-subtitle text-foreground/90 mb-4 font-display">
              De Castilho a Cano — Você Conhece Todas as Lendas?
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto font-body">
              Das Laranjeiras ao Maracanã: 3 modos de quiz para provar que você é um verdadeiro tricolor.
            </p>

            {/* Main CTA Button */}
            <div className="mb-8">
              <Button
                onClick={handleStartGame}
                onMouseEnter={handlePrefetchGameMode}
                onTouchStart={handlePrefetchGameMode}
                size="lg"
                className="text-xl px-12 py-6 shadow-xl hover:shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground touch-target-xl font-display tracking-wide hover:scale-105 transition-transform"
                data-testid="play-button"
              >
                <Rocket className="w-6 h-6 mr-2" />
                COMEÇAR A JOGAR AGORA
              </Button>
            </div>

            {/* Login Prompt */}
            {!user ? (
              <div className="mb-8 max-w-md mx-auto">
                <Card className="bg-card border border-gold/30 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-warning" />
                        <div className="text-left">
                          <p className="text-foreground font-semibold text-sm">Quer salvar seu progresso?</p>
                          <p className="text-muted-foreground text-xs">Conquistas • Ranking • Histórico</p>
                        </div>
                      </div>
                      <Button
                        onClick={handleLoginClick}
                        size="sm"
                        variant="secondary"
                        className="text-secondary-foreground"
                      >
                        <LogIn className="w-4 h-4 mr-1" />
                        Entrar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm mb-8">
                👋 Olá, <span className="font-semibold text-foreground">{user.user_metadata?.full_name || 'Tricolor'}</span>! 
                Bom te ver por aqui.
              </p>
            )}

            <p className="text-muted-foreground text-sm mb-4" aria-live="polite">
              Gratuito • Jogue sem cadastro • {playerCount || '188'}+ jogadores • {jerseyCount || '50'}+ camisas históricas
            </p>

            {/* Live counter */}
            {todayPlayers !== undefined && todayPlayers > 0 && (
              <p className="text-muted-foreground/70 text-xs mb-12">
                🔴 {todayPlayers} {todayPlayers === 1 ? 'tricolor jogou' : 'tricolores jogaram'} hoje
              </p>
            )}
            {(todayPlayers === undefined || todayPlayers === 0) && <div className="mb-12" />}

            {/* Game Modes Preview */}
            <section style={{ contentVisibility: 'auto', containIntrinsicSize: '0 600px' }}>
              <GameModesPreview />
            </section>

            {/* Stats Banner */}
            <section style={{ contentVisibility: 'auto', containIntrinsicSize: '0 100px' }}>
              <div className="max-w-2xl mx-auto mb-12">
                <Link to="/estatisticas" className="group">
                  <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-6 h-6 text-primary" />
                        <div className="text-left">
                          <p className="text-foreground font-display text-sm">O Flu em Números</p>
                          <p className="text-muted-foreground text-xs">Rankings, curiosidades e estatísticas da comunidade</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </section>

            {/* Hall da Fama */}
            <section style={{ contentVisibility: 'auto', containIntrinsicSize: '0 800px' }}>
              <GameTypeRankings />
            </section>

            {/* Como Funciona */}
            <section style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
              <div className="text-center mb-12">
                <h2 className="text-display-title text-primary mb-4">Como funciona o Quiz?</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-body">
                  É simples e divertido! Teste seus conhecimentos sobre os ídolos tricolores
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-8">
                <div className="text-center group">
                  <div className="bg-card shadow-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-md transition-all duration-300 border border-border">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold text-lg">
                      1
                    </div>
                  </div>
                  <h3 className="text-display-sm text-primary mb-4">Veja a Foto</h3>
                  <p className="text-muted-foreground leading-relaxed font-body">
                    Uma foto de um ídolo do Fluminense aparece na tela — de Castilho a Cano, passando por todas as eras!
                  </p>
                </div>

                <div className="text-center group">
                  <div className="bg-card shadow-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-md transition-all duration-300 border border-border">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                      2
                    </div>
                  </div>
                  <h3 className="text-display-sm text-primary mb-4">Digite o Nome</h3>
                  <p className="text-muted-foreground leading-relaxed font-body">
                    Digite o nome do jogador. Pode usar apelidos ou nome completo — nosso sistema é inteligente!
                  </p>
                </div>

                <div className="text-center group">
                  <div className="bg-card shadow-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-md transition-all duration-300 border border-border">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold text-lg">
                      3
                    </div>
                  </div>
                  <h3 className="text-display-sm text-primary mb-4">Ganhe Pontos</h3>
                  <p className="text-muted-foreground leading-relaxed font-body">
                    Acertou? Ganhe pontos e continue! O jogo fica mais difícil conforme você evolui.
                  </p>
                </div>
              </div>

              {/* CTA after Como Funciona */}
              <div className="text-center mb-12">
                <Button
                  onClick={handleStartGame}
                  onMouseEnter={handlePrefetchGameMode}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wide hover:scale-105 transition-transform"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  QUERO JOGAR!
                </Button>
              </div>
            </section>

            {/* Instagram Section */}
            <div className="max-w-lg mx-auto">
              <div className="flex items-center justify-center text-primary">
                <Instagram className="w-6 h-6 mr-2" />
                <a
                  href="https://www.instagram.com/lendasdoflu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-bold hover:text-primary/80 transition-colors"
                >
                  @lendasdoflu
                </a>
              </div>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Index;
