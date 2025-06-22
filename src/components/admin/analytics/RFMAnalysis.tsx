
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Star, AlertTriangle, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface RFMSegment {
  segment: string;
  users: number;
  percentage: number;
  recency_avg: number;
  frequency_avg: number;
  monetary_avg: number;
  description: string;
  color: string;
  priority: 'high' | 'medium' | 'low';
  action_recommendation: string;
}

interface RFMAnalysisProps {
  segments: RFMSegment[];
  isLoading?: boolean;
}

export const RFMAnalysis = ({ segments, isLoading }: RFMAnalysisProps) => {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Star className="w-4 h-4 text-yellow-600" />;
      case 'medium': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'low': return <AlertTriangle className="w-4 h-4 text-gray-600" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise RFM</CardTitle>
          <CardDescription>Segmentação por Recência, Frequência e Valor Monetário</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalUsers = segments.reduce((sum, segment) => sum + segment.users, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-flu-grena" />
            Análise RFM - Segmentação de Usuários
          </CardTitle>
          <CardDescription>
            Segmentação baseada em Recência, Frequência e Valor Monetário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Pizza */}
            <div>
              <h4 className="font-medium mb-4">Distribuição por Segmento</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={segments}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="users"
                    label={({ segment, percentage }) => `${segment}: ${percentage}%`}
                  >
                    {segments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} usuários`, 'Quantidade']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Métricas RFM */}
            <div>
              <h4 className="font-medium mb-4">Métricas RFM por Segmento</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={segments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="recency_avg" fill="#3b82f6" name="Recência (dias)" />
                  <Bar dataKey="frequency_avg" fill="#10b981" name="Frequência" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes dos Segmentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {segments.map((segment, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(segment.priority)}
                  <h4 className="font-semibold">{segment.segment}</h4>
                </div>
                <Badge className={getPriorityColor(segment.priority)}>
                  {segment.priority}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Usuários</span>
                  <span className="font-medium">{segment.users} ({segment.percentage}%)</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Recência média</span>
                    <span>{segment.recency_avg} dias</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Frequência média</span>
                    <span>{segment.frequency_avg.toFixed(1)} jogos</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Valor médio</span>
                    <span>{segment.monetary_avg.toFixed(1)} pontos</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-600 mb-2">{segment.description}</p>
                  <div className="bg-blue-50 p-2 rounded text-xs">
                    <strong>Ação Recomendada:</strong> {segment.action_recommendation}
                  </div>
                </div>

                <Progress 
                  value={segment.percentage} 
                  className="h-2" 
                  style={{ backgroundColor: segment.color + '20' }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
