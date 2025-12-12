import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FunnelStage } from "@/services/executiveAnalyticsService";
import { ArrowDown, TrendingDown } from "lucide-react";

interface FunnelVisualizationProps {
  stages: FunnelStage[];
  isLoading: boolean;
}

export const FunnelVisualization = ({ stages, isLoading }: FunnelVisualizationProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...stages.map(s => s.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-primary" />
          Funil de Conversão (Últimos 30 dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const widthPercent = (stage.count / maxCount) * 100;
            
            return (
              <div key={stage.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      {stage.count.toLocaleString()}
                    </span>
                    <span className={`font-semibold ${
                      stage.percentage >= 70 ? 'text-green-600' :
                      stage.percentage >= 40 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {stage.percentage}%
                    </span>
                  </div>
                </div>
                
                {/* Barra do funil */}
                <div className="relative">
                  <div className="h-10 bg-muted rounded-lg overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500 rounded-lg flex items-center justify-center"
                      style={{ 
                        width: `${widthPercent}%`,
                        backgroundColor: stage.color,
                        minWidth: stage.count > 0 ? '2rem' : '0'
                      }}
                    >
                      {widthPercent > 20 && (
                        <span className="text-white text-sm font-medium">
                          {stage.count.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Indicador de dropoff */}
                {index < stages.length - 1 && stage.dropoffRate > 0 && (
                  <div className="flex items-center justify-center gap-2 py-1">
                    <ArrowDown className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {stage.dropoffRate}% de abandono
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Resumo */}
        {stages.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {stages[stages.length - 1]?.percentage || 0}%
                </p>
                <p className="text-sm text-muted-foreground">Taxa de Conversão Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">
                  {100 - (stages[stages.length - 1]?.percentage || 0)}%
                </p>
                <p className="text-sm text-muted-foreground">Abandono Total</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
