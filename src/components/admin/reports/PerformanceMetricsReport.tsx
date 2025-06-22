
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, Wifi, HardDrive } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface PerformanceData {
  timestamp: string;
  response_time: number;
  cpu_usage: number;
  memory_usage: number;
  concurrent_users: number;
}

export const PerformanceMetricsReport = () => {
  const { data: performanceData = [], isLoading } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async (): Promise<PerformanceData[]> => {
      // Simulate performance data for the last 24 hours
      const data = [];
      const now = new Date();
      
      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
          timestamp: timestamp.toISOString(),
          response_time: Math.random() * 200 + 100, // 100-300ms
          cpu_usage: Math.random() * 40 + 20, // 20-60%
          memory_usage: Math.random() * 30 + 40, // 40-70%
          concurrent_users: Math.floor(Math.random() * 50 + 10) // 10-60 users
        });
      }
      
      return data;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestData = performanceData[performanceData.length - 1];
  const avgResponseTime = performanceData.reduce((sum, d) => sum + d.response_time, 0) / performanceData.length;

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'bg-green-100 text-green-800';
    if (value <= thresholds.warning) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tempo de Resposta</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">
                    {latestData ? Math.round(latestData.response_time) : 0}ms
                  </span>
                  <Badge className={getStatusColor(latestData?.response_time || 0, { good: 200, warning: 500 })}>
                    {latestData?.response_time <= 200 ? 'Ótimo' : latestData?.response_time <= 500 ? 'Bom' : 'Lento'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">CPU</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">
                    {latestData ? Math.round(latestData.cpu_usage) : 0}%
                  </span>
                  <Badge className={getStatusColor(latestData?.cpu_usage || 0, { good: 50, warning: 80 })}>
                    {latestData?.cpu_usage <= 50 ? 'Normal' : latestData?.cpu_usage <= 80 ? 'Alto' : 'Crítico'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HardDrive className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Memória</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">
                    {latestData ? Math.round(latestData.memory_usage) : 0}%
                  </span>
                  <Badge className={getStatusColor(latestData?.memory_usage || 0, { good: 60, warning: 85 })}>
                    {latestData?.memory_usage <= 60 ? 'Normal' : latestData?.memory_usage <= 85 ? 'Alto' : 'Crítico'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Wifi className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Usuários Online</p>
                <span className="text-xl font-bold">
                  {latestData ? latestData.concurrent_users : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tempo de Resposta (24h)</CardTitle>
            <CardDescription>
              Média: {Math.round(avgResponseTime)}ms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(time) => new Date(time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(time) => new Date(time).toLocaleString('pt-BR')}
                  formatter={(value: number) => [`${Math.round(value)}ms`, 'Tempo de Resposta']}
                />
                <Line 
                  type="monotone" 
                  dataKey="response_time" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uso de Recursos</CardTitle>
            <CardDescription>
              CPU e Memória ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(time) => new Date(time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(time) => new Date(time).toLocaleString('pt-BR')}
                  formatter={(value: number, name: string) => [
                    `${Math.round(value)}%`, 
                    name === 'cpu_usage' ? 'CPU' : 'Memória'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="cpu_usage" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="memory_usage" 
                  stackId="2"
                  stroke="#8b5cf6" 
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
