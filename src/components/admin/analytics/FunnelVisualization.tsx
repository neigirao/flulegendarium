import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FunnelStage } from "@/services/executiveAnalyticsService";
import { ArrowDown, TrendingDown, Users, MousePointer, Play, Target, Trophy, Share2 } from "lucide-react";

interface FunnelVisualizationProps {
  stages: FunnelStage[];
  isLoading: boolean;
  periodDays?: number;
}

const getStageIcon = (stageId: string) => {
  switch (stageId) {
    case 'home_views': return <Users className="w-4 h-4" />;
    case 'mode_clicks': return <MousePointer className="w-4 h-4" />;
    case 'game_starts': 
    case 'starts': return <Play className="w-4 h-4" />;
    case 'first_guesses':
    case 'attempts': return <Target className="w-4 h-4" />;
    case 'completions':
    case 'sessions': return <Trophy className="w-4 h-4" />;
    case 'rankings': return <Trophy className="w-4 h-4" />;
    case 'shares': return <Share2 className="w-4 h-4" />;
    default: return null;
  }
};

export const FunnelVisualization = ({ stages, isLoading, periodDays = 30 }: FunnelVisualizationProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...stages.map(s => s.count), 1);
  const totalStages = stages.length;
  const finalConversion = stages[totalStages - 1]?.percentage || 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingDown className="w-5 h-5 text-primary" />
          Funil de Conversão ({periodDays} dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const widthPercent = (stage.count / maxCount) * 100;
            const isLast = index === stages.length - 1;
            
            return (
              <div key={stage.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium flex items-center gap-1.5 text-foreground">
                    {getStageIcon(stage.id)}
                    {stage.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground tabular-nums">
                      {stage.count.toLocaleString('pt-BR')}
                    </span>
                    <span className={`font-semibold tabular-nums min-w-[3rem] text-right ${
                      stage.percentage >= 70 ? 'text-green-600' :
                      stage.percentage >= 40 ? 'text-yellow-600' :
                      stage.percentage >= 20 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {stage.percentage}%
                    </span>
                  </div>
                </div>
                
                {/* Barra do funil */}
                <div className="relative h-8 bg-muted rounded-md overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500 rounded-md flex items-center px-2"
                    style={{ 
                      width: `${Math.max(widthPercent, 2)}%`,
                      backgroundColor: stage.color,
                    }}
                  >
                    {widthPercent > 15 && (
                      <span className="text-white text-xs font-medium truncate">
                        {stage.count.toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Indicador de dropoff */}
                {!isLast && stage.dropoffRate > 0 && (
                  <div className="flex items-center justify-center gap-1 py-0.5">
                    <ArrowDown className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      -{stage.dropoffRate}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Resumo */}
        {stages.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="space-y-0.5">
                <p className="text-lg font-bold text-primary tabular-nums">
                  {stages[0]?.count.toLocaleString('pt-BR') || 0}
                </p>
                <p className="text-[10px] text-muted-foreground">Total Visitantes</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-lg font-bold text-green-600 tabular-nums">
                  {finalConversion}%
                </p>
                <p className="text-[10px] text-muted-foreground">Conversão Final</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-lg font-bold text-destructive tabular-nums">
                  {100 - finalConversion}%
                </p>
                <p className="text-[10px] text-muted-foreground">Abandono Total</p>
              </div>
            </div>
          </div>
        )}

        {/* Insights automáticos */}
        {stages.length >= 4 && (
          <div className="mt-3 p-2 bg-muted/50 rounded-md">
            <p className="text-[10px] text-muted-foreground">
              💡 <span className="font-medium">Maior abandono:</span>{' '}
              {(() => {
                const maxDropoff = stages.reduce((max, stage) => 
                  stage.dropoffRate > max.dropoffRate ? stage : max, 
                  stages[0]
                );
                return `${maxDropoff.name} (${maxDropoff.dropoffRate}%)`;
              })()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
