
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FeedbackItem {
  id: string;
  rating: number;
  comment?: string;
  category: 'gameplay' | 'ui' | 'performance' | 'content' | 'bug' | 'suggestion';
  created_at: string;
  user_email?: string;
  status: 'new' | 'reviewed' | 'resolved';
}

interface FeedbackReportProps {
  days?: number;
}

export const FeedbackReport = ({ days = 30 }: FeedbackReportProps) => {
  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['feedback-report', days],
    queryFn: async (): Promise<FeedbackItem[]> => {
      try {
        const periodAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase
          .from('user_feedback')
          .select('*')
          .gte('created_at', periodAgo)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          console.error('Error fetching feedback data:', error);
          return [];
        }

        // Validate and transform data to match our interface
        if (data && Array.isArray(data)) {
          return data.filter(item => 
            item && 
            typeof item === 'object' && 
            'id' in item && 
            'rating' in item && 
            'created_at' in item
          ).map(item => ({
            id: item.id,
            rating: item.rating,
            comment: item.comment || undefined,
            category: (['gameplay', 'ui', 'performance', 'content', 'bug', 'suggestion'].includes(item.category) 
              ? item.category 
              : 'gameplay') as 'gameplay' | 'ui' | 'performance' | 'content' | 'bug' | 'suggestion',
            created_at: item.created_at,
            user_email: item.user_email || undefined,
            status: (['new', 'reviewed', 'resolved'].includes(item.status) 
              ? item.status 
              : 'new') as 'new' | 'reviewed' | 'resolved'
          }));
        }

        return [];
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

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

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-flu-verde/20 text-flu-verde'
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground';
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

  const avgRating = feedbacks?.length 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : '0.0';

  const positiveCount = feedbacks?.filter(f => f.rating >= 4).length || 0;
  const negativeCount = feedbacks?.filter(f => f.rating <= 2).length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Feedback Qualitativo
        </CardTitle>
        <CardDescription>
          Avaliações e comentários dos usuários
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

        {/* Lista de Feedbacks */}
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {feedbacks && feedbacks.length > 0 ? (
              feedbacks.map((feedback) => (
                <div key={feedback.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {renderStars(feedback.rating)}
                      </div>
                      <Badge className={getCategoryColor(feedback.category)}>
                        {getCategoryLabel(feedback.category)}
                      </Badge>
                      <Badge className={getStatusColor(feedback.status)}>
                        {feedback.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(feedback.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  {feedback.comment && (
                    <p className="text-sm text-foreground bg-muted p-2 rounded">
                      "{feedback.comment}"
                    </p>
                  )}
                  
                  {feedback.user_email && (
                    <p className="text-xs text-muted-foreground">
                      Por: {feedback.user_email}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum feedback recebido ainda</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
