import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, User, Zap } from 'lucide-react';
import { InstagramProfile } from '@/components/ui/instagram-profile';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface RankingItem {
  id: string;
  player_name: string;
  score: number;
  games_played: number;
  user_id: string | null;
  created_at: string;
}

export const RealtimeRanking = () => {
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEntry, setNewEntry] = useState<string | null>(null);

  useEffect(() => {
    // Buscar dados iniciais
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      
      if (data && !error) {
        setRankings(data);
      }
      setIsLoading(false);
    };

    fetchInitialData();

    // Configurar realtime
    const channel = supabase
      .channel('rankings-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rankings'
        },
        (payload) => {
          const newRanking = payload.new as RankingItem;
          
          setRankings(current => {
            // Adicionar nova entrada e reordenar
            const updated = [...current, newRanking]
              .sort((a, b) => b.score - a.score)
              .slice(0, 10); // Manter apenas top 10
            
            return updated;
          });

          // Destacar nova entrada
          setNewEntry(newRanking.id);
          setTimeout(() => setNewEntry(null), 3000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rankings'
        },
        (payload) => {
          const updatedRanking = payload.new as RankingItem;
          
          setRankings(current => {
            return current
              .map(item => item.id === updatedRanking.id ? updatedRanking : item)
              .sort((a, b) => b.score - a.score);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
            <div className="w-8 h-8 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary animate-pulse" />
        <span className="text-sm font-medium text-primary">Ranking em Tempo Real</span>
      </div>
      
      <AnimatePresence mode="popLayout">
        {rankings.map((ranking, index) => {
          const isGuest = !ranking.user_id;
          const isNew = newEntry === ranking.id;
          
          return (
            <motion.div
              key={ranking.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`
                flex items-center justify-between p-3 rounded-lg border transition-all duration-300
                ${isNew ? 'bg-primary/10 border-primary shadow-lg' : 'bg-card border-border hover:bg-muted'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${index < 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}
                `}>
                  {index + 1}
                </div>
                
                <div className="flex items-center gap-2">
                  <InstagramProfile 
                    playerName={ranking.player_name}
                    showLink={true}
                    avatarSize="sm"
                  />
                  
                  {isGuest && (
                    <Badge variant="outline" className="text-xs">
                      <User className="w-3 h-3 mr-1" />
                      Convidado
                    </Badge>
                  )}
                  
                  {isNew && (
                    <Badge className="bg-primary text-white text-xs animate-pulse">
                      <Zap className="w-3 h-3 mr-1" />
                      Novo!
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="font-bold text-primary">
                  {ranking.score}
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};