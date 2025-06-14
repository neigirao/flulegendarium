
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getUserAchievements } from "@/services/achievementsService";
import { ACHIEVEMENTS } from "@/types/achievements";
import { AchievementProgressCard } from "./AchievementProgressCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Timer, BookOpen, Star, User, Brain } from "lucide-react";

export const AchievementsGrid = () => {
  const { user } = useAuth();

  const { data: userAchievements = [] } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: () => getUserAchievements(user!.id),
    enabled: !!user,
  });

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

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'skill': return { name: 'Habilidade', icon: Trophy, color: 'text-flu-grena' };
      case 'streak': return { name: 'Sequência', icon: Target, color: 'text-flu-verde' };
      case 'time': return { name: 'Velocidade', icon: Timer, color: 'text-orange-600' };
      case 'knowledge': return { name: 'Conhecimento', icon: BookOpen, color: 'text-blue-600' };
      case 'special': return { name: 'Especiais', icon: Star, color: 'text-purple-600' };
      case 'position': return { name: 'Posições', icon: User, color: 'text-indigo-600' };
      case 'behavioral': return { name: 'Comportamental', icon: Brain, color: 'text-teal-600' };
      default: return { name: category, icon: Star, color: 'text-gray-600' };
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
        <CardTitle className="text-flu-grena flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            <span>Conquistas Tricolores</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-normal">
            <Badge variant="outline" className="text-flu-grena border-flu-grena">
              {unlockedCount}/{totalCount} desbloqueadas
            </Badge>
            <Badge variant="outline" className="text-flu-verde border-flu-verde">
              {totalPoints} pontos
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{rarityStats.common}</div>
            <div className="text-xs text-gray-500">Comuns</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{rarityStats.rare}</div>
            <div className="text-xs text-blue-500">Raras</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{rarityStats.epic}</div>
            <div className="text-xs text-purple-500">Épicas</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{rarityStats.legendary}</div>
            <div className="text-xs text-yellow-600">Lendárias</div>
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
                return (
                  <AchievementProgressCard
                    key={achievement.id}
                    achievement={achievement}
                    userAchievement={userAchievement}
                    progress={userAchievement?.progress || 0}
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
              <div className="text-center text-gray-500 py-8">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Você ainda não desbloqueou nenhuma conquista.</p>
                <p className="text-sm mt-2">Continue jogando para ganhar seus primeiros badges!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id) && !a.hidden).map(achievement => (
                <AchievementProgressCard
                  key={achievement.id}
                  achievement={achievement}
                  progress={0} // TODO: Calculate actual progress from game stats
                />
              ))}
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
                    return (
                      <AchievementProgressCard
                        key={achievement.id}
                        achievement={achievement}
                        userAchievement={userAchievement}
                        progress={userAchievement?.progress || 0}
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
