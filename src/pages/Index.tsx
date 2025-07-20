import React, { Suspense, useEffect } from "react";
import { RootLayout } from "@/components/RootLayout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Timer, Brain, Trophy, Target, Users, Star, TrendingUp } from "lucide-react";
import { FluCard, FluCardContent, FluCardHeader, FluCardTitle } from "@/components/ui/flu-card";
import { useEnhancedAnalytics } from "@/hooks/use-enhanced-analytics";
import { useMobileOptimization } from "@/hooks/use-mobile-optimization";
import { DynamicSEO } from "@/components/seo/DynamicSEO";
import { ResourceOptimizer } from "@/components/performance/ResourceOptimizer";
import { useResourceHints } from "@/hooks/use-resource-hints";
import { usePerformanceMonitor } from "@/hooks/use-performance-monitor";
import { LiveStatsWidget } from "@/components/realtime/LiveStatsWidget";
import { LiveEventBanner } from "@/components/realtime/LiveEventBanner";
import { useRealtimePresence } from "@/hooks/use-realtime-presence";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { useAuth } from "@/hooks/useAuth";

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
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
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
        <div className="min-h-screen bg-gradient-to-br from-flu-grena via-flu-grena/90 to-flu-verde relative overflow-hidden">
          
          {/* Navigation */}
          <nav className="relative z-10 flex justify-between items-center p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <div className="text-white">
                <div className="font-bold text-xl">LENDAS</div>
                <div className="font-bold text-xl">DO FLU</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/faq')}
                className="text-white hover:bg-white/20 p-2 rounded-full"
              >
                <span className="text-lg">?</span>
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 p-2 rounded-full"
              >
                <Timer className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 p-2 rounded-full"
              >
                <Users className="w-5 h-5" />
              </Button>
            </div>
          </nav>

          {/* Live Event Banner */}
          <LiveEventBanner />
          
          {/* Hero Section */}
          <section className="container mx-auto px-6 pt-12 pb-16 relative z-10">
            <div className="text-center mb-16 animate-fade-in">
              <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
                LENDAS DO FLU
              </h1>
              <p className="text-2xl md:text-3xl text-white/90 mb-4 font-medium">
                O Quiz Definitivo do Fluminense
              </p>
              <p className="text-lg text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
                Teste seus conhecimentos sobre os grandes ídolos tricolores! Desde lendas históricas
                até estrelas atuais - descubra o quanto você realmente conhece sobre o Flu.
              </p>
              
              {/* CTA Principal */}
              <div className="mb-8">
                <Button
                  onClick={() => {
                    analytics.trackUserEngagement('cta_click', 'main_hero');
                    navigate('/selecionar-modo-jogo');
                  }}
                  className={`bg-flu-verde hover:bg-flu-verde/90 text-white text-xl px-12 py-6 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 ${getTouchTargetSize('large')}`}
                >
                  🚀 COMEÇAR A JOGAR AGORA
                </Button>
                <p className="text-sm text-white/70 mt-4">
                  Gratuito • Sem cadastro necessário • {gameStats ? `${gameStats.totalPlayers}+` : '188+'} jogadores
                </p>
              </div>

              {/* Hall da Fama */}
              <div className="mb-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-flu-dourado mb-4 flex items-center justify-center">
                    <Trophy className="w-8 h-8 mr-3" />
                    Hall da Fama Tricolor
                  </h2>
                  <p className="text-lg text-white/80">
                    Os maiores conhecedores do Fluminense
                  </p>
                </div>
                
                {/* Decade Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-4xl mx-auto">
                  {['Geral', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'].map((decade, index) => (
                    <Button
                      key={decade}
                      variant={index === 0 ? "secondary" : "ghost"}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                        index === 0 
                          ? 'bg-white text-flu-grena' 
                          : 'text-white/70 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      {decade}
                    </Button>
                  ))}
                </div>
                
                {/* Ranking Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-flu-dourado rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xl">1</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Leonardo Marinho</h3>
                          <p className="text-gray-600">230 pontos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">290</div>
                        <div className="text-gray-600">pontos</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-flu-verde rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xl">2</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Leonardo Marinho</h3>
                          <p className="text-gray-600">295 pontos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">255</div>
                        <div className="text-gray-600">pontos</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* What's Happening Now Section */}
        <section className="bg-white py-16">
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
        <section className="bg-gradient-to-br from-flu-verde/5 to-flu-grena/5 py-20">
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
              <FluCard variant="tricolor" hover="glow" size="lg">
                <FluCardContent className="text-center p-8">
                  <div className="bg-flu-verde/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="w-10 h-10 text-flu-verde" />
                  </div>
                  <h3 className="text-xl font-bold text-flu-grena mb-4">1. Veja a Foto</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Uma foto de um jogador do Fluminense aparece na tela. Pode ser atual ou histórico!
                  </p>
                </FluCardContent>
              </FluCard>

              <FluCard variant="tricolor" hover="glow" size="lg">
                <FluCardContent className="text-center p-8">
                  <div className="bg-flu-grena/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-10 h-10 text-flu-grena" />
                  </div>
                  <h3 className="text-xl font-bold text-flu-grena mb-4">2. Digite o Nome</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Digite o nome do jogador. Pode usar apelidos ou nome completo - nosso sistema é inteligente!
                  </p>
                </FluCardContent>
              </FluCard>

              <FluCard variant="tricolor" hover="glow" size="lg">
                <FluCardContent className="text-center p-8">
                  <div className="bg-flu-verde/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-10 h-10 text-flu-verde" />
                  </div>
                  <h3 className="text-xl font-bold text-flu-grena mb-4">3. Ganhe Pontos</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Acertou? Ganhe pontos e continue! O jogo fica mais difícil conforme você evolui.
                  </p>
                </FluCardContent>
              </FluCard>
            </div>
          </div>
        </section>

        {/* Connect Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-flu-grena mb-6">
                Conecte-se conosco
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Acompanhe as novidades e entre para a comunidade tricolor
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <FluCard variant="tricolor" hover="scale" size="lg">
                <FluCardContent className="text-center p-8">
                  <div className="bg-gradient-to-br from-pink-500 to-orange-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Instagram className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-flu-grena mb-4">Instagram</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Siga nosso Instagram para ver os melhores momentos e novidades do quiz
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-flu-grena text-flu-grena hover:bg-flu-grena hover:text-white"
                    onClick={() => window.open('https://instagram.com', '_blank')}
                  >
                    Seguir
                  </Button>
                </FluCardContent>
              </FluCard>

              <FluCard variant="tricolor" hover="scale" size="lg">
                <FluCardContent className="text-center p-8">
                  <div className="bg-flu-grena w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-flu-grena mb-4">Comunidade</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Entre no nosso grupo de discussão e compartilhe suas memórias tricolores
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-flu-grena text-flu-grena hover:bg-flu-grena hover:text-white"
                  >
                    Participar
                  </Button>
                </FluCardContent>
              </FluCard>

              <FluCard variant="tricolor" hover="scale" size="lg">
                <FluCardContent className="text-center p-8">
                  <div className="bg-flu-verde w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Star className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-flu-grena mb-4">Feedback</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Sua opinião é importante! Nos ajude a melhorar o quiz com suas sugestões
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-flu-grena text-flu-grena hover:bg-flu-grena hover:text-white"
                  >
                    Enviar Feedback
                  </Button>
                </FluCardContent>
              </FluCard>
            </div>
          </div>
        </section>

        {/* Notifications and Modals */}
        <NotificationCenter />
        <FeedbackModal />
      </RootLayout>
    </>
  );
};

export default Index;