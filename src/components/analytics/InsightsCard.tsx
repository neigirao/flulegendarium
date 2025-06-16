
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerInsight } from "@/services/advancedAnalyticsService";
import { Lightbulb, TrendingUp, TrendingDown, Minus, Trophy, Target, AlertTriangle, BarChart } from "lucide-react";

interface InsightsCardProps {
  insights: PlayerInsight[];
  isLoading?: boolean;
}

export const InsightsCard = ({ insights, isLoading }: InsightsCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Insights Personalizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-20 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Insights Personalizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <BarChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Continue jogando para receber insights personalizados!</p>
            <p className="text-sm">Precisa de mais dados para análise</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInsightIcon = (type: PlayerInsight['type']) => {
    switch (type) {
      case 'strength':
        return <Trophy className="w-5 h-5 text-green-600" />;
      case 'weakness':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'improvement':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'pattern':
        return <Target className="w-5 h-5 text-purple-600" />;
      default:
        return <Lightbulb className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: PlayerInsight['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getInsightColor = (type: PlayerInsight['type']) => {
    switch (type) {
      case 'strength':
        return 'border-l-green-500 bg-green-50';
      case 'weakness':
        return 'border-l-red-500 bg-red-50';
      case 'improvement':
        return 'border-l-blue-500 bg-blue-50';
      case 'pattern':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getBadgeColor = (type: PlayerInsight['type']) => {
    switch (type) {
      case 'strength':
        return 'bg-green-100 text-green-800';
      case 'weakness':
        return 'bg-red-100 text-red-800';
      case 'improvement':
        return 'bg-blue-100 text-blue-800';
      case 'pattern':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-flu-grena" />
          Insights Personalizados
          <Badge variant="secondary" className="ml-auto">
            {insights.length} insight{insights.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-l-4 ${getInsightColor(insight.type)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getInsightIcon(insight.type)}
                <h4 className="font-semibold text-sm">{insight.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(insight.trend)}
                <Badge className={getBadgeColor(insight.type)}>
                  {insight.metric > 0 && '+'}
                  {insight.metric}
                  {insight.type === 'improvement' || insight.type === 'pattern' ? '%' : ''}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-700">{insight.description}</p>
          </div>
        ))}
        
        {insights.length > 0 && (
          <div className="mt-4 p-3 bg-flu-grena/5 rounded-lg border border-flu-grena/20">
            <p className="text-xs text-flu-grena font-medium">
              💡 Dica: Estes insights são atualizados automaticamente conforme você joga!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
