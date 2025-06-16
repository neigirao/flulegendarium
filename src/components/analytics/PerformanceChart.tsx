
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TimeSeriesData } from "@/services/advancedAnalyticsService";
import { TrendingUp, Calendar } from "lucide-react";

interface PerformanceChartProps {
  data: TimeSeriesData[];
  isLoading?: boolean;
}

const chartConfig = {
  score: {
    label: "Pontuação",
    color: "hsl(var(--chart-1))",
  },
  accuracy: {
    label: "Taxa de Acerto (%)",
    color: "hsl(var(--chart-2))",
  },
};

export const PerformanceChart = ({ data, isLoading }: PerformanceChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance ao Longo do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance ao Longo do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Dados insuficientes para análise temporal</p>
              <p className="text-sm">Jogue mais partidas para ver seus gráficos!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-flu-grena" />
          Performance ao Longo do Tempo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-score)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-score)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accuracy)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-accuracy)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                labelFormatter={(value) => `Data: ${formatDate(value as string)}`}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--color-score)"
                fillOpacity={1}
                fill="url(#scoreGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="var(--color-accuracy)"
                fillOpacity={1}
                fill="url(#accuracyGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Pontuação Média</p>
            <p className="text-2xl font-bold text-flu-grena">
              {Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Taxa de Acerto Média</p>
            <p className="text-2xl font-bold text-flu-verde">
              {Math.round(data.reduce((sum, d) => sum + d.accuracy, 0) / data.length)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
