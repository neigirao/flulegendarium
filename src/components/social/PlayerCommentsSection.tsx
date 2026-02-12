import { useState, useEffect } from 'react';
import { Star, MessageCircle, Send, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FluCard } from '@/components/ui/flu-card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  user_name: string;
  comment: string;
  rating: number;
  created_at: string;
}

interface PlayerCommentsSectionProps {
  playerId: string;
  playerName: string;
}

export const PlayerCommentsSection = ({ playerId, playerName }: PlayerCommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    
    // Subscribe to real-time comments
    const channel = supabase
      .channel(`comments-${playerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'player_comments',
          filter: `player_id=eq.${playerId}`
        },
        (payload) => {
          const newComment = payload.new as Comment;
          setComments(prev => [newComment, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('player_comments')
        .select('*')
        .eq('player_id', playerId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('player_comments')
        .insert({
          player_id: playerId,
          user_id: user?.id || null,
          user_name: user?.email?.split('@')[0] || 'Anônimo',
          comment: newComment.trim(),
          rating: newRating
        });

      if (error) throw error;

      setNewComment('');
      setNewRating(5);
      
      toast({
        title: "Comentário enviado!",
        description: "Seu comentário foi publicado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar",
        description: "Não foi possível enviar seu comentário. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  if (isLoading) {
    return (
      <FluCard className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </FluCard>
    );
  }

  return (
    <FluCard className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Comentários sobre {playerName}</h3>
        <Badge variant="secondary">{comments.length}</Badge>
      </div>

      {/* Comment Form */}
      <div className="mb-6 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg">
        <div className="mb-3">
          <label className="text-sm font-medium mb-2 block">Sua avaliação:</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setNewRating(rating)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star 
                  className={`w-5 h-5 ${
                    rating <= newRating 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-muted-foreground'
                  }`} 
                />
              </button>
            ))}
          </div>
        </div>

        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Compartilhe sua opinião sobre este jogador..."
          className="mb-3"
          rows={3}
        />
        
        <Button 
          onClick={submitComment}
          disabled={!newComment.trim() || isSubmitting}
          className="w-full"
        >
          <Send className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Enviando...' : 'Enviar Comentário'}
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Seja o primeiro a comentar sobre este jogador!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-l-4 border-primary/20 pl-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{comment.user_name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < comment.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{comment.comment}</p>
            </div>
          ))
        )}
      </div>
    </FluCard>
  );
};