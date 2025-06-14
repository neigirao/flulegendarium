
import { Trophy, Target, Zap, TrendingUp } from "lucide-react";

interface GameProgressProps {
  currentScore: number;
  gamesPlayed?: number;
  currentStreak?: number;
  maxStreak?: number;
}

export const GameProgress = ({
  currentScore,
  gamesPlayed = 0,
  currentStreak = 0,
  maxStreak = 0
}: GameProgressProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Pontuação Atual */}
      <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-flu-grena/20 shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-flu-grena" />
          <span className="text-xs sm:text-sm font-medium text-gray-600">Pontos</span>
        </div>
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-flu-grena text-center tabular-nums">
          {currentScore}
        </div>
      </div>

      {/* Jogos Disputados */}
      <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-flu-verde/20 shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-flu-verde" />
          <span className="text-xs sm:text-sm font-medium text-gray-600">Jogos</span>
        </div>
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-flu-verde text-center tabular-nums">
          {gamesPlayed}
        </div>
      </div>

      {/* Sequência Atual */}
      <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-orange-200 shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
          <span className="text-xs sm:text-sm font-medium text-gray-600">Sequência</span>
        </div>
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-500 text-center tabular-nums">
          {currentStreak}
        </div>
      </div>

      {/* Melhor Sequência */}
      <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-purple-200 shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
          <span className="text-xs sm:text-sm font-medium text-gray-600">Recorde</span>
        </div>
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-500 text-center tabular-nums">
          {maxStreak}
        </div>
      </div>
    </div>
  );
};
