
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Users, DollarSign, Target, Zap } from "lucide-react";

interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  previousValue: number;
  unit: string;
  format: 'number' | 'percentage' | 'currency' | 'time';
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
  description: string;
}

interface BusinessKPIsProps {
  kpis: KPIMetric[];
  isLoading?: boolean;
}

export const BusinessKPIs = ({ kpis, isLoading }: BusinessKPIsProps) => {
  const formatValue = (value: number, format: string, unit: string) => {
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return `R$ ${value.toFixed(2)}`;
      case 'time':
        return `${value}${unit}`;
      default:
        return `${value}${unit}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  const getKPIIcon = (name: string) => {
    if (name.includes('Usuário') || name.includes('User')) return <Users className="w-5 h-5" />;
    if (name.includes('Revenue') || name.includes('Receita')) return <DollarSign className="w-5 h-5" />;
    if (name.includes('Taxa') || name.includes('Rate')) return <Target className="w-5 h-5" />;
    return <Zap className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
                <div className="h-2 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-flu-grena mb-2">KPIs de Negócio</h3>
        <p className="text-gray-600 text-sm">Métricas principais para tomada de decisão</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const progress = Math.min((kpi.value / kpi.target) * 100, 100);
          const changePercent = kpi.previousValue > 0 
            ? ((kpi.value - kpi.previousValue) / kpi.previousValue) * 100 
            : 0;

          return (
            <Card key={kpi.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getKPIIcon(kpi.name)}
                    <span className="text-sm font-medium text-gray-600">{kpi.name}</span>
                  </div>
                  <Badge className={getStatusColor(kpi.status)}>
                    {kpi.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold text-flu-grena">
                      {formatValue(kpi.value, kpi.format, kpi.unit)}
                    </span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(kpi.trend)}
                      <span className={`text-sm ${
                        changePercent > 0 ? 'text-green-600' : 
                        changePercent < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Meta: {formatValue(kpi.target, kpi.format, kpi.unit)}</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <p className="text-xs text-gray-500">{kpi.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
