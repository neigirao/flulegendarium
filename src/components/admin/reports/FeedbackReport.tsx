
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { useReports } from "@/hooks/use-reports";

interface FeedbackReportProps {
  days?: number;
}

export const FeedbackReport = ({ days = 30 }: FeedbackReportProps) => {
  const { feedbackData = [], isLoadingFeedback: isLoading } = useReports(days);

  const getCategoryColor = (category: string) => {
    const colors = {
      gameplay: 'bg-blue-100 text-blue-800',
      ui: 'bg-purple-100 text-purple-800',
      performance: 'bg-orange-100 text-orange-800',
      content: 'bg-flu-verde/20 text-flu-verde',
      bug: 'bg-destructive/20 text-destructive',
      suggestion: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      gameplay: 'Jogabilidade',
      ui: 'Interface',
      performance: 'Performance',
      content: 'Conteúdo',
      bug: 'Bug',
      suggestion: 'Sugestão'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback dos Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalFeedback = feedbackData.reduce((sum, day) => sum + day.total_feedback, 0);
  const positiveCount = feedbackData.reduce((sum, day) => sum + day.positive_feedback, 0);
  const negativeCount = feedbackData.reduce((sum, day) => sum + day.negative_feedback, 0);
  const weightedRatingSum = feedbackData.reduce((sum, day) => sum + (day.avg_rating * day.total_feedback), 0);
  const avgRating = totalFeedback > 0 ? (weightedRatingSum / totalFeedback).toFixed(1) : '0.0';
  const latestDayWithCategories = [...feedbackData].reverse().find((day) => day.categories.length > 0);
  const categories = latestDayWithCategories?.categories ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Feedback Qualitativo
        </CardTitle>
        <CardDescription>
          Avaliações agregadas por período com dados reais de feedback
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo */}
        <div className="grid grid-cols-3 gap-4 pb-4 border-b">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {renderStars(Math.round(parseFloat(avgRating)))}
              </div>
              <p className="text-sm text-muted-foreground">Média: {avgRating}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ThumbsUp className="w-4 h-4 text-flu-verde" />
                <span className="font-medium text-flu-verde">{positiveCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Positivos</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ThumbsDown className="w-4 h-4 text-destructive" />
                <span className="font-medium text-destructive">{negativeCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Negativos</p>
            </div>
        </div>

        <div className="pt-2">
          <h4 className="text-sm font-semibold mb-3">Categorias com maior volume</h4>
          <div className="space-y-2">
            {categories.length > 0 ? (
              categories
                .sort((a, b) => b.count - a.count)
                .slice(0, 6)
                .map((category) => (
                  <div key={category.category} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(category.category)}>
                        {getCategoryLabel(category.category)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Nota média: {category.avg_rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm font-semibold">{category.count}</span>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum feedback recebido ainda</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t text-sm text-muted-foreground">
          Total de feedbacks no período: <span className="font-semibold text-foreground">{totalFeedback}</span>
        </div>
      </CardContent>
    </Card>
  );
};
