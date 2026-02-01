import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FunnelTrend } from "@/services/executiveAnalyticsService";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

interface FunnelTrendChartProps {
  data: FunnelTrend[];
  isLoading: boolean;
}

export const FunnelTrendChart = ({ data, isLoading }: FunnelTrendChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendência do Funil</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Tendência do Funil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p>Dados insuficientes para mostrar tendência</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Formatar datas
  const chartData = data.map(d => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="w-5 h-5 text-primary" />
          Tendência do Funil (últimos {data.length} dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis 
                dataKey="dateLabel" 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                labelFormatter={(value) => `Data: ${value}`}
              />
              <Legend 
                wrapperStyle={{ fontSize: '10px' }}
                iconSize={8}
              />
              <Line 
                type="monotone" 
                dataKey="homeViews" 
                name="Visitas"
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="gameStarts" 
                name="Jogos"
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="completions" 
                name="Completados"
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="rankingsSaved" 
                name="Rankings"
                stroke="hsl(var(--chart-4))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Métricas resumidas */}
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          <div className="space-y-0.5">
            <p className="text-sm font-bold tabular-nums">
              {chartData.reduce((sum, d) => sum + d.homeViews, 0).toLocaleString('pt-BR')}
            </p>
            <p className="text-[10px] text-muted-foreground">Visitas</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-bold tabular-nums">
              {chartData.reduce((sum, d) => sum + d.gameStarts, 0).toLocaleString('pt-BR')}
            </p>
            <p className="text-[10px] text-muted-foreground">Jogos</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-bold tabular-nums">
              {chartData.reduce((sum, d) => sum + d.completions, 0).toLocaleString('pt-BR')}
            </p>
            <p className="text-[10px] text-muted-foreground">Completos</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-bold tabular-nums">
              {chartData.reduce((sum, d) => sum + d.rankingsSaved, 0).toLocaleString('pt-BR')}
            </p>
            <p className="text-[10px] text-muted-foreground">Rankings</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
