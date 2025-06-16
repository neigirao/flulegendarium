
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SocialComparison as SocialComparisonType } from "@/services/advancedAnalyticsService";
import { Trophy, Users, TrendingUp, TrendingDown } from "lucide-react";

interface SocialComparisonProps {
  data?: SocialComparisonType;
  isLoading?: boolean;
}

export const SocialComparison = ({ data, isLoading }: SocialComparisonProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Comparação Social
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Comparação Social
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Dados insuficientes para comparação</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRankBadgeColor = (percentile: number) => {
    if (percentile >= 90) return "bg-yellow-500 text-white";
    if (percentile >= 75) return "bg-orange-500 text-white";
    if (percentile >= 50) return "bg-blue-500 text-white";
    return "bg-gray-500 text-white";
  };

  const getRankTitle = (percentile: number) => {
    if (percentile >= 95) return "Lenda";
    if (percentile >= 90) return "Elite";
    if (percentile >= 75) return "Veterano";
    if (percentile >= 50) return "Experiente";
    return "Novato";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-flu-grena" />
          Sua Posição no Ranking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ranking Principal */}
        <div className="text-center p-6 bg-gradient-to-r from-flu-verde/10 to-flu-grena/10 rounded-lg">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-flu-grena" />
          <div className="text-3xl font-bold text-flu-grena mb-1">
            #{data.user_rank}º
          </div>
          <div className="text-sm text-muted-foreground mb-3">
            de {data.total_users.toLocaleString()} jogadores
          </div>
          <Badge className={getRankBadgeColor(data.percentile)}>
            {getRankTitle(data.percentile)} - Top {100 - data.percentile}%
          </Badge>
        </div>

        {/* Comparações Detalhadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Pontuação vs Média</span>
              {data.score_vs_average > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className={`text-2xl font-bold ${
              data.score_vs_average > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.score_vs_average > 0 ? '+' : ''}{data.score_vs_average}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.score_vs_average > 0 ? 'Acima' : 'Abaixo'} da média geral
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Precisão vs Média</span>
              {data.accuracy_vs_average > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className={`text-2xl font-bold ${
              data.accuracy_vs_average > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.accuracy_vs_average > 0 ? '+' : ''}{data.accuracy_vs_average}%
            </div>
            <p className="text-xs text-muted-foreground">
              Diferença na taxa de acerto
            </p>
          </div>
        </div>

        {/* Percentil Visual */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Seu percentil</span>
            <span className="font-medium">{data.percentile}º percentil</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-flu-verde to-flu-grena h-3 rounded-full transition-all duration-500"
              style={{ width: `${data.percentile}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
