
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DifficultyChangeInfo } from "@/types/guess-game";
import { TrendingUp, TrendingDown, Award, Target } from "lucide-react";

interface AdaptiveProgressionNotificationProps {
  changeInfo: DifficultyChangeInfo;
  onClose: () => void;
}

export const AdaptiveProgressionNotification = ({
  changeInfo,
  onClose
}: AdaptiveProgressionNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const isLevelUp = changeInfo.direction === 'up';
  const Icon = isLevelUp ? TrendingUp : TrendingDown;
  
  const bgColor = isLevelUp ? 'bg-green-500' : 'bg-orange-500';
  const textColor = 'text-white';

  const getMessage = () => {
    if (isLevelUp) {
      return `Parabéns! Você evoluiu para o nível ${changeInfo.newLevel.replace('_', ' ')}!`;
    } else {
      return `Ajustando dificuldade para ${changeInfo.newLevel.replace('_', ' ')}`;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className={`${bgColor} ${textColor} px-6 py-4 rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {isLevelUp ? '🎉 Nível Superior!' : '🎯 Ajuste de Dificuldade'}
                </h3>
                <p className="text-sm opacity-90">
                  {getMessage()}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  Baseado em sua performance: {changeInfo.reason}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
