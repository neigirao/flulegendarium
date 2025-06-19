
import React from "react";
import { GameTimer } from "./GameTimer";
import { Clock, Target, TrendingUp, Award } from "lucide-react";

interface AdaptiveGameStatusProps {
  timeRemaining: number;
  currentStreak: number;
  gamesPlayed: number;
  maxStreak: number;
  attempts: string[];
  gameActive: boolean;
}

export const AdaptiveGameStatus = ({
  timeRemaining,
  currentStreak,
  gamesPlayed,
  maxStreak,
  attempts,
  gameActive
}: AdaptiveGameStatusProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Timer */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-flu-grena" />
          <span className="text-sm font-medium text-gray-600">Tempo</span>
        </div>
        <GameTimer 
          timeRemaining={timeRemaining} 
          isRunning={gameActive} 
          gameOver={!gameActive}
        />
      </div>

      {/* Current Streak */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-gray-600">Sequência</span>
        </div>
        <div className="text-xl font-bold text-orange-500">{currentStreak}</div>
      </div>

      {/* Max Streak */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-gray-600">Recorde</span>
        </div>
        <div className="text-xl font-bold text-purple-500">{maxStreak}</div>
      </div>

      {/* Games Played */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-flu-verde" />
          <span className="text-sm font-medium text-gray-600">Jogos</span>
        </div>
        <div className="text-xl font-bold text-flu-verde">{gamesPlayed}</div>
      </div>
    </div>
  );
};
