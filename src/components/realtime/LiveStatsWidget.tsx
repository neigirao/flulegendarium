import { Users, Trophy, Target } from 'lucide-react';
import { FluCard } from '@/components/ui/flu-card';
import { useRealtimeStats } from '@/hooks/use-realtime-stats';

export const LiveStatsWidget = () => {
  const { stats, isLoading } = useRealtimeStats();

  if (isLoading) {
    return (
      <FluCard className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </FluCard>
    );
  }

  return (
    <FluCard className="p-4 bg-gradient-to-br from-background to-primary/5">
      <h3 className="text-lg font-semibold text-center mb-4 text-primary">
        📊 Estatísticas ao Vivo
      </h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary">
            {stats.online_users}
          </div>
          <div className="text-xs text-muted-foreground">
            Online agora
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Trophy className="w-6 h-6 text-secondary" />
          </div>
          <div className="text-2xl font-bold text-secondary">
            {stats.games_played_today}
          </div>
          <div className="text-xs text-muted-foreground">
            Jogos hoje
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Target className="w-6 h-6 text-accent" />
          </div>
          <div className="text-2xl font-bold text-accent">
            {stats.total_players_discovered}
          </div>
          <div className="text-xs text-muted-foreground">
            Descobertos
          </div>
        </div>
      </div>
    </FluCard>
  );
};