
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, Clock, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useReports } from "@/hooks/use-reports";

export const UserEngagementReport = () => {
  const { userEngagementData, isLoadingEngagement } = useReports();

  if (isLoadingEngagement) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="animate-pulse h-6 bg-gray-200 rounded w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-64 bg-gray-200 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular métricas resumo
  const recentData = userEngagementData.slice(-7); // Últimos 7 dias
  const avgDAU = recentData.length > 0 ? 
    Math.round(recentData.reduce((sum, d) => sum + d.daily_active_users, 0) / recentData.length) : 0;
  
  const avgSessionDuration = recentData.length > 0 ? 
    Math.round(recentData.reduce((sum, d) => sum + d.avg_session_duration, 0) / recentData.length) : 0;
  
  const avgEngagementScore = recentData.length > 0 ? 
    Math.round(recentData.reduce((sum, d) => sum + d.engagement_score, 0) / recentData.length) : 0;
  
  const totalNewUsers = userEngagementData.reduce((sum, d) => sum + d.new_users, 0);
  
  const avgBounceRate = recentData.length > 0 ? 
    Math.round(recentData.reduce((sum, d) => sum + d.bounce_rate, 0) / recentData.length) : 0;

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <div className="w-4 h-4" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-flu-grena mb-2">Relatório de Engajamento do Usuário</h3>
        <p className="text-gray-600 text-sm">Análise detalhada do comportamento e engajamento dos usuários</p>
      </div>

      {/* Métricas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              {getTrendIcon(avgDAU, avgDAU * 0.9)}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">DAU Médio</p>
              <p className="text-2xl font-bold text-blue-600">{avgDAU}</p>
              <p className="text-xs text-gray-500">Últimos 7 dias</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-green-600" />
              {getTrendIcon(avgSessionDuration, 5)}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Sessão Média</p>
              <p className="text-2xl font-bold text-green-600">{avgSessionDuration}min</p>
              <p className="text-xs text-gray-500">Duração por sessão</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <Badge className={getScoreColor(avgEngagementScore)}>
                {avgEngagementScore}%
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Engajamento</p>
              <p className="text-2xl font-bold text-purple-600">{avgEngagementScore}%</p>
              <p className="text-xs text-gray-500">Score médio</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-orange-600" />
              {getTrendIcon(totalNewUsers, totalNewUsers * 0.8)}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Novos Usuários</p>
              <p className="text-2xl font-bold text-orange-600">{totalNewUsers}</p>
              <p className="text-xs text-gray-500">Período total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <Badge className={avgBounceRate < 30 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {avgBounceRate}%
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Taxa Rejeição</p>
              <p className="text-2xl font-bold text-red-600">{avgBounceRate}%</p>
              <p className="text-xs text-gray-500">Sessões < 1min</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Usuários Ativos Diários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Ativos Diários</CardTitle>
          <CardDescription>
            Evolução dos usuários ativos, novos usuários e usuários retornando
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userEngagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={formatFullDate}
              />
              <Line 
                type="monotone" 
                dataKey="daily_active_users" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Usuários Ativos"
              />
              <Line 
                type="monotone" 
                dataKey="new_users" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Novos Usuários"
              />
              <Line 
                type="monotone" 
                dataKey="returning_users" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Usuários Retornando"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráficos de Engajamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score de Engajamento</CardTitle>
            <CardDescription>
              Métrica combinada de duração, retenção e atividade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={userEngagementData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={formatFullDate}
                  formatter={(value: number) => [`${value}%`, 'Score']}
                />
                <Bar 
                  dataKey="engagement_score" 
                  fill="#8b5cf6"
                  name="Score de Engajamento"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Duração da Sessão & Taxa de Rejeição</CardTitle>
            <CardDescription>
              Tempo médio de sessão vs taxa de abandono
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={userEngagementData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  labelFormatter={formatFullDate}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="avg_session_duration" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Duração Média (min)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="bounce_rate" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Taxa de Rejeição (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Insights Automatizados</CardTitle>
          <CardDescription>Análises baseadas nos dados de engajamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">📈 Tendência Positiva</h4>
              <p className="text-sm text-blue-700">
                {avgEngagementScore > 70 ? 
                  'Score de engajamento está em nível saudável. Usuários estão bem engajados.' :
                  'Score de engajamento pode melhorar. Considere campanhas de reativação.'
                }
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">⏱️ Duração da Sessão</h4>
              <p className="text-sm text-green-700">
                {avgSessionDuration > 5 ? 
                  'Duração média da sessão está boa. Usuários passam tempo suficiente no app.' :
                  'Duração da sessão está baixa. Considere melhorias na UX para reter usuários.'
                }
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">🎯 Taxa de Rejeição</h4>
              <p className="text-sm text-yellow-700">
                {avgBounceRate < 30 ? 
                  'Taxa de rejeição está em nível aceitável.' :
                  'Taxa de rejeição alta. Revisar onboarding e primeiro contato com o app.'
                }
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">👥 Aquisição de Usuários</h4>
              <p className="text-sm text-purple-700">
                {totalNewUsers > 50 ? 
                  'Boa taxa de aquisição de novos usuários no período.' :
                  'Considere campanhas de marketing para atrair mais usuários.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
