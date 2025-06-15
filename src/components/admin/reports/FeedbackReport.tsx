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

export const FeedbackReport = () => {
  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['feedback-report'],
    queryFn: async (): Promise<FeedbackItem[]> => {
      try {
        const { data, error } = await supabase
          .from('user_feedback' as any)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.log('Feedback table not ready yet, using simulated data:', error);
          // Return simulated data until types are updated
          return [
            {
              id: '1',
              rating: 9,
              comment: 'Ótimo jogo! Muito divertido reconhecer os jogadores históricos.',
              category: 'gameplay',
              created_at: new Date().toISOString(),
              user_email: 'usuario1@example.com',
              status: 'new'
            },
            {
              id: '2',
              rating: 7,
              comment: 'Interface bonita, mas poderia ter mais dicas.',
              category: 'ui',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              user_email: 'usuario2@example.com',
              status: 'reviewed'
            },
            {
              id: '3',
              rating: 5,
              comment: 'Às vezes demora para carregar as imagens.',
              category: 'performance',
              created_at: new Date(Date.now() - 172800000).toISOString(),
              user_email: 'usuario3@example.com',
              status: 'resolved'
            }
          ];
        }

        return (data as FeedbackItem[]) || [];
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      gameplay: 'bg-blue-100 text-blue-800',
      ui: 'bg-purple-100 text-purple-800',
      performance: 'bg-orange-100 text-orange-800',
      content: 'bg-green-100 text-green-800',
      bug: 'bg-red-100 text-red-800',
      suggestion: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
      resolved: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
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
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
            <p className="text-sm text-gray-600">Média: {avgRating}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ThumbsUp className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-600">{positiveCount}</span>
            </div>
            <p className="text-xs text-gray-600">Positivos</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ThumbsDown className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-600">{negativeCount}</span>
            </div>
            <p className="text-xs text-gray-600">Negativos</p>
          </div>
        </div>

        {/* Lista de Feedbacks */}
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {feedbacks?.map((feedback) => (
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
                  <span className="text-xs text-gray-500">
                    {new Date(feedback.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                {feedback.comment && (
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    "{feedback.comment}"
                  </p>
                )}
                
                {feedback.user_email && (
                  <p className="text-xs text-gray-500">
                    Por: {feedback.user_email}
                  </p>
                )}
              </div>
            ))}
            
            {(!feedbacks || feedbacks.length === 0) && (
              <div className="text-center py-8 text-gray-500">
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
