import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getUserAchievements } from "@/services/achievementsService";
import { supabase } from "@/integrations/supabase/client";
import { ACHIEVEMENTS } from "@/types/achievements";
import { AchievementProgressCard } from "./AchievementProgressCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Timer, BookOpen, Star, User, Brain, LucideIcon } from "lucide-react";

interface GameStats {
  totalGames: number;
  totalCorrect: number;
  totalAttempts: number;
  accuracy: number;
  bestStreak: number;
  avgTime: number;
  gamesPlayed: number;
}

interface CategoryInfo {
  name: string;
  icon: LucideIcon;
  color: string;
}

export const AchievementsGrid = () => {
  const { user } = useAuth();

  const { data: userAchievements = [] } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: () => getUserAchievements(user!.id),
    enabled: !!user,
  });

  // Query para estatísticas do jogo para calcular progresso real
  const { data: gameStats } = useQuery({
    queryKey: ['user-game-stats', user?.id],
    queryFn: async (): Promise<GameStats | null> => {
      if (!user) return null;
      
      const { data } = await supabase
        .from('user_game_history')
        .select('*')
        .eq('user_id', user.id);
      
      if (!data) return null;

      // Calcular estatísticas agregadas
      const totalGames = data.length;
      const totalCorrect = data.reduce((sum, game) => sum + game.correct_guesses, 0);
      const totalAttempts = data.reduce((sum, game) => sum + game.total_attempts, 0);
      const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
      const bestStreak = Math.max(...data.map(g => g.max_streak || 0), 0);
      const avgTime = data.reduce((sum, g) => sum + (g.time_taken || 0), 0) / totalGames;

      return {
        totalGames,
        totalCorrect,
        totalAttempts,
        accuracy,
        bestStreak,
        avgTime,
        gamesPlayed: totalGames
      };
    },
    enabled: !!user,
  });

  // Função para calcular progresso real baseado nas estatísticas
  const calculateRealProgress = (achievementId: string): number => {
    if (!gameStats) return 0;

    switch (achievementId) {
      case 'first_game':
        return gameStats.gamesPlayed > 0 ? 1 : 0;
      
      case 'streak_5':
        return Math.min(gameStats.bestStreak, 5);
      
      case 'streak_10':
        return Math.min(gameStats.bestStreak, 10);
      
      case 'accuracy_master':
        return gameStats.accuracy >= 80 ? 10 : Math.floor((gameStats.accuracy / 80) * 10);
      
      case 'speed_demon': {
        const fastGames = gameStats.avgTime < 5000 ? 10 : 0;
        return fastGames;
      }
      
      case 'games_10':
        return Math.min(gameStats.gamesPlayed, 10);
      
      case 'games_50':
        return Math.min(gameStats.gamesPlayed, 50);
      
      case 'games_100':
        return Math.min(gameStats.gamesPlayed, 100);
      
      default:
        return 0;
    }
  };

  const unlockedIds = userAchievements.map(ua => ua.achievement_id);
  const unlockedCount = unlockedIds.length;
  const totalCount = ACHIEVEMENTS.filter(a => !a.hidden).length;
  const totalPoints = userAchievements.reduce((sum, ua) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === ua.achievement_id);
    return sum + (achievement?.points || 0);
  }, 0);

  const groupByCategory = () => {
    const groups: Record<string, typeof ACHIEVEMENTS> = {};
    ACHIEVEMENTS.forEach(achievement => {
      if (!groups[achievement.category]) {
        groups[achievement.category] = [];
      }
      groups[achievement.category].push(achievement);
    });
    return groups;
  };

  const getCategoryInfo = (category: string): CategoryInfo => {
    switch (category) {
      case 'skill': return { name: 'Habilidade', icon: Trophy, color: 'text-primary' };
      case 'streak': return { name: 'Sequência', icon: Target, color: 'text-secondary' };
      case 'time': return { name: 'Velocidade', icon: Timer, color: 'text-difficulty-hard' };
      case 'knowledge': return { name: 'Conhecimento', icon: BookOpen, color: 'text-info' };
      case 'special': return { name: 'Especiais', icon: Star, color: 'text-accent' };
      case 'position': return { name: 'Posições', icon: User, color: 'text-info' };
      case 'behavioral': return { name: 'Comportamental', icon: Brain, color: 'text-secondary' };
      default: return { name: category, icon: Star, color: 'text-muted-foreground' };
    }
  };

  if (!user) {
    return null;
  }

  const achievementGroups = groupByCategory();
  const rarityStats = {
    common: unlockedIds.filter(id => ACHIEVEMENTS.find(a => a.id === id)?.rarity === 'common').length,
    rare: unlockedIds.filter(id => ACHIEVEMENTS.find(a => a.id === id)?.rarity === 'rare').length,
    epic: unlockedIds.filter(id => ACHIEVEMENTS.find(a => a.id === id)?.rarity === 'epic').length,
    legendary: unlockedIds.filter(id => ACHIEVEMENTS.find(a => a.id === id)?.rarity === 'legendary').length,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            <span>Conquistas Tricolores</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-normal">
            <Badge variant="outline" className="text-primary border-primary">
              {unlockedCount}/{totalCount} desbloqueadas
            </Badge>
            <Badge variant="outline" className="text-secondary border-secondary">
              {totalPoints} pontos
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-muted-foreground">{rarityStats.common}</div>
            <div className="text-xs text-muted-foreground/70">Comuns</div>
          </div>
          <div className="text-center p-3 bg-info-light rounded-lg">
            <div className="text-2xl font-bold text-info">{rarityStats.rare}</div>
            <div className="text-xs text-info/80">Raras</div>
          </div>
          <div className="text-center p-3 bg-accent/10 rounded-lg">
            <div className="text-2xl font-bold text-accent">{rarityStats.epic}</div>
            <div className="text-xs text-accent/80">Épicas</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-r from-warning-light to-warning/20 rounded-lg">
            <div className="text-2xl font-bold text-warning">{rarityStats.legendary}</div>
            <div className="text-xs text-warning">Lendárias</div>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unlocked">Desbloqueadas</TabsTrigger>
            <TabsTrigger value="progress">Em Progresso</TabsTrigger>
            {Object.keys(achievementGroups).slice(0, 5).map(category => {
              const categoryInfo = getCategoryInfo(category);
              return (
                <TabsTrigger key={category} value={category}>
                  <categoryInfo.icon className="w-4 h-4 mr-1" />
                  {categoryInfo.name}
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACHIEVEMENTS.map(achievement => {
                const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
                const progress = userAchievement?.progress || calculateRealProgress(achievement.id);
                
                return (
                  <AchievementProgressCard
                    key={achievement.id}
                    achievement={achievement}
                    userAchievement={userAchievement}
                    progress={progress}
                  />
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="unlocked" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id)).map(achievement => {
                const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
                return (
                  <AchievementProgressCard
                    key={achievement.id}
                    achievement={achievement}
                    userAchievement={userAchievement}
                    progress={achievement.condition.value}
                    showProgress={false}
                  />
                );
              })}
            </div>
            {unlockedCount === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Você ainda não desbloqueou nenhuma conquista.</p>
                <p className="text-sm mt-2">Continue jogando para ganhar seus primeiros badges!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id) && !a.hidden).map(achievement => {
                const progress = calculateRealProgress(achievement.id);
                
                return (
                  <AchievementProgressCard
                    key={achievement.id}
                    achievement={achievement}
                    progress={progress}
                  />
                );
              })}
            </div>
          </TabsContent>

          {Object.entries(achievementGroups).map(([category, achievements]) => {
            const categoryInfo = getCategoryInfo(category);
            return (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="mb-4">
                  <h3 className={`text-lg font-semibold flex items-center gap-2 ${categoryInfo.color}`}>
                    <categoryInfo.icon className="w-5 h-5" />
                    {categoryInfo.name}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map(achievement => {
                    const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
                    const progress = userAchievement?.progress || calculateRealProgress(achievement.id);
                    
                    return (
                      <AchievementProgressCard
                        key={achievement.id}
                        achievement={achievement}
                        userAchievement={userAchievement}
                        progress={progress}
                      />
                    );
                  })}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};
