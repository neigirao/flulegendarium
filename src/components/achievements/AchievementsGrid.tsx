
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getUserAchievements } from "@/services/achievementsService";
import { ACHIEVEMENTS } from "@/types/achievements";
import { AchievementBadge } from "./AchievementBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AchievementsGrid = () => {
  const { user } = useAuth();

  const { data: userAchievements = [] } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: () => getUserAchievements(user!.id),
    enabled: !!user,
  });

  const unlockedIds = userAchievements.map(ua => ua.achievement_id);
  const unlockedCount = unlockedIds.length;
  const totalCount = ACHIEVEMENTS.length;

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

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'skill': return 'Habilidade';
      case 'streak': return 'Sequência';
      case 'time': return 'Velocidade';
      case 'knowledge': return 'Conhecimento';
      case 'special': return 'Especiais';
      default: return category;
    }
  };

  if (!user) {
    return null;
  }

  const achievementGroups = groupByCategory();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-flu-grena flex items-center justify-between">
          <span>Conquistas</span>
          <span className="text-sm font-normal text-gray-600">
            {unlockedCount}/{totalCount} desbloqueadas
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unlocked">Desbloqueadas</TabsTrigger>
            <TabsTrigger value="skill">Habilidade</TabsTrigger>
            <TabsTrigger value="streak">Sequência</TabsTrigger>
            <TabsTrigger value="knowledge">Conhecimento</TabsTrigger>
            <TabsTrigger value="special">Especiais</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ACHIEVEMENTS.map(achievement => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={unlockedIds.includes(achievement.id)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="unlocked" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id)).map(achievement => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={true}
                />
              ))}
            </div>
            {unlockedCount === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p>Você ainda não desbloqueou nenhuma conquista.</p>
                <p className="text-sm mt-2">Continue jogando para ganhar seus primeiros badges!</p>
              </div>
            )}
          </TabsContent>

          {Object.entries(achievementGroups).map(([category, achievements]) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-flu-grena">
                  {getCategoryName(category)}
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {achievements.map(achievement => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={unlockedIds.includes(achievement.id)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
