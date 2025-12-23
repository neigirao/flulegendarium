
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ErrorMetric {
  error_type: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trend: 'up' | 'down' | 'stable';
  last_occurred: string;
}

export const ErrorMetricsReport = () => {
  const { data: errorMetrics = [], isLoading } = useQuery({
    queryKey: ['error-metrics'],
    queryFn: async (): Promise<ErrorMetric[]> => {
      // Simulate error metrics data
      return [
        {
          error_type: 'Game Load Timeout',
          count: 12,
          severity: 'medium',
          trend: 'down',
          last_occurred: '2024-01-15T10:30:00Z'
        },
        {
          error_type: 'Image Loading Failed',
          count: 8,
          severity: 'low',
          trend: 'stable',
          last_occurred: '2024-01-14T15:45:00Z'
        },
        {
          error_type: 'Database Connection Error',
          count: 3,
          severity: 'high',
          trend: 'up',
          last_occurred: '2024-01-15T12:00:00Z'
        },
        {
          error_type: 'Authentication Failure',
          count: 5,
          severity: 'medium',
          trend: 'down',
          last_occurred: '2024-01-13T09:15:00Z'
        }
      ];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-flu-verde/20 text-flu-verde',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-destructive/20 text-destructive'
    };
    return colors[severity as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-destructive" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-flu-verde" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Erro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalErrors = errorMetrics.reduce((sum, metric) => sum + metric.count, 0);
  const criticalErrors = errorMetrics.filter(m => m.severity === 'critical').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Resumo de Erros
          </CardTitle>
          <CardDescription>
            Frequência e tipos de erros nas últimas 24 horas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <div className="text-2xl font-bold text-destructive">{totalErrors}</div>
                <p className="text-sm text-muted-foreground">Total de Erros</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{criticalErrors}</div>
                <p className="text-sm text-muted-foreground">Críticos</p>
              </div>
            </div>

            <div className="space-y-3">
              {errorMetrics.map((error, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="font-medium text-sm">{error.error_type}</p>
                      <p className="text-xs text-muted-foreground">
                        Última vez: {new Date(error.last_occurred).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{error.count}x</span>
                    <Badge className={getSeverityColor(error.severity)}>
                      {error.severity}
                    </Badge>
                    {getTrendIcon(error.trend)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Erros</CardTitle>
          <CardDescription>
            Frequência por tipo de erro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={errorMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="error_type" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
