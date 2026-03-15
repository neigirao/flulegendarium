import React, { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Instagram, User, LogIn, BarChart3, ChevronRight } from "lucide-react";
import { DynamicSEO } from "@/components/seo/DynamicSEO";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useFunnelAnalytics } from "@/hooks/use-funnel-analytics";
import { GameTypeRankings } from "@/components/home/GameTypeRankings";
import { GameModesPreview } from "@/components/home/GameModesPreview";
import { useLinkPrefetch, useRoutePrefetch } from "@/hooks/use-route-prefetch";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackPageView, trackAuthPromptShown } = useFunnelAnalytics();
  const { onMouseEnter } = useLinkPrefetch();
  
  useRoutePrefetch();

  useEffect(() => {
    trackPageView('home');
  }, [trackPageView]);

  // Dynamic counts
  const { data: playerCount } = useQuery({
    queryKey: ['player-count'],
    queryFn: async () => {
      const { count } = await supabase.from('players').select('*', { count: 'exact', head: true });
      return count || 0;
    },
    staleTime: 30 * 60 * 1000,
  });

  const { data: jerseyCount } = useQuery({
    queryKey: ['jersey-count'],
    queryFn: async () => {
      const { count } = await supabase.from('jerseys').select('*', { count: 'exact', head: true });
      return count || 0;
    },
    staleTime: 30 * 60 * 1000,
  });

  // Today's players count
  const { data: todayPlayers } = useQuery({
    queryKey: ['today-players'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from('game_starts')
        .select('*', { count: 'exact', head: true })
        .gte('started_at', today.toISOString());
      return count || 0;
    },
    staleTime: 5 * 60 * 1000,
  });

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
      <DynamicSEO 
        customTitle="Lendas do Flu | Quiz de Jogadores e Camisas Históricas do Fluminense"
        customDescription="🏆 3 modos de quiz: Jogadores, Por Década e Camisas Históricas! Teste seus conhecimentos sobre os ídolos e uniformes tricolores."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-secondary via-neutral-700 to-primary bg-tricolor-vertical-border">
        <TopNavigation />
        
        <div className="pt-24 min-h-screen safe-area-top">
          {/* Hero Section */}
          <section className="container mx-auto px-4 pt-16 pb-8 text-center">
            <h1 className="text-display-hero text-primary-foreground mb-6 drop-shadow-lg">
              LENDAS DO FLU
            </h1>
            <p className="text-display-subtitle text-primary-foreground/90 mb-4 font-display">
              De Castilho a Cano — Você Conhece Todas as Lendas?
            </p>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto font-body">
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
                <Card className="bg-card/10 backdrop-blur-sm border-border/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-warning" />
                        <div className="text-left">
                          <p className="text-primary-foreground font-semibold text-sm">Quer salvar seu progresso?</p>
                          <p className="text-primary-foreground/70 text-xs">Conquistas • Ranking • Histórico</p>
                        </div>
                      </div>
                      <Button
                        onClick={handleLoginClick}
                        size="sm"
                        variant="secondary"
                        className="bg-card/20 hover:bg-card/30 text-primary-foreground border-0"
                      >
                        <LogIn className="w-4 h-4 mr-1" />
                        Entrar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-primary-foreground/80 text-sm mb-8">
                👋 Olá, <span className="font-semibold">{user.user_metadata?.full_name || 'Tricolor'}</span>! 
                Bom te ver por aqui.
              </p>
            )}

            <p className="text-primary-foreground/70 text-sm mb-4">
              Gratuito • Jogue sem cadastro • {playerCount || '188'}+ jogadores • {jerseyCount || '50'}+ camisas históricas
            </p>

            {/* Live counter */}
            {todayPlayers !== undefined && todayPlayers > 0 && (
              <p className="text-primary-foreground/60 text-xs mb-12">
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
                  <Card className="bg-card/10 backdrop-blur-sm border-border/20 hover:bg-card/20 transition-all duration-300 hover:scale-[1.02]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-6 h-6 text-primary-foreground/80" />
                        <div className="text-left">
                          <p className="text-primary-foreground font-display text-sm">O Flu em Números</p>
                          <p className="text-primary-foreground/60 text-xs">Rankings, curiosidades e estatísticas da comunidade</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-primary-foreground/60 group-hover:translate-x-1 transition-transform" />
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
                <h2 className="text-display-title text-primary-foreground mb-4">Como funciona o Quiz?</h2>
                <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto font-body">
                  É simples e divertido! Teste seus conhecimentos sobre os ídolos tricolores
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-8">
                <div className="text-center group">
                  <div className="bg-card/10 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-card/20 transition-all duration-300 border border-border/20">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold text-lg">
                      1
                    </div>
                  </div>
                  <h3 className="text-display-sm text-primary-foreground mb-4">Veja a Foto</h3>
                  <p className="text-primary-foreground/80 leading-relaxed font-body">
                    Uma foto de um ídolo do Fluminense aparece na tela — de Castilho a Cano, passando por todas as eras!
                  </p>
                </div>

                <div className="text-center group">
                  <div className="bg-card/10 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-card/20 transition-all duration-300 border border-border/20">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                      2
                    </div>
                  </div>
                  <h3 className="text-display-sm text-primary-foreground mb-4">Digite o Nome</h3>
                  <p className="text-primary-foreground/80 leading-relaxed font-body">
                    Digite o nome do jogador. Pode usar apelidos ou nome completo — nosso sistema é inteligente!
                  </p>
                </div>

                <div className="text-center group">
                  <div className="bg-card/10 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-card/20 transition-all duration-300 border border-border/20">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold text-lg">
                      3
                    </div>
                  </div>
                  <h3 className="text-display-sm text-primary-foreground mb-4">Ganhe Pontos</h3>
                  <p className="text-primary-foreground/80 leading-relaxed font-body">
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
              <div className="flex items-center justify-center text-primary-foreground">
                <Instagram className="w-6 h-6 mr-2" />
                <a
                  href="https://www.instagram.com/lendasdoflu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-bold hover:text-primary-foreground/80 transition-colors"
                >
                  @lendasdoflu
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Index;
