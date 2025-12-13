import { memo } from 'react';
import { useWeeklyRankings, getWeekDates } from '@/hooks/use-weekly-rankings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar } from 'lucide-react';
import { InstagramProfile } from '@/components/ui/instagram-profile';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnimatePresence } from 'framer-motion';
import { PodiumRankCompact } from '@/components/ui/podium-rank';

export const WeeklyLeaderboard = memo(() => {
  const { data: rankings, isLoading, error } = useWeeklyRankings(10);
  const { weekStart, weekEnd } = getWeekDates();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Trophy className="w-5 h-5 text-primary" />
            Ranking Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                <div className="w-9 h-9 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground font-body">
          Erro ao carregar ranking semanal
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center justify-between font-display">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <span>Ranking Semanal</span>
          </div>
          <Badge variant="outline" className="text-xs font-body font-normal">
            <Calendar className="w-3 h-3 mr-1" />
            {format(weekStart, "dd/MM", { locale: ptBR })} - {format(weekEnd, "dd/MM", { locale: ptBR })}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        {rankings && rankings.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {rankings.map((ranking, index) => (
                <PodiumRankCompact
                  key={ranking.id}
                  rank={index + 1}
                  playerName={ranking.player_name}
                  score={ranking.score}
                  isGuest={!ranking.user_id}
                  avatarSlot={
                    <InstagramProfile 
                      playerName={ranking.player_name}
                      showLink={true}
                      avatarSize="sm"
                    />
                  }
                />
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-8 text-muted-foreground font-body">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum resultado esta semana ainda.</p>
            <p className="text-sm">Seja o primeiro a jogar!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

WeeklyLeaderboard.displayName = 'WeeklyLeaderboard';
