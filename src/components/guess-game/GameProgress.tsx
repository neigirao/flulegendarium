
import { Trophy, Target, TrendingUp } from "lucide-react";

interface GameProgressProps {
  currentScore: number;
  gamesPlayed: number;
  currentStreak: number;
  maxStreak: number;
}

export const GameProgress = ({ 
  currentScore, 
  gamesPlayed, 
  currentStreak, 
  maxStreak 
}: GameProgressProps) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border-2 border-flu-verde/20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Pontuação atual */}
        <div className="flex items-center gap-2 bg-yellow-50 p-3 rounded-lg">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="text-xs text-gray-600">Pontos</p>
            <p className="font-bold text-lg text-flu-grena">{currentScore}</p>
          </div>
        </div>

        {/* Jogos jogados */}
        <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
          <Target className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-xs text-gray-600">Jogadores</p>
            <p className="font-bold text-lg text-flu-verde">{gamesPlayed}</p>
          </div>
        </div>

        {/* Sequência atual */}
        <div className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-xs text-gray-600">Sequência</p>
            <p className="font-bold text-lg text-green-700">{currentStreak}</p>
          </div>
        </div>

        {/* Melhor sequência */}
        <div className="flex items-center gap-2 bg-purple-50 p-3 rounded-lg">
          <Trophy className="w-5 h-5 text-purple-600" />
          <div>
            <p className="text-xs text-gray-600">Recorde</p>
            <p className="font-bold text-lg text-purple-700">{Math.max(maxStreak, currentStreak)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
