import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  Calendar,
  Star,
  Award,
  BarChart3,
  User,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export const PersonalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    if (user) {
      loadUserStats();
    } else {
      loadGuestStats();
    }
  }, [user, selectedPeriod]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas do usuário logado
      const { data: gameHistory } = await supabase
        .from('user_game_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user?.id);

      // Processar dados
      const processedStats = processGameHistory(gameHistory || []);
      const processedAchievements = processAchievements(achievements || []);

      setStats({
        ...processedStats,
        achievements: processedAchievements
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGuestStats = () => {
    // Carregar estatísticas do localStorage para usuários não logados
    const guestStats = localStorage.getItem('guest_stats');
    if (guestStats) {
      const parsed = JSON.parse(guestStats);
      setStats({
        totalGames: parsed.totalGames || 0,
        totalCorrect: parsed.totalCorrect || 0,
        accuracy: parsed.accuracy || 0,
        bestStreak: parsed.bestStreak || 0,
        currentStreak: parsed.currentStreak || 0,
        averageTime: parsed.averageTime || 0,
        totalPlayTime: parsed.totalPlayTime || 0,
        favoriteDecade: parsed.favoriteDecade || 'Anos 80',
        gamesThisWeek: parsed.gamesThisWeek || 0,
        rank: 0,
        totalPlayers: 0,
        achievements: getGuestAchievements(parsed)
      });
    } else {
      // Estatísticas iniciais
      setStats({
        totalGames: 0,
        totalCorrect: 0,
        accuracy: 0,
        bestStreak: 0,
        currentStreak: 0,
        averageTime: 0,
        totalPlayTime: 0,
        favoriteDecade: 'Anos 80',
        gamesThisWeek: 0,
        rank: 0,
        totalPlayers: 0,
        achievements: []
      });
    }
    setLoading(false);
  };

  const processGameHistory = (gameHistory: any[]) => {
    const total = gameHistory.length;
    const correct = gameHistory.reduce((sum, game) => sum + game.correct_guesses, 0);
    const totalAttempts = gameHistory.reduce((sum, game) => sum + game.total_attempts, 0);
    const accuracy = totalAttempts > 0 ? (correct / totalAttempts) * 100 : 0;
    
    const bestStreak = Math.max(...gameHistory.map(g => g.max_streak), 0);
    const totalTime = gameHistory.reduce((sum, game) => sum + (game.game_duration || 0), 0);
    const averageTime = total > 0 ? totalTime / total : 0;

    // Calcular jogos desta semana
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
      averageTime: Math.round(averageTime / 1000), // converter para segundos
      totalPlayTime: Math.round(totalTime / 1000),
      favoriteDecade: 'Anos 80', // TODO: calcular baseado nos dados
      gamesThisWeek,
      rank: 1, // TODO: calcular ranking real
      totalPlayers: 100 // TODO: obter do banco
    };
  };

  const processAchievements = (achievements: any[]): Achievement[] => {
    // Definir conquistas disponíveis
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
        unlockedAt: userAchievement?.unlocked_at
      };
    });
  };

  const getGuestAchievements = (guestStats: any): Achievement[] => {
    return [
      {
        id: 'first_game',
        title: 'Primeiro Jogo',
        description: 'Complete seu primeiro quiz',
        icon: '🎯',
        progress: guestStats.totalGames > 0 ? 1 : 0,
        maxProgress: 1,
        unlocked: guestStats.totalGames > 0
      }
    ];
  };

  if (loading) {
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

  if (!stats) return null;

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

      {/* Tabs Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Estatísticas Detalhadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total de Acertos</span>
                  <span className="font-semibold">{stats.totalCorrect}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tempo Total Jogado</span>
                  <span className="font-semibold">{Math.round(stats.totalPlayTime / 60)}min</span>
                </div>
                <div className="flex justify-between">
                  <span>Década Favorita</span>
                  <span className="font-semibold">{stats.favoriteDecade}</span>
                </div>
                {user && (
                  <div className="flex justify-between">
                    <span>Ranking Global</span>
                    <span className="font-semibold">#{stats.rank} de {stats.totalPlayers}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Progresso Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Jogos desta semana</span>
                      <span>{stats.gamesThisWeek}/7</span>
                    </div>
                    <Progress value={(stats.gamesThisWeek / 7) * 100} className="mt-1" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Meta de precisão (80%)</span>
                      <span>{stats.accuracy}%</span>
                    </div>
                    <Progress value={(stats.accuracy / 80) * 100} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.achievements.map((achievement) => (
              <Card key={achievement.id} className={`
                transition-all duration-300
                ${achievement.unlocked 
                  ? 'bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20' 
                  : 'opacity-60'
                }
              `}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <CardTitle className="text-base">{achievement.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.maxProgress) * 100}
                      className="h-2"
                    />
                    {achievement.unlocked && achievement.unlockedAt && (
                      <p className="text-xs text-green-600">
                        Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gráfico de Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Gráfico de progresso em desenvolvimento</p>
                  <p className="text-sm">Em breve: análise detalhada do seu desempenho</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};