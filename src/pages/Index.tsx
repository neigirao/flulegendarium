import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Rocket, Brain, Settings, Instagram, HelpCircle, Shield, User } from "lucide-react";
import { useEnhancedAnalytics } from "@/hooks/use-enhanced-analytics";
import { DynamicSEO } from "@/components/seo/DynamicSEO";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const analytics = useEnhancedAnalytics();
  const { user } = useAuth();

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

  // Fetch top rankings
  const { data: rankings } = useQuery({
    queryKey: ['top-rankings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .order('score', { ascending: false })
        .limit(2);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Live stats
  const [liveStats, setLiveStats] = useState({
    online: 183,
    playing: 54,
    completed: 428
  });

  return (
    <>
      <DynamicSEO 
        customTitle="Lendas do Flu | Quiz Interativo dos Jogadores do Fluminense"
        customDescription="🏆 Teste seus conhecimentos sobre os grandes ídolos e lendas do Fluminense! Quiz adaptativo com diferentes níveis de dificuldade."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-flu-verde via-slate-700 to-flu-grena">
        {/* Header Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-flu-verde/20">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-flu-grena p-2 rounded-lg">
                  <div className="w-8 h-8 bg-white rounded text-flu-grena flex items-center justify-center font-bold">
                    LF
                  </div>
                </div>
                <h2 className="text-xl font-bold text-flu-grena">LENDAS DO FLU</h2>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/faq')}
                  className="text-white hover:bg-white/20"
                >
                  <HelpCircle className="h-4 w-4 mr-1" />
                  FAQ
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin/login-administrador')}
                  className="text-white hover:bg-white/20"
                >
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pt-16">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {rankings?.slice(0, 2).map((ranking, index) => (
                      <Card key={ranking.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                                index === 0 ? 'bg-yellow-500' : 'bg-flu-verde'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <h3 className="text-white font-bold">{ranking.player_name}</h3>
                                <p className="text-white/70 text-sm">{ranking.score} pontos</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-white">{ranking.score}</div>
                              <div className="text-white/70 text-sm">pontos</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Live Stats */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">O que esta acontecendo agora</h2>
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{liveStats.online}</div>
                  <div className="text-white/70">Aloyôns</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{liveStats.playing}</div>
                  <div className="text-white/70">ongacongando</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{liveStats.completed}</div>
                  <div className="text-white/70">completados</div>
                </div>
              </div>
            </div>

            {/* Como Funciona */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-12">Como funciona o Quiz?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Quiz Mode 1 */}
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-8">
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-flu-verde rounded-full flex items-center justify-center text-white font-bold text-xl">
                        1
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">Responda perguntas</h3>
                        <p className="text-white/70">sobre os ídolos tricolores</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => navigate('/quiz-adaptativo')}
                      className="w-full bg-flu-verde hover:bg-flu-verde/90 text-white font-semibold py-3"
                    >
                      JOGAR AGORA
                    </Button>
                  </CardContent>
                </Card>

                {/* Quiz Mode 2 */}
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-8 relative">
                  <div className="absolute top-4 right-4">
                    <span className="bg-flu-grena text-white text-xs px-3 py-1 rounded-full font-medium">NOVO</span>
                  </div>
                  
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-flu-grena rounded-full flex items-center justify-center text-white font-bold text-xl">
                        2
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">Acumule ponto</h3>
                        <p className="text-white/70">com respostas corretas</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => navigate('/quiz-decada')}
                      className="w-full bg-flu-grena hover:bg-flu-grena/90 text-white font-semibold py-3"
                    >
                      JOGAR AGORA
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Escolha Seu Desafio */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-12">Escolha Seu Desafio</h2>
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