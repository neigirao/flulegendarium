import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  BarChart3,
  User,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

interface UserStats {
  totalGames: number;
  totalCorrect: number;
  accuracy: number;
  bestStreak: number;
  currentStreak: number;
  averageTime: number;
  totalPlayTime: number;
  favoriteDecade: string;
  gamesThisWeek: number;
  rank: number;
  totalPlayers: number;
  achievements: Achievement[];
}

export const PersonalDashboard: React.FC = () => {
  const { user } = useAuth();

  // Query para histórico de jogos
  const { data: gameHistory, isLoading } = useQuery({
    queryKey: ['user-game-history', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_game_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Query para conquistas
  const { data: achievements } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Query para ranking
  const { data: rankingData } = useQuery({
    queryKey: ['user-ranking', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Buscar todos os rankings ordenados por score
      const { data: rankings, error } = await supabase
        .from('rankings')
        .select('user_id, score')
        .order('score', { ascending: false });
      
      if (error) throw error;
      
      const userRank = rankings.findIndex(r => r.user_id === user.id) + 1;
      const totalPlayers = rankings.length;
      
      return { rank: userRank, totalPlayers };
    },
    enabled: !!user,
  });

  // Query para década favorita
  const { data: favoriteDecade } = useQuery({
    queryKey: ['favorite-decade', user?.id],
    queryFn: async () => {
      if (!user || !gameHistory) return 'Anos 80';
      
      // Contar jogos por década (assumindo que game_mode contém informação de década)
      const decadeCounts: Record<string, number> = {};
      
      gameHistory.forEach(game => {
        const decade = game.game_mode?.includes('década') 
          ? game.game_mode.replace('década-', '')
          : 'Anos 80';
        
        decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
      });
      
      // Retornar a década mais jogada
      const favorite = Object.entries(decadeCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Anos 80';
      
      return favorite;
    },
    enabled: !!user && !!gameHistory,
  });

  // Processar estatísticas
  const stats = React.useMemo(() => {
    if (!gameHistory || gameHistory.length === 0) {
      return {
        totalGames: 0,
        totalCorrect: 0,
        accuracy: 0,
        bestStreak: 0,
        currentStreak: 0,
        averageTime: 0,
        totalPlayTime: 0,
        favoriteDecade: favoriteDecade || 'Anos 80',
        gamesThisWeek: 0,
        rank: rankingData?.rank || 0,
        totalPlayers: rankingData?.totalPlayers || 0,
        achievements: processAchievements(achievements || [])
      };
    }

    const total = gameHistory.length;
    const correct = gameHistory.reduce((sum, game) => sum + game.correct_guesses, 0);
    const totalAttempts = gameHistory.reduce((sum, game) => sum + game.total_attempts, 0);
    const accuracy = totalAttempts > 0 ? (correct / totalAttempts) * 100 : 0;
    
    const bestStreak = Math.max(...gameHistory.map(g => g.max_streak || 0), 0);
    const totalTime = gameHistory.reduce((sum, game) => sum + (game.game_duration || 0), 0);
    const averageTime = total > 0 ? totalTime / total : 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const gamesThisWeek = gameHistory.filter(
      game => new Date(game.created_at) > oneWeekAgo
    ).length;

    return {
      totalGames: total,
      totalCorrect: correct,
      accuracy: Math.round(accuracy),
      bestStreak,
      currentStreak: gameHistory[0]?.current_streak || 0,
      averageTime: Math.round(averageTime / 1000),
      totalPlayTime: Math.round(totalTime / 1000),
      favoriteDecade: favoriteDecade || 'Anos 80',
      gamesThisWeek,
      rank: rankingData?.rank || 0,
      totalPlayers: rankingData?.totalPlayers || 0,
      achievements: processAchievements(achievements || [])
    };
  }, [gameHistory, achievements, rankingData, favoriteDecade]);

  const processAchievements = (achievements: { achievement_id: string; progress?: number | null; max_progress?: number | null; unlocked_at?: string }[]): Achievement[] => {
    const availableAchievements = [
      {
        id: 'first_game',
        title: 'Primeiro Jogo',
        description: 'Complete seu primeiro quiz',
        icon: '🎯',
        maxProgress: 1
      },
      {
        id: 'streak_5',
        title: 'Sequência de 5',
        description: 'Acerte 5 jogadores seguidos',
        icon: '🔥',
        maxProgress: 5
      },
      {
        id: 'accuracy_master',
        title: 'Mestre da Precisão',
        description: 'Mantenha 80% de acerto em 10 jogos',
        icon: '🎯',
        maxProgress: 10
      },
      {
        id: 'speed_demon',
        title: 'Raio Tricolor',
        description: 'Acerte 10 jogadores em menos de 5 segundos cada',
        icon: '⚡',
        maxProgress: 10
      },
      {
        id: 'decade_expert',
        title: 'Especialista de Década',
        description: 'Acerte 20 jogadores da mesma década',
        icon: '📅',
        maxProgress: 20
      }
    ];

    return availableAchievements.map(achievement => {
      const userAchievement = achievements.find(a => a.achievement_id === achievement.id);
      return {
        ...achievement,
        progress: userAchievement?.progress || 0,
        unlocked: userAchievement?.progress >= achievement.maxProgress,
        unlockedAt: userAchievement?.unlocked_at ? new Date(userAchievement.unlocked_at) : undefined
      };
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Meu Dashboard
          </h1>
          <p className="text-muted-foreground">
            {user ? `Bem-vindo, ${user.email}!` : 'Suas estatísticas como visitante'}
          </p>
        </div>
        
        {!user && (
          <Badge variant="outline" className="border-primary text-primary">
            <User className="w-4 h-4 mr-1" />
            Modo Visitante
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Jogos</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGames}</div>
            <p className="text-xs text-muted-foreground">
              {stats.gamesThisWeek} esta semana
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisão</CardTitle>
            <Target className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accuracy}%</div>
            <Progress value={stats.accuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Melhor Sequência</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bestStreak}</div>
            <p className="text-xs text-muted-foreground">
              Atual: {stats.currentStreak}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageTime}s</div>
            <p className="text-xs text-muted-foreground">
              por resposta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ... rest of the component remains the same (Tabs) ... */}
    </div>
  );
};
