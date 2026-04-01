import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Target,
  Clock,
  Users,
  Zap
} from "lucide-react";
import { OperationalMetric, BusinessMetrics } from "@/services/adminBusinessIntelligence";

interface OperationalDashboardProps {
  metrics: OperationalMetric[];
  businessMetrics?: BusinessMetrics;
  isLoading?: boolean;
}

const getMinutesSinceLastUpdate = (metrics: OperationalMetric[]): number | null => {
  const latestTimestamp = metrics
    .map((metric) => metric.last_updated)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  if (!latestTimestamp) return null;

  const diffMs = Date.now() - new Date(latestTimestamp).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60)));
};

export const OperationalDashboard = ({ metrics, businessMetrics, isLoading }: OperationalDashboardProps) => {
  const minutesSinceLastUpdate = getMinutesSinceLastUpdate(metrics);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-muted h-32 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse bg-muted h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-flu-verde" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-flu-verde" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-flu-verde/20 text-flu-verde';
      case 'warning':
        return 'bg-warning/20 text-warning';
      case 'critical':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const criticalMetrics = metrics.filter(m => m.status === 'critical');
  const warningMetrics = metrics.filter(m => m.status === 'warning');

  return (
    <div className="space-y-6">
      {/* Alertas Críticos */}
      {criticalMetrics.length > 0 && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            <strong>Atenção:</strong> {criticalMetrics.length} métrica(s) crítica(s) detectada(s). 
            Ação imediata necessária.
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas de Negócio (KPIs Principais) */}
      {businessMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">DAU</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{businessMetrics.daily_active_users}</div>
              <p className="text-xs text-muted-foreground">Usuários ativos diários</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-flu-verde">{businessMetrics.engagement_score}%</div>
              <p className="text-xs text-muted-foreground">Score de engajamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retenção</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent-foreground">{businessMetrics.retention_rate}%</div>
              <p className="text-xs text-muted-foreground">Taxa de retenção</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessão Média</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary-foreground">{businessMetrics.avg_session_duration}m</div>
              <p className="text-xs text-muted-foreground">Duração média</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Métricas Operacionais Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Métricas Operacionais em Tempo Real
            <Badge variant="secondary" className="ml-auto">
              {minutesSinceLastUpdate !== null
                ? `Atualizado há ${minutesSinceLastUpdate}min`
                : "Atualização indisponível"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  <h4 className="font-semibold">{metric.metric_name}</h4>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(metric.trend)}
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Atual</p>
                  <p className="text-xl font-bold text-primary">{metric.current_value}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Anterior</p>
                  <p className="text-lg font-semibold text-foreground">{metric.previous_value}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Variação</p>
                  <p className={`text-lg font-semibold ${
                    metric.change_percentage > 0 ? 'text-flu-verde' : 
                    metric.change_percentage < 0 ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {metric.change_percentage > 0 ? '+' : ''}{metric.change_percentage}%
                  </p>
                </div>
              </div>

              {metric.target_value && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso para Meta</span>
                    <span className="font-medium">
                      {Math.round((metric.current_value / metric.target_value) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(metric.current_value / metric.target_value) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Meta: {metric.target_value}
                  </p>
                </div>
              )}
            </div>
          ))}

          {metrics.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Métricas operacionais carregando...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo de Alertas */}
      {(criticalMetrics.length > 0 || warningMetrics.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Central de Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalMetrics.map((metric, index) => (
              <div key={`critical-${index}`} className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">{metric.metric_name}</p>
                  <p className="text-sm text-destructive/80">
                    Valor atual ({metric.current_value}) está abaixo do limite crítico
                  </p>
                </div>
                <Badge className="bg-destructive/20 text-destructive">CRÍTICO</Badge>
              </div>
            ))}
            
            {warningMetrics.map((metric, index) => (
              <div key={`warning-${index}`} className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg border border-warning/30">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <div className="flex-1">
                  <p className="font-medium text-warning">{metric.metric_name}</p>
                  <p className="text-sm text-warning/80">
                    Monitoramento necessário - tendência de {metric.trend === 'down' ? 'queda' : 'atenção'}
                  </p>
                </div>
                <Badge className="bg-warning/20 text-warning">ATENÇÃO</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};