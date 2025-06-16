
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import { Calendar, TrendingDown, TrendingUp } from "lucide-react";
import { CohortData } from "@/services/adminBusinessIntelligence";

interface CohortAnalysisCardProps {
  cohorts: CohortData[];
  isLoading?: boolean;
}

const chartConfig = {
  retention_week_1: {
    label: "Semana 1",
    color: "hsl(var(--chart-1))",
  },
  retention_week_2: {
    label: "Semana 2", 
    color: "hsl(var(--chart-2))",
  },
  retention_week_4: {
    label: "Semana 4",
    color: "hsl(var(--chart-3))",
  },
  retention_week_12: {
    label: "Semana 12",
    color: "hsl(var(--chart-4))",
  },
};

export const CohortAnalysisCard = ({ cohorts, isLoading }: CohortAnalysisCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Análise de Coorte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!cohorts || cohorts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Análise de Coorte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Dados insuficientes para análise de coorte</p>
              <p className="text-sm">Aguarde mais dados históricos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular tendência geral de retenção
  const avgRetentionWeek4 = cohorts.reduce((sum, cohort) => sum + cohort.retention_week_4, 0) / cohorts.length;
  const isRetentionHealthy = avgRetentionWeek4 >= 30;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-flu-grena" />
            Análise de Coorte - Retenção de Usuários
            <div className="ml-auto flex items-center gap-2">
              {isRetentionHealthy ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm text-gray-600">
                Retenção Média 4 sem: {Math.round(avgRetentionWeek4)}%
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cohorts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="cohort_period" 
                  className="text-xs"
                  tickFormatter={(value) => new Date(value + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
                />
                <YAxis 
                  className="text-xs"
                  label={{ value: 'Retenção (%)', angle: -90, position: 'insideLeft' }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => `Coorte: ${new Date(value + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="retention_week_1"
                  stroke="var(--color-retention_week_1)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Semana 1"
                />
                <Line
                  type="monotone"
                  dataKey="retention_week_2"
                  stroke="var(--color-retention_week_2)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Semana 2"
                />
                <Line
                  type="monotone"
                  dataKey="retention_week_4"
                  stroke="var(--color-retention_week_4)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Semana 4"
                />
                <Line
                  type="monotone"
                  dataKey="retention_week_12"
                  stroke="var(--color-retention_week_12)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Semana 12"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabela de Coortes Detalhada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Período</th>
                  <th className="text-right p-2">Usuários</th>
                  <th className="text-right p-2">1ª Semana</th>
                  <th className="text-right p-2">2ª Semana</th>
                  <th className="text-right p-2">4ª Semana</th>
                  <th className="text-right p-2">12ª Semana</th>
                  <th className="text-right p-2">LTV Médio</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">
                      {new Date(cohort.cohort_period + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-2 text-right">{cohort.users_acquired}</td>
                    <td className="p-2 text-right text-green-600 font-medium">{cohort.retention_week_1}%</td>
                    <td className="p-2 text-right text-blue-600 font-medium">{cohort.retention_week_2}%</td>
                    <td className="p-2 text-right text-orange-600 font-medium">{cohort.retention_week_4}%</td>
                    <td className="p-2 text-right text-red-600 font-medium">{cohort.retention_week_12}%</td>
                    <td className="p-2 text-right text-gray-700">R$ {cohort.avg_ltv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
