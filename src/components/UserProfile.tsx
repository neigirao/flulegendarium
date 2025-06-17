
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getUserStatistics } from "@/services/statsService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Calendar, Target, User, BarChart3, Users, MessageSquare, Instagram } from "lucide-react";
import { useUserAnalytics } from "@/hooks/use-user-analytics";
import { PerformanceChart, SocialComparison, InsightsCard, PerformancePatterns } from "@/components/analytics";
import { Button } from "@/components/ui/button";

export const UserProfile = () => {
  const { user } = useAuth();
  const { data: userStats, isLoading } = useQuery({
    queryKey: ['user-statistics', user?.id],
    queryFn: () => getUserStatistics(user?.id),
    enabled: !!user?.id,
  });

  const { 
    performanceData, 
    socialData, 
    insights, 
    patterns,
    isLoading: isLoadingAnalytics 
  } = useUserAnalytics(user?.id);

  if (isLoading || isLoadingAnalytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-flu-grena">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum dado encontrado</h3>
        <p className="text-gray-600 mb-6">Jogue algumas partidas para ver suas estatísticas aqui!</p>
        <Button asChild>
          <a href="/selecionar-modo-jogo">Começar a Jogar</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header do Perfil */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-flu-grena rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-flu-grena">Meu Perfil Tricolor</h1>
          <p className="text-gray-600">Acompanhe seu desempenho no Lendas do Flu</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Social
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cards de Estatísticas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Melhor Sequência</CardTitle>
                <Trophy className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-flu-grena">{userStats.best_streak || 0}</div>
                <p className="text-xs text-muted-foreground">
                  acertos consecutivos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Jogos</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-flu-grena">{userStats.total_games || 0}</div>
                <p className="text-xs text-muted-foreground">
                  partidas jogadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pontuação Média</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-flu-grena">
                  {userStats.average_score ? Math.round(userStats.average_score) : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  pontos por jogo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Último Jogo</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-flu-grena">
                  {userStats.last_played ? new Date(userStats.last_played).toLocaleDateString('pt-BR') : 'Nunca'}
                </div>
                <p className="text-xs text-muted-foreground">
                  data da última partida
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas Detalhadas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas Gerais</CardTitle>
                <CardDescription>Resumo do seu desempenho geral</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Acertos</span>
                  <Badge variant="outline">{userStats.total_correct || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa de Acerto</span>
                  <Badge variant="outline">
                    {userStats.total_games > 0 
                      ? `${Math.round((userStats.total_correct / userStats.total_games) * 100)}%` 
                      : '0%'
                    }
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pontuação Total</span>
                  <Badge variant="outline">{userStats.total_score || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progresso Recente</CardTitle>
                <CardDescription>Seu desempenho nos últimos jogos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sequência Atual</span>
                    <Badge variant="secondary">{userStats.current_streak || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Melhor da Semana</span>
                    <Badge variant="secondary">{userStats.weekly_best || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Jogos Hoje</span>
                    <Badge variant="secondary">{userStats.games_today || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceChart data={performanceData} />
          <PerformancePatterns patterns={patterns} />
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <SocialComparison data={socialData} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <InsightsCard insights={insights} />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          {/* Instagram Feedback Section */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-purple-700">
                <Instagram className="w-6 h-6" />
                Conte sua experiência
              </CardTitle>
              <CardDescription>
                Compartilhe feedback sobre o jogo e suas sugestões conosco
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-gray-800 mb-2">💭 Como está sendo sua experiência?</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Queremos saber sua opinião sobre o Lendas do Flu! Nos siga no Instagram e nos mande uma DM com suas sugestões, dúvidas ou apenas para contar como está indo no jogo.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex-1"
                    asChild
                  >
                    <a 
                      href="https://www.instagram.com/jogolendasdoflu" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Instagram className="w-4 h-4" />
                      Seguir @jogolendasdoflu
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    asChild
                  >
                    <a 
                      href="https://www.instagram.com/jogolendasdoflu" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Enviar DM
                    </a>
                  </Button>
                </div>
              </div>

              {/* Quick Feedback Topics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-2">🎮 Sobre o Jogo</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Dificuldade dos jogadores</li>
                    <li>• Sugestões de novos jogadores</li>
                    <li>• Problemas técnicos</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-2">📱 Experiência</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Interface do usuário</li>
                    <li>• Performance no mobile</li>
                    <li>• Novas funcionalidades</li>
                  </ul>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-purple-200">
                <p className="text-sm text-gray-600">
                  Suas sugestões nos ajudam a melhorar o Lendas do Flu para toda comunidade tricolor! 🏆
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Game Statistics for Context */}
          <Card>
            <CardHeader>
              <CardTitle>Suas estatísticas para contexto</CardTitle>
              <CardDescription>
                Compartilhe essas informações quando nos der feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-flu-grena">{userStats.total_games || 0}</div>
                  <div className="text-xs text-gray-600">Jogos</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-flu-grena">{userStats.best_streak || 0}</div>
                  <div className="text-xs text-gray-600">Melhor Seq.</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-flu-grena">
                    {userStats.total_games > 0 
                      ? `${Math.round((userStats.total_correct / userStats.total_games) * 100)}%` 
                      : '0%'
                    }
                  </div>
                  <div className="text-xs text-gray-600">Taxa Acerto</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-flu-grena">
                    {userStats.average_score ? Math.round(userStats.average_score) : 0}
                  </div>
                  <div className="text-xs text-gray-600">Média Pts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
