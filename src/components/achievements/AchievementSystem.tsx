
import { useEffect, useState } from 'react';
import { Trophy, Medal, Star, Crown, Heart, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: 'scoring' | 'streak' | 'historical' | 'special';
  fluTrivia?: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_goal',
    name: 'Primeiro Gol',
    description: 'Acerte seu primeiro jogador',
    icon: <Star className="w-6 h-6 text-yellow-500" />,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: 'scoring',
    fluTrivia: 'Como o primeiro gol do Flu em 1902!'
  },
  {
    id: 'fred_tribute',
    name: 'Homenagem ao Fred',
    description: 'Acerte 199 jogadores (como os gols do Fred)',
    icon: <Crown className="w-6 h-6 text-flu-grena" />,
    unlocked: false,
    progress: 0,
    maxProgress: 199,
    category: 'historical',
    fluTrivia: 'Fred marcou 199 gols pelo Fluminense!'
  },
  {
    id: 'castilho_defense',
    name: 'Defesa do Castilho',
    description: 'Complete 10 acertos seguidos',
    icon: <Trophy className="w-6 h-6 text-flu-verde" />,
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    category: 'streak',
    fluTrivia: 'Como as defesas lendárias de Castilho!'
  },
  {
    id: 'tetra_champion',
    name: 'Tetracampeão Carioca',
    description: 'Acerte 4 jogadores seguidos',
    icon: <Medal className="w-6 h-6 text-gold" />,
    unlocked: false,
    progress: 0,
    maxProgress: 4,
    category: 'streak',
    fluTrivia: 'Como os 4 títulos cariocas seguidos (1983-1985)!'
  },
  {
    id: 'copa_libertadores',
    name: 'Glória Eterna',
    description: 'Acerte 50 jogadores no total',
    icon: <Heart className="w-6 h-6 text-flu-grena" />,
    unlocked: false,
    progress: 0,
    maxProgress: 50,
    category: 'scoring',
    fluTrivia: 'Comemorando a Libertadores de 2008!'
  },
  {
    id: 'century_club',
    name: 'Clube do Século',
    description: 'Acerte 100 jogadores no total',
    icon: <Zap className="w-6 h-6 text-flu-verde" />,
    unlocked: false,
    progress: 0,
    maxProgress: 100,
    category: 'scoring',
    fluTrivia: 'Flu, o time do século XX!'
  }
];

interface AchievementSystemProps {
  currentScore: number;
  currentStreak: number;
  totalCorrectGuesses: number;
}

export const AchievementSystem = ({ 
  currentScore, 
  currentStreak, 
  totalCorrectGuesses 
}: AchievementSystemProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const { toast } = useToast();

  useEffect(() => {
    const updatedAchievements = achievements.map(achievement => {
      const newAchievement = { ...achievement };
      
      switch (achievement.id) {
        case 'first_goal':
          newAchievement.progress = Math.min(totalCorrectGuesses, 1);
          break;
        case 'fred_tribute':
          newAchievement.progress = Math.min(totalCorrectGuesses, 199);
          break;
        case 'castilho_defense':
          newAchievement.progress = Math.min(currentStreak, 10);
          break;
        case 'tetra_champion':
          newAchievement.progress = Math.min(currentStreak, 4);
          break;
        case 'copa_libertadores':
          newAchievement.progress = Math.min(totalCorrectGuesses, 50);
          break;
        case 'century_club':
          newAchievement.progress = Math.min(totalCorrectGuesses, 100);
          break;
      }
      
      // Check if achievement was just unlocked
      if (!newAchievement.unlocked && newAchievement.progress >= newAchievement.maxProgress) {
        newAchievement.unlocked = true;
        
        // Show achievement toast
        toast({
          title: `🏆 Conquista Desbloqueada!`,
          description: (
            <div className="space-y-2">
              <div className="font-semibold">{achievement.name}</div>
              <div className="text-sm">{achievement.description}</div>
              {achievement.fluTrivia && (
                <div className="text-xs text-flu-verde italic">{achievement.fluTrivia}</div>
              )}
            </div>
          ),
          duration: 5000,
        });
      }
      
      return newAchievement;
    });
    
    setAchievements(updatedAchievements);
  }, [currentScore, currentStreak, totalCorrectGuesses, toast]);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 space-y-3">
      <h3 className="text-lg font-semibold text-flu-grena mb-4 text-center">
        🏆 Conquistas Tricolores
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-3 rounded-lg border-2 transition-all ${
              achievement.unlocked
                ? 'border-flu-grena bg-flu-grena/10'
                : 'border-gray-200 bg-gray-50 opacity-70'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {achievement.icon}
              <span className={`text-sm font-medium ${
                achievement.unlocked ? 'text-flu-grena' : 'text-gray-600'
              }`}>
                {achievement.name}
              </span>
            </div>
            
            <div className="text-xs text-gray-600 mb-2">
              {achievement.description}
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  achievement.unlocked ? 'bg-flu-grena' : 'bg-flu-verde'
                }`}
                style={{
                  width: `${(achievement.progress / achievement.maxProgress) * 100}%`
                }}
              />
            </div>
            
            <div className="text-xs text-gray-500 mt-1 text-center">
              {achievement.progress}/{achievement.maxProgress}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
