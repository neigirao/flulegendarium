
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Target, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface EngagementData {
  date: string;
  daily_active_users: number;
  session_duration: number;
  games_completed: number;
  new_users: number;
}

interface UserSegment {
  name: string;
  value: number;
  color: string;
}

export const UserEngagementReport = () => {
  const { data: engagementData = [], isLoading: loadingEngagement } = useQuery({
    queryKey: ['user-engagement'],
    queryFn: async (): Promise<EngagementData[]> => {
      const data = [];
      const now = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        data.push({
          date: date.toISOString().split('T')[0],
          daily_active_users: Math.floor(Math.random() * 100 + 50),
          session_duration: Math.random() * 300 + 180, // 3-8 minutes
          games_completed: Math.floor(Math.random() * 200 + 100),
          new_users: Math.floor(Math.random() * 20 + 5)
        });
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000
  });

  const { data: userSegments = [], isLoading: loadingSegments } = useQuery({
    queryKey: ['user-segments'],
    queryFn: async (): Promise<UserSegment[]> => {
      return [
        { name: 'Jogadores Ativos', value: 45, color: '#10b981' },
        { name: 'Jogadores Casuais', value: 30, color: '#3b82f6' },
        { name: 'Novos Usuários', value: 15, color: '#f59e0b' },
        { name: 'Usuários Inativos', value: 10, color: '#ef4444' }
      ];
    },
    staleTime: 10 * 60 * 1000
  });

  if (loadingEngagement || loadingSegments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Engagement de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestData = engagementData[engagementData.length - 1];
  const avgSessionDuration = engagementData.reduce((sum, d) => sum + d.session_duration, 0) / engagementData.length;
  const totalActiveUsers = latestData?.daily_active_users || 0;
  const totalGamesCompleted = engagementData.reduce((sum, d) => sum + d.games_completed, 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Usuários Ativos Hoje</p>
                <span className="text-2xl font-bold">{totalActiveUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Duração Média</p>
                <span className="text-2xl font-bold">
                  {Math.round(avgSessionDuration / 60)}min
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Jogos Completados</p>
                <span className="text-2xl font-bold">{totalGamesCompleted}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Taxa de Retenção</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">78%</span>
                  <Badge className="bg-green-100 text-green-800">+5%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usuários Ativos (7 dias)</CardTitle>
            <CardDescription>
              Tendência de usuários ativos diários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                  formatter={(value: number) => [value, 'Usuários Ativos']}
                />
                <Area 
                  type="monotone" 
                  dataKey="daily_active_users" 
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segmentação de Usuários</CardTitle>
            <CardDescription>
              Distribuição por tipo de engajamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userSegments}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {userSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas Detalhadas de Engagement</CardTitle>
          <CardDescription>
            Análise comportamental dos últimos 7 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">Retenção por Dia</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Dia 1</span>
                  <Badge className="bg-green-100 text-green-800">92%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Dia 7</span>
                  <Badge className="bg-yellow-100 text-yellow-800">78%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Dia 30</span>
                  <Badge className="bg-orange-100 text-orange-800">65%</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">Sessões por Usuário</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Média Diária</span>
                  <span className="font-medium">2.3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Média Semanal</span>
                  <span className="font-medium">8.7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Power Users (>5/dia)</span>
                  <span className="font-medium">23%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">Qualidade do Engagement</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Taxa de Conclusão</span>
                  <Badge className="bg-green-100 text-green-800">87%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tempo até Desistência</span>
                  <span className="font-medium">4.2min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Satisfação (NPS)</span>
                  <Badge className="bg-blue-100 text-blue-800">72</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
