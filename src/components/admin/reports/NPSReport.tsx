
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useReports } from "@/hooks/use-reports";

interface NPSData {
  score: number;
  total_responses: number;
  promoters: number;
  passives: number;
  detractors: number;
  trend: 'up' | 'down' | 'stable';
  previous_score?: number;
}

interface NPSReportProps {
  days?: number;
}

export const NPSReport = ({ days = 30 }: NPSReportProps) => {
  const { npsData: dailyNpsData = [], isLoadingNPS: isLoading } = useReports(days);

  const currentWindow = dailyNpsData.slice(-Math.max(1, Math.floor(days / 2)));
  const previousWindow = dailyNpsData.slice(
    -Math.max(2, Math.floor(days)),
    -Math.max(1, Math.floor(days / 2))
  );

  const summarizeWindow = (windowData: typeof dailyNpsData) => {
    const total_responses = windowData.reduce((sum, item) => sum + item.total_responses, 0);
    const promoters = windowData.reduce((sum, item) => sum + item.promoters, 0);
    const passives = windowData.reduce((sum, item) => sum + item.passives, 0);
    const detractors = windowData.reduce((sum, item) => sum + item.detractors, 0);
    const score = total_responses > 0
      ? Math.round(((promoters - detractors) / total_responses) * 100)
      : 0;

    return { total_responses, promoters, passives, detractors, score };
  };

  const currentSummary = summarizeWindow(currentWindow);
  const previousSummary = summarizeWindow(previousWindow);

  const npsData: NPSData = {
    ...currentSummary,
    trend: currentSummary.score > previousSummary.score ? 'up' :
      currentSummary.score < previousSummary.score ? 'down' : 'stable',
    previous_score: previousSummary.score
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NPS Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    switch (npsData?.trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 50) return 'text-green-600';
    if (score >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 50) return 'Excelente';
    if (score >= 0) return 'Bom';
    return 'Precisa Melhorar';
  };

  const safeTotal = npsData?.total_responses || 0;
  const safePromoters = npsData?.promoters || 0;
  const safePassives = npsData?.passives || 0;
  const safeDetractors = npsData?.detractors || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Net Promoter Score (NPS)
          {getTrendIcon()}
        </CardTitle>
        <CardDescription>
          Índice de satisfação dos últimos {days} dias
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className={`text-4xl font-bold ${getScoreColor(npsData?.score || 0)}`}>
            {npsData?.score || 0}
          </div>
          <Badge variant={npsData?.score && npsData.score >= 50 ? 'default' : 'secondary'}>
            {getScoreLabel(npsData?.score || 0)}
          </Badge>
        </div>

        {safeTotal > 0 ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Promotores (9-10)</span>
              <span className="text-sm font-medium text-green-600">
                {safePromoters} ({Math.round((safePromoters / safeTotal) * 100)}%)
              </span>
            </div>
            <Progress 
              value={(safePromoters / safeTotal) * 100} 
              className="h-2"
            />

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Neutros (7-8)</span>
              <span className="text-sm font-medium text-yellow-600">
                {safePassives} ({Math.round((safePassives / safeTotal) * 100)}%)
              </span>
            </div>
            <Progress 
              value={(safePassives / safeTotal) * 100} 
              className="h-2"
            />

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Detratores (0-6)</span>
              <span className="text-sm font-medium text-red-600">
                {safeDetractors} ({Math.round((safeDetractors / safeTotal) * 100)}%)
              </span>
            </div>
            <Progress 
              value={(safeDetractors / safeTotal) * 100} 
              className="h-2"
            />
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>Nenhum feedback recebido ainda</p>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600">
            Total de respostas: <span className="font-medium">{safeTotal}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
