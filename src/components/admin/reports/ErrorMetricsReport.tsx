
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useReports } from "@/hooks/use-reports";

interface ErrorMetric {
  error_type: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
  trend: 'up' | 'down' | 'stable';
}

interface ErrorMetricsReportProps {
  days?: number;
}

export const ErrorMetricsReport = ({ days = 7 }: ErrorMetricsReportProps) => {
  const { errorMetrics: dailyErrorMetrics = [], isLoadingErrors: isLoading } = useReports(Math.min(days, 30));

  const currentWindow = dailyErrorMetrics.slice(-Math.max(1, Math.floor(days / 2)));
  const previousWindow = dailyErrorMetrics.slice(
    -Math.max(2, Math.floor(days)),
    -Math.max(1, Math.floor(days / 2))
  );

  const aggregateErrors = (windowData: typeof dailyErrorMetrics) => {
    const totals: Record<string, number> = {};
    windowData.forEach(day => {
      day.top_errors.forEach(error => {
        totals[error.error_type] = (totals[error.error_type] || 0) + error.count;
      });
    });
    return totals;
  };

  const currentTotals = aggregateErrors(currentWindow);
  const previousTotals = aggregateErrors(previousWindow);
  const totalCurrentErrors = Object.values(currentTotals).reduce((sum, count) => sum + count, 0);

  const normalizedErrorMetrics: ErrorMetric[] = Object.entries(currentTotals)
    .map(([error_type, count]) => {
      const previousCount = previousTotals[error_type] || 0;
      const trend: 'up' | 'down' | 'stable' = count > previousCount ? 'up' : count < previousCount ? 'down' : 'stable';
      const ratio = totalCurrentErrors > 0 ? (count / totalCurrentErrors) * 100 : 0;

      let severity: 'low' | 'medium' | 'high' = 'low';
      if (ratio >= 35) severity = 'high';
      else if (ratio >= 15) severity = 'medium';

      return {
        error_type,
        count,
        severity,
        trend
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

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

  const totalErrors = normalizedErrorMetrics.reduce((sum, metric) => sum + metric.count, 0);
  const highSeverityErrors = normalizedErrorMetrics.filter(m => m.severity === 'high').length;
  const latestQuality = dailyErrorMetrics[dailyErrorMetrics.length - 1]?.data_quality ?? 'empty';
  const qualityLabel =
    latestQuality === 'real' ? 'Real' :
    latestQuality === 'partial' ? 'Parcial' :
    'Sem dados';
  const qualityClassName =
    latestQuality === 'real'
      ? 'bg-flu-verde/20 text-flu-verde'
      : latestQuality === 'partial'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-muted text-muted-foreground';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Resumo de Erros
            <Badge className={`ml-auto ${qualityClassName}`}>{qualityLabel}</Badge>
          </CardTitle>
          <CardDescription>
            Frequência e tipos de erros nos últimos {days} dias
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
                <div className="text-2xl font-bold text-orange-600">{highSeverityErrors}</div>
                <p className="text-sm text-muted-foreground">Alta Severidade</p>
              </div>
            </div>

            <div className="space-y-3">
              {normalizedErrorMetrics.map((error, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="font-medium text-sm">{error.error_type}</p>
                      <p className="text-xs text-muted-foreground">Volume agregado no período</p>
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
            <BarChart data={normalizedErrorMetrics}>
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
