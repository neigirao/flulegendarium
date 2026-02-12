import { ReactNode, createContext, useState } from 'react';
import { useAchievements } from '@/hooks/game';
import { useUX } from '@/components/ux/UXProvider';

interface PendingAchievement {
  id: string;
  title: string;
  description: string;
  points: number;
}

interface AchievementContextType {
  unlockAchievement: (achievementId: string, playerName?: string) => void;
  checkProgressAchievements: (score: number, streak: number, timeBonus: number) => void;
  getPlayerAchievements: () => PendingAchievement[];
  getTotalPoints: () => number;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

interface AchievementSystemProviderProps {
  children: ReactNode;
}

export const AchievementSystemProvider = ({ children }: AchievementSystemProviderProps) => {
  const { checkAndUnlockAchievements } = useAchievements();
  const { showAchievement, triggerHapticFeedback } = useUX();
  const [pendingAchievements, setPendingAchievements] = useState<PendingAchievement[]>([]);

  const unlockAchievement = async (achievementId: string, playerName?: string) => {
    // Create mock achievement for immediate feedback
    const mockAchievement = {
      id: achievementId,
      title: getAchievementTitle(achievementId),
      description: getAchievementDescription(achievementId),
      points: getAchievementPoints(achievementId)
    };
    
    // Add to pending notifications
    setPendingAchievements(prev => [...prev, mockAchievement]);
    
    // Show UX feedback
    showAchievement(
      mockAchievement.title,
      `${mockAchievement.description} (+${mockAchievement.points} pontos)`,
      0
    );
    
    // Trigger haptic feedback
    triggerHapticFeedback('success');
    
    // Log achievement unlock
    console.log(`🏆 Achievement unlocked: ${mockAchievement.title}`, {
      achievementId,
      playerName,
      points: mockAchievement.points
    });
  };

  const getAchievementTitle = (id: string): string => {
    const titles: Record<string, string> = {
      'first_score': 'Primeiro Ponto!',
      'score_hero': 'Herói Tricolor',
      'score_master': 'Mestre do Flu',
      'streak_starter': 'Aquecendo',
      'streak_master': 'Em Chamas',
      'streak_legend': 'Lendário',
      'quick_thinker': 'Pensamento Rápido',
      'speed_demon': 'Velocidade da Luz',
      'perfect_combo': 'Combo Perfeito'
    };
    return titles[id] || 'Conquista Desbloqueada';
  };

  const getAchievementDescription = (id: string): string => {
    const descriptions: Record<string, string> = {
      'first_score': 'Marque seus primeiros pontos',
      'score_hero': 'Alcance 500 pontos',
      'score_master': 'Alcance 1000 pontos',
      'streak_starter': 'Acerte 3 seguidas',
      'streak_master': 'Acerte 5 seguidas',
      'streak_legend': 'Acerte 10 seguidas',
      'quick_thinker': 'Resposta rápida',
      'speed_demon': 'Resposta ultra rápida',
      'perfect_combo': 'Sequência + velocidade'
    };
    return descriptions[id] || 'Parabéns pela conquista!';
  };

  const getAchievementPoints = (id: string): number => {
    const points: Record<string, number> = {
      'first_score': 50,
      'score_hero': 200,
      'score_master': 500,
      'streak_starter': 100,
      'streak_master': 250,
      'streak_legend': 500,
      'quick_thinker': 150,
      'speed_demon': 300,
      'perfect_combo': 400
    };
    return points[id] || 100;
  };

  const checkProgressAchievements = (score: number, streak: number, timeBonus: number) => {
    const totalScore = score + timeBonus;
    
    // Score-based achievements
    if (totalScore >= 1000) unlockAchievement('score_master');
    if (totalScore >= 500) unlockAchievement('score_hero');
    if (totalScore >= 100) unlockAchievement('first_score');
    
    // Streak-based achievements
    if (streak >= 10) unlockAchievement('streak_legend');
    if (streak >= 5) unlockAchievement('streak_master');
    if (streak >= 3) unlockAchievement('streak_starter');
    
    // Time-based achievements
    if (timeBonus >= 80) unlockAchievement('speed_demon');
    if (timeBonus >= 50) unlockAchievement('quick_thinker');
    
    // Special combinations
    if (streak >= 5 && timeBonus >= 60) unlockAchievement('perfect_combo');
  };

  const getPlayerAchievements = () => {
    return pendingAchievements;
  };

  const getTotalPoints = () => {
    return pendingAchievements.reduce((total, achievement) => total + achievement.points, 0);
  };

  const removePendingAchievement = (achievementId: string) => {
    setPendingAchievements(prev => prev.filter(a => a.id !== achievementId));
  };

  const contextValue: AchievementContextType = {
    unlockAchievement,
    checkProgressAchievements,
    getPlayerAchievements,
    getTotalPoints
  };

  return (
    <AchievementContext.Provider value={contextValue}>
      {children}
      
      {/* Achievement notifications */}
      {pendingAchievements.map((achievement, index) => (
        <div
          key={`${achievement.id}-${index}`}
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-flu-grena to-flu-verde text-white p-4 rounded-lg shadow-lg animate-slide-in-right"
          style={{ animationDelay: `${index * 500}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">🏆</div>
            <div>
              <h3 className="font-bold">{achievement.title}</h3>
              <p className="text-sm opacity-90">{achievement.description}</p>
              <p className="text-xs mt-1">+{achievement.points} pontos</p>
            </div>
            <button
              onClick={() => removePendingAchievement(achievement.id)}
              className="ml-auto text-white/80 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </AchievementContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { useAchievementSystem } from '@/hooks/use-achievement-system';
