
import React, { Suspense, useEffect } from "react";
import { RootLayout } from "@/components/RootLayout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LazyPlayerRanking } from "@/components/LazyComponents";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { usePerformanceOptimization } from "@/hooks/use-performance-optimization";

const Index = () => {
  const navigate = useNavigate();
  const { trackComponentPerformance } = usePerformanceOptimization();

  // Track homepage performance
  useEffect(() => {
    const startTime = performance.now();
    trackComponentPerformance('HomePage', startTime);
  }, [trackComponentPerformance]);

  // Buscar estatísticas do jogo
  const { data: gameStats } = useQuery({
    queryKey: ['game-stats'],
    queryFn: async () => {
      const [sessionsResponse, attemptsResponse] = await Promise.all([
        supabase.from('game_sessions').select('id'),
        supabase.from('game_attempts').select('id')
      ]);
      
      return {
        totalGames: sessionsResponse.data?.length || 0,
        totalAttempts: attemptsResponse.data?.length || 0
      };
    },
  });

  return (
    <>
      <SEOHead 
        title="Lendas do Flu | Quiz Interativo dos Jogadores do Fluminense"
        description="🏆 Teste seus conhecimentos sobre os grandes ídolos e lendas do Fluminense! Quiz adaptativo com diferentes níveis de dificuldade."
        keywords="fluminense, quiz, jogadores, futebol, tricolor, lendas do flu"
        url="https://flulegendarium.lovable.app"
      />
      <RootLayout>
        <TopNavigation />
        <div className="min-h-screen bg-gradient-to-br from-flu-verde/10 via-white to-flu-grena/10 pt-16">
          {/* Hero Section */}
          <div className="container mx-auto px-4 pt-12 pb-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-flu-grena mb-4">
                Lendas do Flu
              </h1>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                Teste seus conhecimentos sobre os grandes ídolos e lendas do Fluminense! 
                Descubra o quanto você realmente conhece sobre os craques tricolores.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
                  <span className="text-flu-grena font-semibold">🏆 +200 Jogadores</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
                  <span className="text-flu-grena font-semibold">⚽ Todas as Épocas</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
                  <span className="text-flu-grena font-semibold">🎯 Quiz Adaptativo</span>
                </div>
                {gameStats && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
                    <span className="text-flu-grena font-semibold">🎮 {gameStats.totalGames} Jogos</span>
                  </div>
                )}
              </div>

              {/* CTA Principal */}
              <div className="mb-12">
                <Button
                  onClick={() => navigate('/selecionar-modo-jogo')}
                  className="bg-flu-grena hover:bg-flu-grena/90 text-white text-lg px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  🚀 Começar a Jogar
                </Button>
                <p className="text-sm text-gray-600 mt-3">
                  Escolha seu modo preferido e teste seus conhecimentos!
                </p>
              </div>
            </div>

            {/* Features Section */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-flu-grena mb-8">
                Por que jogar Lendas do Flu?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <div className="text-4xl mb-4">🧠</div>
                  <h4 className="font-semibold text-flu-grena mb-2">Teste seu Conhecimento</h4>
                  <p className="text-gray-700 text-sm">
                    Descubra o quanto você realmente sabe sobre a história tricolor
                  </p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <div className="text-4xl mb-4">📚</div>
                  <h4 className="font-semibold text-flu-grena mb-2">Aprenda História</h4>
                  <p className="text-gray-700 text-sm">
                    Conheça curiosidades e fatos sobre os ídolos do Fluminense
                  </p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <div className="text-4xl mb-4">🏆</div>
                  <h4 className="font-semibold text-flu-grena mb-2">Desafie-se</h4>
                  <p className="text-gray-700 text-sm">
                    Supere seus limites e torne-se um verdadeiro conhecedor tricolor
                  </p>
                </div>
              </div>
            </div>

            {/* Prévia dos Modos */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-center text-flu-grena mb-8">
                Modos de Jogo Disponíveis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-flu-verde/20">
                  <div className="text-3xl mb-3">🎯</div>
                  <h4 className="font-semibold text-flu-grena mb-2 text-lg">Quiz Adaptativo</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    Sistema inteligente que ajusta a dificuldade baseado no seu desempenho
                  </p>
                  <div className="text-xs text-flu-verde">
                    ✓ Dificuldade automática • ✓ Pontuação inteligente
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-flu-grena/20 relative">
                  <div className="absolute top-2 right-2">
                    <span className="bg-flu-verde text-white text-xs px-2 py-1 rounded-full">NOVO</span>
                  </div>
                  <div className="text-3xl mb-3">🕰️</div>
                  <h4 className="font-semibold text-flu-grena mb-2 text-lg">Quiz por Década</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    Escolha uma época e teste conhecimentos sobre jogadores específicos
                  </p>
                  <div className="text-xs text-flu-verde">
                    ✓ Anos 70 até 2020s • ✓ Lendas por época
                  </div>
                </div>
              </div>
            </div>

            {/* Ranking Section */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-center text-flu-grena mb-8">
                🏆 Ranking dos Melhores Tricolores
              </h3>
              
              <div className="max-w-2xl mx-auto">
                <Suspense fallback={
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6" style={{ minHeight: '400px' }}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-6">
                        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </div>
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                }>
                  <LazyPlayerRanking />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </RootLayout>
    </>
  );
};

export default Index;
