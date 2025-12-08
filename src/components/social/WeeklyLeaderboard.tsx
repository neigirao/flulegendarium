import { memo } from 'react';
import { useWeeklyRankings, getWeekDates } from '@/hooks/use-weekly-rankings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Medal, User, Crown, Award } from 'lucide-react';
import { InstagramProfile } from '@/components/ui/instagram-profile';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

const getRankIcon = (index: number) => {
  switch (index) {
    case 0:
      return <Crown className="w-5 h-5 text-yellow-500" />;
    case 1:
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 2:
      return <Award className="w-5 h-5 text-amber-600" />;
    default:
      return null;
  }
};

const getRankStyle = (index: number) => {
  switch (index) {
    case 0:
      return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300';
    case 1:
      return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300';
    case 2:
      return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300';
    default:
      return 'bg-card border-border hover:bg-muted/50';
  }
};

export const WeeklyLeaderboard = memo(() => {
  const { data: rankings, isLoading, error } = useWeeklyRankings(10);
  const { weekStart, weekEnd } = getWeekDates();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Ranking Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                <div className="w-8 h-8 bg-muted rounded-full" />
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
        <CardContent className="p-6 text-center text-muted-foreground">
          Erro ao carregar ranking semanal
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <span>Ranking Semanal</span>
          </div>
          <Badge variant="outline" className="text-xs font-normal">
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
                <motion.div
                  key={ranking.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${getRankStyle(index)}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${index < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                    `}>
                      {getRankIcon(index) || (index + 1)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <InstagramProfile 
                        playerName={ranking.player_name}
                        showLink={true}
                        avatarSize="sm"
                      />
                      
                      {!ranking.user_id && (
                        <Badge variant="outline" className="text-xs">
                          <User className="w-3 h-3 mr-1" />
                          Convidado
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">
                      {ranking.score} pts
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
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
