
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NPSData {
  score: number;
  total_responses: number;
  promoters: number;
  passives: number;
  detractors: number;
  trend: 'up' | 'down' | 'stable';
  previous_score?: number;
}

export const NPSReport = () => {
  const { data: npsData, isLoading } = useQuery({
    queryKey: ['nps-report'],
    queryFn: async (): Promise<NPSData> => {
      try {
        // Try to get actual feedback data from the user_feedback table
        const { data: feedbacks, error } = await supabase
          .from('user_feedback')
          .select('rating, created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (error) {
          console.error('Error fetching NPS data:', error);
          // Return default data if no feedback exists
          return {
            score: 0,
            total_responses: 0,
            promoters: 0,
            passives: 0,
            detractors: 0,
            trend: 'stable'
          };
        }

        if (!feedbacks || feedbacks.length === 0) {
          return {
            score: 0,
            total_responses: 0,
            promoters: 0,
            passives: 0,
            detractors: 0,
            trend: 'stable'
          };
        }

        const ratings = feedbacks.map((f: any) => f.rating);
        const promoters = ratings.filter(r => r >= 9).length;
        const passives = ratings.filter(r => r >= 7 && r <= 8).length;
        const detractors = ratings.filter(r => r <= 6).length;
        
        const npsScore = Math.round(((promoters - detractors) / ratings.length) * 100);

        return {
          score: npsScore,
          total_responses: ratings.length,
          promoters,
          passives,
          detractors,
          trend: npsScore > 50 ? 'up' : npsScore < 30 ? 'down' : 'stable'
        };
      } catch (error) {
        console.error('Error in NPS calculation:', error);
        return {
          score: 0,
          total_responses: 0,
          promoters: 0,
          passives: 0,
          detractors: 0,
          trend: 'stable'
        };
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: 1
  });

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
          Índice de satisfação dos últimos 30 dias
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
