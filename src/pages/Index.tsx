import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Rocket, Instagram, User, LogIn } from "lucide-react";
import { DynamicSEO } from "@/components/seo/DynamicSEO";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useFunnelAnalytics } from "@/hooks/use-funnel-analytics";
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackPageView, trackAuthPromptShown } = useFunnelAnalytics();

  // Track page view on mount
  useEffect(() => {
    trackPageView('home');
  }, [trackPageView]);
  
  const handleStartGame = () => {
    window.location.href = '/selecionar-modo-jogo';
  };

  const handleLoginClick = () => {
    trackAuthPromptShown('home_banner');
    navigate('/auth');
  };

  // Fetch top 10 rankings
  const { data: rankings, isLoading: rankingsLoading } = useQuery({
    queryKey: ['top-rankings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <>
      <DynamicSEO 
        customTitle="Lendas do Flu | Quiz Interativo dos Jogadores do Fluminense"
        customDescription="🏆 Teste seus conhecimentos sobre os grandes ídolos e lendas do Fluminense! Quiz adaptativo com diferentes níveis de dificuldade."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-secondary via-neutral-700 to-primary bg-tricolor-vertical-border">
        <TopNavigation />
        
        {/* Main Content */}
        <div className="pt-24 min-h-screen safe-area-top">
          {/* Hero Section */}
          <section className="container mx-auto px-4 pt-16 pb-8 text-center">
            <h1 className="text-display-hero text-primary-foreground mb-6 drop-shadow-lg">
              LENDAS DO FLU
            </h1>
            <p className="text-display-subtitle text-primary-foreground/90 mb-4 font-display">
              O Quiz Definitivo do Fluminense
            </p>
            <p className="text-lg text-primary-foreground/80 mb-12 max-w-2xl mx-auto font-body">
              Teste seus conhecimentos sobre os grandes ídolos tricolores! Desde lendas 
              históricas até estrelas atuais - quanto você realmente conhece Flu.
            </p>

            {/* Main CTA Button */}
            <div className="mb-8">
              <Button
                onClick={handleStartGame}
                size="lg"
                className="text-xl px-12 py-6 shadow-xl hover:shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground touch-target-xl font-display tracking-wide animate-pulse hover:animate-none"
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

            <p className="text-primary-foreground/70 text-sm mb-16">
              Gratuito • Jogue sem cadastro • 188+ jogadores
            </p>

            {/* Hall da Fama Section */}
            <div className="mb-16">
              <div className="flex items-center justify-center mb-8">
                <Trophy className="w-8 h-8 text-warning mr-3" />
                <h2 className="text-display-title text-primary-foreground">Hall da Fama Tricolor</h2>
              </div>
              <p className="text-primary-foreground/80 mb-8 font-body">Os maiores conhecedores do Fluminense</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {rankingsLoading ? (
                  // Skeleton loading state
                  Array.from({ length: 4 }, (_, index) => (
                    <ShimmerSkeleton key={index} variant="card" />
                  ))
                ) : rankings?.length ? (
                  rankings.map((ranking, index) => (
                    <Card key={ranking.id} className="bg-card/10 backdrop-blur-sm border-border/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-primary-foreground text-sm ${
                              index === 0 ? 'bg-warning' : 
                              index === 1 ? 'bg-neutral-400' : 
                              index === 2 ? 'bg-warning/70' : 'bg-secondary'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="text-primary-foreground font-bold text-sm">{ranking.player_name}</h3>
                              <p className="text-primary-foreground/70 text-xs">{ranking.score} pontos</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary-foreground">{ranking.score}</div>
                            <div className="text-primary-foreground/70 text-xs">pontos</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-primary-foreground/70 col-span-2 text-center py-8">Nenhum ranking disponível</p>
                )}
              </div>
            </div>

            {/* Como Funciona */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-display-title text-primary-foreground mb-4">Como funciona o Quiz?</h2>
                <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto font-body">
                  É simples e divertido! Teste seus conhecimentos sobre os ídolos tricolores
                </p>
              </div>

              {/* Game Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
                <div className="text-center group">
                  <div className="bg-card/10 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-card/20 transition-all duration-300 border border-border/20">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold text-lg">
                      1
                    </div>
                  </div>
                  <h3 className="text-display-sm text-primary-foreground mb-4">Veja a Foto</h3>
                  <p className="text-primary-foreground/80 leading-relaxed font-body">
                    Uma foto de um jogador do Fluminense aparece na tela. Pode ser atual ou histórico!
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
                    Digite o nome do jogador. Pode usar apelidos ou nome completo - nosso sistema é inteligente!
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
            </div>

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