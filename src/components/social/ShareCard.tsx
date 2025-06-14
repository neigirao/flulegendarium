
import { Trophy, Star, Target, Clock } from 'lucide-react';
import { Achievement } from "@/types/achievements";

interface ShareCardProps {
  score: number;
  correctGuesses: number;
  gameMode?: string;
  streak?: number;
  achievements?: Achievement[];
  playerName?: string;
}

export const ShareCard = ({ 
  score, 
  correctGuesses, 
  gameMode = "Clássico",
  streak = 0,
  achievements = [],
  playerName
}: ShareCardProps) => {
  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-flu-grena via-flu-grena/90 to-flu-verde p-6 rounded-2xl text-white shadow-2xl relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 text-6xl">⚽</div>
        <div className="absolute bottom-4 left-4 text-4xl">🏆</div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-5">💚</div>
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img 
            src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
            alt="Fluminense FC" 
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-2xl font-bold">Lendas do Flu</h1>
        </div>
        <p className="text-white/80 text-sm">Quiz dos Ídolos Tricolores</p>
      </div>

      {/* Main Stats */}
      <div className="relative z-10 text-center mb-6">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
          <div className="text-4xl font-bold mb-1">{score}</div>
          <div className="text-sm text-white/90">pontos no modo {gameMode}</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-lg font-semibold">{correctGuesses}</span>
            </div>
            <div className="text-xs text-white/80">acertos</div>
          </div>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-lg font-semibold">{streak}</span>
            </div>
            <div className="text-xs text-white/80">sequência</div>
          </div>
        </div>
      </div>

      {/* Achievement Highlight */}
      {achievements.length > 0 && (
        <div className="relative z-10 mb-4">
          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-lg p-3 border border-yellow-400/30">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium text-yellow-100">Nova Conquista!</span>
            </div>
            <div className="text-sm text-white/90">{achievements[0].name}: {achievements[0].description}</div>
          </div>
        </div>
      )}

      {/* Last Player */}
      {playerName && (
        <div className="relative z-10 text-center mb-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
            <div className="text-xs text-white/70 mb-1">Último jogador:</div>
            <div className="text-sm font-medium">{playerName}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10 text-center">
        <div className="text-xs text-white/60 mb-2">Teste seus conhecimentos tricolores!</div>
        <div className="text-xs text-white/80 font-medium">flulegendarium.lovable.app</div>
      </div>
    </div>
  );
};
