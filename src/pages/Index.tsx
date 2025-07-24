import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Rocket, Instagram } from "lucide-react";
import { useEnhancedAnalytics } from "@/hooks/use-enhanced-analytics";
import { DynamicSEO } from "@/components/seo/DynamicSEO";
import { TopNavigation } from "@/components/navigation/TopNavigation";

const Index = () => {
  const navigate = useNavigate();
  const analytics = useEnhancedAnalytics();

  useEffect(() => {
    analytics.trackPageView('/');
    analytics.trackUserEngagement('homepage_view');
  }, [analytics]);

  // Fetch game statistics
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

  // Fetch top 10 rankings
  const { data: rankings } = useQuery({
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
      
      <div className="min-h-screen bg-gradient-to-br from-flu-verde via-slate-700 to-flu-grena">
        <TopNavigation />
        
        {/* Main Content */}
        <div className="pt-24">
          {/* Hero Section */}
          <section className="container mx-auto px-4 pt-16 pb-8 text-center">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
              LENDAS DO FLU
            </h1>
            <p className="text-2xl text-white/90 mb-4">
              O Quiz Definitivo do Fluminense
            </p>
            <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto">
              Teste seus conhecimentos sobre os grandes ídolos tricolores! Desde lendas 
              históricas até estrelas atuais - quanto você realmente conhece Flu.
            </p>

            {/* Main CTA Button */}
            <div className="mb-8">
              <Button
                onClick={() => {
                  analytics.trackUserEngagement('cta_click', 'main_hero');
                  navigate('/selecionar-modo-jogo');
                }}
                className="bg-flu-grena hover:bg-flu-grena/90 text-white text-xl px-12 py-6 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <Rocket className="w-6 h-6 mr-2" />
                COMEÇAR A JOGAR AGORA
              </Button>
            </div>

            <p className="text-white/70 text-sm mb-16">
              Gratuito • Sem cadastro necessário • {gameStats?.totalPlayers || 188} jogadores
            </p>

            {/* Hall da Fama Section */}
            <div className="mb-16">
              <div className="flex items-center justify-center mb-8">
                <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
                <h2 className="text-3xl font-bold text-white">Hall da Fama Tricolor</h2>
              </div>
              <p className="text-white/80 mb-8">Os maiores conhecedores do Fluminense</p>

              {/* Decade Tabs */}
              <Tabs defaultValue="geral" className="max-w-4xl mx-auto mb-8">
                <TabsList className="bg-white/10 backdrop-blur-sm rounded-full p-1 grid w-full grid-cols-7">
                  <TabsTrigger value="geral" className="text-white data-[state=active]:bg-white data-[state=active]:text-flu-grena">Geral</TabsTrigger>
                  <TabsTrigger value="1950s" className="text-white data-[state=active]:bg-white data-[state=active]:text-flu-grena">1950s</TabsTrigger>
                  <TabsTrigger value="1960s" className="text-white data-[state=active]:bg-white data-[state=active]:text-flu-grena">1960s</TabsTrigger>
                  <TabsTrigger value="1920s" className="text-white data-[state=active]:bg-white data-[state=active]:text-flu-grena">1920s</TabsTrigger>
                  <TabsTrigger value="2000s" className="text-white data-[state=active]:bg-white data-[state=active]:text-flu-grena">2000s</TabsTrigger>
                  <TabsTrigger value="2010s" className="text-white data-[state=active]:bg-white data-[state=active]:text-flu-grena">2010s</TabsTrigger>
                  <TabsTrigger value="2020s" className="text-white data-[state=active]:bg-white data-[state=active]:text-flu-grena">2020s</TabsTrigger>
                </TabsList>

                <TabsContent value="geral" className="mt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {rankings?.map((ranking, index) => (
                      <Card key={ranking.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                                index === 0 ? 'bg-yellow-500' : 
                                index === 1 ? 'bg-gray-400' : 
                                index === 2 ? 'bg-amber-600' : 'bg-flu-verde'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <h3 className="text-white font-bold text-sm">{ranking.player_name}</h3>
                                <p className="text-white/70 text-xs">{ranking.score} pontos</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-white">{ranking.score}</div>
                              <div className="text-white/70 text-xs">pontos</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Como Funciona */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Como funciona o Quiz?</h2>
                <p className="text-white/80 text-lg max-w-2xl mx-auto">
                  É simples e divertido! Teste seus conhecimentos sobre os ídolos tricolores
                </p>
              </div>

              {/* Game Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
                <div className="text-center group">
                  <div className="bg-white/10 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-all duration-300 border border-white/20">
                    <div className="w-12 h-12 bg-flu-verde rounded-full flex items-center justify-center text-white font-bold text-lg">
                      1
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Veja a Foto</h3>
                  <p className="text-white/80 leading-relaxed">
                    Uma foto de um jogador do Fluminense aparece na tela. Pode ser atual ou histórico!
                  </p>
                </div>

                <div className="text-center group">
                  <div className="bg-white/10 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-all duration-300 border border-white/20">
                    <div className="w-12 h-12 bg-flu-grena rounded-full flex items-center justify-center text-white font-bold text-lg">
                      2
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Digite o Nome</h3>
                  <p className="text-white/80 leading-relaxed">
                    Digite o nome do jogador. Pode usar apelidos ou nome completo - nosso sistema é inteligente!
                  </p>
                </div>

                <div className="text-center group">
                  <div className="bg-white/10 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-all duration-300 border border-white/20">
                    <div className="w-12 h-12 bg-flu-verde rounded-full flex items-center justify-center text-white font-bold text-lg">
                      3
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Ganhe Pontos</h3>
                  <p className="text-white/80 leading-relaxed">
                    Acertou? Ganhe pontos e continue! O jogo fica mais difícil conforme você evolui.
                  </p>
                </div>
              </div>
            </div>


            {/* Instagram Section */}
            <div className="max-w-lg mx-auto">
              <div className="flex items-center justify-center text-white">
                <Instagram className="w-6 h-6 mr-2" />
                <a
                  href="https://www.instagram.com/lendasdoflu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-bold hover:text-white/80 transition-colors"
                  onClick={() => analytics.trackUserEngagement('social_follow', 'instagram')}
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