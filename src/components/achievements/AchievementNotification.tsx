
import { Achievement } from "@/types/achievements";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementNotification = ({ achievement, onClose }: AchievementNotificationProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (achievement) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  const getRarityConfig = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': 
        return {
          bgColor: 'from-neutral-500 to-neutral-600',
          sparkleColor: 'text-neutral-300',
          borderColor: 'border-neutral-400'
        };
      case 'rare': 
        return {
          bgColor: 'from-info to-info/80',
          sparkleColor: 'text-info-light',
          borderColor: 'border-info'
        };
      case 'epic': 
        return {
          bgColor: 'from-accent to-accent/80',
          sparkleColor: 'text-accent/50',
          borderColor: 'border-accent'
        };
      case 'legendary': 
        return {
          bgColor: 'from-warning via-warning to-warning/80',
          sparkleColor: 'text-warning-light',
          borderColor: 'border-warning'
        };
    }
  };

  if (!achievement) return null;

  const config = getRarityConfig(achievement.rarity);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            damping: 15, 
            stiffness: 300 
          }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-none"
        >
          <div className={cn(
            "relative overflow-hidden rounded-xl border-2 shadow-2xl backdrop-blur-sm",
            "bg-gradient-to-r text-white p-6 min-w-[320px] max-w-[400px]",
            config.bgColor,
            config.borderColor
          )}>
            {/* Background sparkles effect */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className={cn("absolute", config.sparkleColor)}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                </motion.div>
              ))}
            </div>

            {/* Main content */}
            <div className="relative z-10 flex items-center gap-4">
              {/* Icon */}
              <motion.div
                className="text-5xl"
                animate={{ 
                  rotateY: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                {achievement.icon}
              </motion.div>

              {/* Text content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-5 h-5" />
                  <span className="text-lg font-bold">Conquista Desbloqueada!</span>
                </div>
                
                <h3 className="text-xl font-bold mb-1">
                  {achievement.name}
                </h3>
                
                <p className="text-sm opacity-90 mb-2">
                  {achievement.description}
                </p>

                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                    {achievement.rarity.toUpperCase()}
                  </div>
                  
                  {achievement.points > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4" />
                      <span>+{achievement.points} pontos</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar animation */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-white/30"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 4, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
