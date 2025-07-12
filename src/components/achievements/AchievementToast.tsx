import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Achievement, ACHIEVEMENTS } from '@/types/achievements';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface AchievementToastProps {
  achievementIds: string[];
  onComplete: () => void;
}

export const AchievementToast = ({ achievementIds, onComplete }: AchievementToastProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const { toast } = useToast();

  const achievements = achievementIds
    .map(id => ACHIEVEMENTS.find(a => a.id === id))
    .filter(Boolean) as Achievement[];

  useEffect(() => {
    if (achievements.length === 0) {
      onComplete();
      return;
    }

    const achievement = achievements[currentIndex];
    
    toast({
      title: "🏆 Conquista Desbloqueada!",
      description: (
        <div className="flex items-center gap-3">
          <span className="text-2xl">{achievement.icon}</span>
          <div>
            <div className="font-semibold">{achievement.name}</div>
            <div className="text-sm text-muted-foreground">{achievement.description}</div>
            <Badge variant={achievement.rarity === 'legendary' ? 'default' : 'secondary'} className="mt-1">
              {achievement.points} pts
            </Badge>
          </div>
        </div>
      ),
      duration: 3000,
    });

    const timer = setTimeout(() => {
      if (currentIndex < achievements.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onComplete();
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [currentIndex, achievements, toast, onComplete]);

  if (achievements.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          className="fixed top-4 right-4 z-50 bg-card border border-border rounded-lg p-4 shadow-lg max-w-sm"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <div className="font-semibold text-lg">Conquista Desbloqueada!</div>
              <div className="text-sm text-muted-foreground">
                {currentIndex + 1} de {achievements.length}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};