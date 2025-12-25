import { useExecutiveAnalytics } from "@/hooks/use-executive-analytics";
import { FunnelVisualization } from "./FunnelVisualization";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { PlayerDifficultyAnalysis } from "./PlayerDifficultyAnalysis";
import { ScoreDistributionChart } from "./ScoreDistributionChart";
import { PeriodSelector } from "../shared/PeriodSelector";
import { useReportPeriod } from "@/hooks/use-report-period";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, TrendingUp, Users, Target, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export const ExecutiveAnalyticsDashboard = () => {
  const queryClient = useQueryClient();
  const { period, setPeriod } = useReportPeriod();
  const {
    funnelData,
    heatmapData,
    playerDifficulty,
    scoreDistribution,
    isLoading,
    isLoadingFunnel,
    isLoadingHeatmap,
    isLoadingDifficulty,
    isLoadingScores
  } = useExecutiveAnalytics(period);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['executive-funnel', period] });
    queryClient.invalidateQueries({ queryKey: ['executive-heatmap', period] });
    queryClient.invalidateQueries({ queryKey: ['executive-player-difficulty'] });
    queryClient.invalidateQueries({ queryKey: ['executive-score-distribution'] });
  };

  // Calcular métricas resumidas
  const conversionRate = funnelData.length > 0 
    ? funnelData[funnelData.length - 1]?.percentage || 0 
    : 0;
  
  const totalStarts = funnelData.find(s => s.id === 'starts')?.count || 0;
  const totalRankings = funnelData.find(s => s.id === 'rankings')?.count || 0;

  const peakActivity = heatmapData.length > 0
    ? [...heatmapData].sort((a, b) => b.value - a.value)[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">
            Dashboard Analytics Executivo
          </h2>
          <p className="text-muted-foreground">
            Visão completa do funil, atividade e performance dos jogadores
          </p>
        </div>
        <div className="flex items-center gap-4">
          <PeriodSelector value={period} onChange={setPeriod} size="sm" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{conversionRate}%</p>
                <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStarts.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Jogos Iniciados ({period}d)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRankings.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Rankings Salvos ({period}d)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {peakActivity ? `${peakActivity.dayLabel} ${peakActivity.hourLabel}` : '-'}
                </p>
                <p className="text-sm text-muted-foreground">Horário de Pico</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funil e Heatmap lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelVisualization stages={funnelData} isLoading={isLoadingFunnel} />
        <ActivityHeatmap data={heatmapData} isLoading={isLoadingHeatmap} />
      </div>

      {/* Distribuição e Análise de Dificuldade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreDistributionChart data={scoreDistribution} isLoading={isLoadingScores} />
        <PlayerDifficultyAnalysis data={playerDifficulty} isLoading={isLoadingDifficulty} />
      </div>
    </div>
  );
};
