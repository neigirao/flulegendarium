import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ScoreDistributionChartProps {
  data: { range: string; count: number }[];
  isLoading: boolean;
}

export const ScoreDistributionChart = ({ data, isLoading }: ScoreDistributionChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Pontuações</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--primary))'
  ];

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const dataWithPercent = data.map(d => ({
    ...d,
    percent: total > 0 ? Math.round((d.count / total) * 100) : 0
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Distribuição de Pontuações
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dataWithPercent} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="range" 
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value} jogadores (${props.payload.percent}%)`,
                    'Quantidade'
                  ]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {dataWithPercent.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Estatísticas resumidas */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{total}</p>
                <p className="text-xs text-muted-foreground">Total de Jogos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {dataWithPercent.find(d => d.range === '1000+')?.count || 0}
                </p>
                <p className="text-xs text-muted-foreground">Elite (1000+)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {dataWithPercent.filter(d => d.range === '301-500' || d.range === '501-800')
                    .reduce((sum, d) => sum + d.count, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Intermediário</p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Sem dados de pontuação disponíveis
          </div>
        )}
      </CardContent>
    </Card>
  );
};
