
import React, { Suspense, useEffect } from "react";
import { RootLayout } from "@/components/RootLayout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LazyPlayerRanking } from "@/components/LazyComponents";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { Instagram, Timer, Brain, Trophy, Target, Users, Star, TrendingUp } from "lucide-react";
import { FluCard, FluCardContent, FluCardHeader, FluCardTitle } from "@/components/ui/flu-card";
import { ScoreDisplay } from "@/components/ui/score-display";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useEnhancedAnalytics } from "@/hooks/use-enhanced-analytics";
import { useMobileOptimization } from "@/hooks/use-mobile-optimization";
import { DynamicSEO } from "@/components/seo/DynamicSEO";
import { ResourceOptimizer } from "@/components/performance/ResourceOptimizer";
import { useResourceHints } from "@/hooks/use-resource-hints";
import { usePerformanceMonitor } from "@/hooks/use-performance-monitor";
import { LiveStatsWidget } from "@/components/realtime/LiveStatsWidget";
import { LiveEventBanner } from "@/components/realtime/LiveEventBanner";
import { useRealtimePresence } from "@/hooks/use-realtime-presence";
import { QuickActions } from "@/components/ux/QuickActions";
import { GameInsights } from "@/components/ux/GameInsights";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { SocialShareModal } from "@/components/social/SocialShareModal";
import { useAuth } from "@/hooks/useAuth";
import { PlayerRanking } from "@/components/PlayerRanking";


const Index = () => {
  const navigate = useNavigate();
  const analytics = useEnhancedAnalytics();
  const { viewportInfo, getTouchTargetSize } = useMobileOptimization();
  const { user } = useAuth();
  
  // Performance hooks
  useResourceHints();
  usePerformanceMonitor();
  
  // Real-time presence tracking
  useRealtimePresence();
  
  useEffect(() => {
    analytics.trackPageView('/');
    analytics.trackUserEngagement('homepage_view');
  }, [analytics]);

  // Usar hook otimizado para estatísticas
  const { data: gameStats } = useQuery({
    queryKey: ['game-stats-optimized'],
    queryFn: async () => {
      const [sessionsResponse, attemptsResponse, playersResponse] = await Promise.all([
        supabase.from('game_sessions').select('id', { count: 'exact', head: true }),
        supabase.from('game_attempts').select('id', { count: 'exact', head: true }),
        supabase.from('players').select('id', { count: 'exact', head: true })
      ]);
      
      return {
        totalGames: sessionsResponse.count || 0,
        totalAttempts: attemptsResponse.count || 0,
        totalPlayers: playersResponse.count || 0
      };
    },
    staleTime: 10 * 60 * 1000, // Cache otimizado por 10 minutos
    gcTime: 30 * 60 * 1000, // Manter em cache por 30 minutos
    refetchOnWindowFocus: false,
    retry: 1
  });

  return (
    <>
      <DynamicSEO 
        customTitle="Lendas do Flu | Quiz Interativo dos Jogadores do Fluminense"
        customDescription="🏆 Teste seus conhecimentos sobre os grandes ídolos e lendas do Fluminense! Quiz adaptativo com diferentes níveis de dificuldade."
      />
      <ResourceOptimizer />
      <RootLayout>
        <TopNavigation />
        <div className="min-h-screen bg-gradient-to-br from-flu-verde/10 via-white to-flu-grena/10 pt-16">
          
          {/* Live Event Banner */}
          <LiveEventBanner />
          
          {/* Hero Section */}
          <section className="container mx-auto px-4 pt-8 pb-12">
            <div className="text-center mb-16 animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold text-flu-grena mb-6 leading-tight">
                Lendas do Flu
              </h1>
              <p className="text-2xl md:text-3xl text-gray-700 mb-4 font-medium">
                O Quiz Definitivo do Fluminense
              </p>
              <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Teste seus conhecimentos sobre os grandes ídolos tricolores! 
                 Desde lendas históricas até estrelas atuais - descubra o quanto você realmente conhece sobre o Flu.
               </p>
               
              
              {/* CTA Principal */}
              <div className="mb-16">
                <Button
                  onClick={() => {
                    analytics.trackUserEngagement('cta_click', 'main_hero');
                    navigate('/selecionar-modo-jogo');
                  }}
                  className={`bg-flu-grena hover:bg-flu-grena/90 text-white text-xl px-12 py-6 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 hover-scale ${getTouchTargetSize('large')}`}
                >
                  🚀 Começar a Jogar Agora
                </Button>
                 <p className="text-sm text-gray-500 mt-4">
                   Gratuito • Sem cadastro necessário • {gameStats ? `${gameStats.totalPlayers}+` : 'Muitos'} jogadores
                 </p>
               </div>

               {/* Hall da Fama */}
               <div className="mb-16">
                 <div className="text-center mb-8">
                   <h2 className="text-3xl font-bold text-flu-grena mb-4">
                     🏆 Hall da Fama Tricolor
                   </h2>
                   <p className="text-lg text-gray-600">
                     Os maiores conhecedores do Fluminense
                   </p>
                 </div>
                 <PlayerRanking />
               </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
                 <FluCard variant="tricolor" hover="glow" size="sm">
                   <FluCardContent className="text-center py-6">
                     <ScoreDisplay 
                       score={gameStats?.totalPlayers || 0} 
                       variant="tricolor" 
                       size="lg"
                       suffix={gameStats?.totalPlayers ? "+" : ""}
                     />
                     <div className="text-sm text-muted-foreground mt-2">Jogadores</div>
                   </FluCardContent>
                 </FluCard>
                
                <FluCard variant="verde" hover="lift" size="sm">
                  <FluCardContent className="text-center py-6">
                    <ScoreDisplay score={5} variant="verde" size="lg" />
                    <div className="text-sm text-muted-foreground mt-2">Décadas</div>
                  </FluCardContent>
                </FluCard>
                
                 <FluCard variant="grena" hover="scale" size="sm">
                   <FluCardContent className="text-center py-6">
                     <ScoreDisplay 
                       score={gameStats?.totalGames || 0} 
                       variant="grena" 
                       size="lg"
                       suffix=""
                     />
                     <div className="text-sm text-muted-foreground mt-2">Jogos</div>
                   </FluCardContent>
                 </FluCard>
                
                 <FluCard variant="elegant" hover="glow" size="sm">
                   <FluCardContent className="text-center py-6">
                     <ScoreDisplay 
                       score={gameStats?.totalAttempts || 0} 
                       variant="success" 
                       size="lg"
                       suffix=""
                     />
                     <div className="text-sm text-muted-foreground mt-2">Tentativas</div>
                   </FluCardContent>
                 </FluCard>
              </div>
            </div>
          </section>

          {/* UX Enhancements Section - Only for logged in users */}
          {user && (
            <section className="bg-white/50 py-12">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                  <QuickActions />
                  <GameInsights />
                </div>
              </div>
            </section>
          )}

          {/* Ranking Section - Hall da Fama - Only for logged in users */}
          {user && (
            <section id="ranking-section" className="bg-gradient-to-r from-primary/5 to-secondary/5 py-20">
              <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-flu-grena mb-6">
                  🏆 Hall da Fama Tricolor
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Os maiores conhecedores das lendas do Flu. Será que você consegue chegar ao topo?
                </p>
              </div>
              
              <div className="max-w-3xl mx-auto">
                <Suspense fallback={
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8" style={{ minHeight: '400px' }}>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-8">
                        <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </div>
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                }>
                  <LazyPlayerRanking />
                </Suspense>
              </div>
            </div>
          </section>
          )}

          {/* What's Happening Now Section */}
          <section className="bg-white/50 py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-flu-grena mb-4">
                  🔥 O que está acontecendo agora
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Estatísticas em tempo real da comunidade tricolor
                </p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <LiveStatsWidget />
              </div>
            </div>
          </section>

          {/* Como Funciona */}
          <section className="bg-white/50 py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-flu-grena mb-6">
                  Como Funciona o Quiz?
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  É simples: veja a foto de um jogador e adivinhe quem é!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="text-center group">
                  <div className="bg-flu-verde/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-flu-verde/20 transition-colors">
                    <Target className="w-10 h-10 text-flu-verde" />
                  </div>
                  <h3 className="text-xl font-bold text-flu-grena mb-4">1. Veja a Foto</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Uma foto de um jogador do Fluminense aparece na tela. Pode ser atual ou histórico!
                  </p>
                </div>

                <div className="text-center group">
                  <div className="bg-flu-grena/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-flu-grena/20 transition-colors">
                    <Brain className="w-10 h-10 text-flu-grena" />
                  </div>
                  <h3 className="text-xl font-bold text-flu-grena mb-4">2. Digite o Nome</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Digite o nome do jogador. Pode usar apelidos ou nome completo - nosso sistema é inteligente!
                  </p>
                </div>

                <div className="text-center group">
                  <div className="bg-flu-verde/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-flu-verde/20 transition-colors">
                    <Trophy className="w-10 h-10 text-flu-verde" />
                  </div>
                  <h3 className="text-xl font-bold text-flu-grena mb-4">3. Ganhe Pontos</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Acertou? Ganhe pontos e continue! O jogo fica mais difícil conforme você evolui.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Modos de Jogo */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-flu-grena mb-6">
                  Escolha Seu Desafio
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Dois modos únicos para testar seu conhecimento tricolor
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Quiz Adaptativo */}
                <FluCard variant="verde" hover="glow" size="lg">
                  <FluCardHeader>
                    <div className="flex items-center">
                      <div className="bg-flu-verde/20 p-4 rounded-xl mr-4">
                        <TrendingUp className="w-8 h-8 text-flu-verde" />
                      </div>
                      <div>
                        <FluCardTitle className="text-flu-verde">Quiz Adaptativo</FluCardTitle>
                        <p className="text-flu-verde-light font-medium">Recomendado para iniciantes</p>
                      </div>
                    </div>
                  </FluCardHeader>
                  
                  <FluCardContent>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      Sistema inteligente que ajusta a dificuldade baseado no seu desempenho. 
                      Comece fácil e evolua até os jogadores mais desafiadores!
                    </p>
                    
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 text-flu-verde mr-2" />
                        Dificuldade automática baseada no seu nível
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Timer className="w-4 h-4 text-flu-verde mr-2" />
                        60 segundos para cada resposta
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Trophy className="w-4 h-4 text-flu-verde mr-2" />
                        Pontuação inteligente com multiplicadores
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        analytics.trackUserEngagement('game_mode_selection', 'adaptive');
                        navigate('/quiz-adaptativo');
                      }}
                      className={`w-full bg-flu-verde hover:bg-flu-verde/90 text-white font-semibold py-3 ${getTouchTargetSize()}`}
                    >
                      Jogar Adaptativo
                    </Button>
                  </FluCardContent>
                </FluCard>

                {/* Quiz por Década */}
                <FluCard variant="grena" hover="scale" size="lg" className="relative">
                  <div className="absolute top-4 right-4">
                    <span className="bg-flu-grena text-white text-xs px-3 py-1 rounded-full font-medium">NOVO</span>
                  </div>
                  
                  <FluCardHeader>
                    <div className="flex items-center">
                      <div className="bg-flu-grena/20 p-4 rounded-xl mr-4">
                        <Timer className="w-8 h-8 text-flu-grena" />
                      </div>
                      <div>
                        <FluCardTitle className="text-flu-grena">Quiz por Década</FluCardTitle>
                        <p className="text-flu-grena-light font-medium">Para conhecedores da história</p>
                      </div>
                    </div>
                  </FluCardHeader>
                  
                  <FluCardContent>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      Escolha uma época específica e teste seus conhecimentos sobre os jogadores 
                      daquela geração. Dos anos 70 até os dias atuais!
                    </p>
                    
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 text-flu-grena mr-2" />
                        Escolha entre 6 décadas diferentes
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Timer className="w-4 h-4 text-flu-grena mr-2" />
                        60 segundos por resposta
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 text-flu-grena mr-2" />
                        Focado em lendas de cada época
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        analytics.trackUserEngagement('game_mode_selection', 'decade');
                        navigate('/quiz-decada');
                      }}
                      className={`w-full bg-flu-grena hover:bg-flu-grena/90 text-white font-semibold py-3 ${getTouchTargetSize()}`}
                    >
                      Jogar por Década
                    </Button>
                  </FluCardContent>
                </FluCard>
              </div>
            </div>
          </section>


          {/* Instagram Section */}
          <section className="py-20">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-4xl font-bold text-flu-grena mb-8">
                🤝 Conecte-se Conosco
              </h2>
              
              <div className="max-w-lg mx-auto">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-xl hover-scale">
                  <div className="flex items-center justify-center mb-6">
                    <Instagram className="w-10 h-10 mr-4" />
                    <span className="text-2xl font-bold">@jogolendasdoflu</span>
                  </div>
                  <p className="text-lg mb-6 opacity-90 leading-relaxed">
                    Siga-nos no Instagram para novidades, dicas exclusivas e muito mais conteúdo tricolor!
                  </p>
                  <a
                    href="https://www.instagram.com/jogolendasdoflu"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => analytics.trackUserEngagement('social_follow', 'instagram')}
                    className={`inline-flex items-center gap-3 bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 ${getTouchTargetSize()}`}
                  >
                    <Instagram className="w-6 h-6" />
                    Seguir no Instagram
                  </a>
                </div>
              </div>
            </div>
          </section>

        </div>
      </RootLayout>
    </>
  );
};

export default Index;
