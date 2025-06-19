
import { ArrowLeft, Info, Trophy, Star, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { GameRulesTooltip } from "./GameRulesTooltip";
import { cn } from "@/lib/utils";
import { DifficultyLevel } from "@/types/guess-game";

interface GameHeaderProps {
  score: number;
  onDebugClick: () => void;
  currentDifficulty?: DifficultyLevel;
  isAdaptiveMode?: boolean;
}

export const GameHeader = ({ score, onDebugClick, currentDifficulty, isAdaptiveMode }: GameHeaderProps) => {
  console.log('🎮 GameHeader - Score recebido e exibindo:', score);
  
  const getScoreVariant = () => {
    if (score >= 50) return "legendary";
    if (score >= 30) return "excellent";
    if (score >= 15) return "good";
    if (score > 0) return "positive";
    return "zero";
  };

  const variant = getScoreVariant();

  const scoreStyles = {
    legendary: "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white shadow-purple-300 animate-pulse",
    excellent: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-300",
    good: "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-blue-300",
    positive: "bg-gradient-to-r from-flu-grena to-flu-grena/90 text-white shadow-flu-grena/30",
    zero: "bg-white/90 text-flu-grena border-2 border-flu-grena/30"
  };
  
  return (
    <header className="w-full">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-r from-flu-verde/5 via-transparent to-flu-grena/5 rounded-2xl pointer-events-none"></div>
      
      <div className="relative flex items-center justify-between p-3 sm:p-4 md:p-6 gap-3 sm:gap-4">
        
        {/* Botão Voltar otimizado para mobile */}
        <Link
          to="/"
          className="group flex items-center text-flu-grena hover:text-flu-grena/80 transition-all duration-200 shrink-0"
        >
          <div className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-white/80 hover:bg-white/95 border border-flu-grena/20 hover:border-flu-grena/40 transition-all duration-200 hover:shadow-lg backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="hidden xs:inline text-sm sm:text-base font-medium">Voltar</span>
            <span className="xs:hidden text-xs font-medium">Menu</span>
          </div>
        </Link>
        
        {/* Score principal centralizado e responsivo com indicador de modo */}
        <div className="flex-1 flex justify-center">
          <div className={cn(
            "relative px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 cursor-default",
            "text-center border backdrop-blur-sm min-w-[120px] sm:min-w-[160px] md:min-w-[180px]",
            scoreStyles[variant]
          )}>
            {/* Indicador de modo adaptativo */}
            {isAdaptiveMode && (
              <div className="absolute -top-2 -left-2 bg-gradient-to-r from-flu-verde to-flu-grena text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Brain className="w-3 h-3" />
                <span className="hidden sm:inline">ADAPTATIVO</span>
                <span className="sm:hidden">AI</span>
              </div>
            )}

            {/* Efeito de brilho para scores altos */}
            {score >= 30 && (
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            )}
            
            <div className="relative z-10 flex items-center justify-center gap-1 sm:gap-2">
              {score >= 50 && <Star className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-spin" />}
              {score >= 30 && score < 50 && <Trophy className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />}
              
              <div className="flex flex-col items-center">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tabular-nums leading-tight">
                  {score}
                </span>
                <span className="text-xs sm:text-sm opacity-90 font-medium leading-tight">
                  {score === 1 ? "ponto" : "pontos"}
                </span>
                {currentDifficulty && (
                  <span className="text-xs opacity-75 leading-tight hidden sm:block">
                    {currentDifficulty.replace('_', ' ')}
                  </span>
                )}
              </div>
              
              {score >= 50 && <Star className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-spin" style={{ animationDirection: 'reverse' }} />}
            </div>

            {/* Badge de achievement responsivo */}
            {score >= 50 && (
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-1 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-lg animate-bounce">
                <span className="hidden sm:inline">LENDA!</span>
                <span className="sm:hidden">🏆</span>
              </div>
            )}
            {score >= 30 && score < 50 && (
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-green-400 text-green-900 text-xs font-bold px-1 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-lg">
                <span className="hidden sm:inline">EXPERT!</span>
                <span className="sm:hidden">⭐</span>
              </div>
            )}
            {score >= 15 && score < 30 && (
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-blue-400 text-blue-900 text-xs font-bold px-1 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-lg">
                <span className="hidden sm:inline">BOM!</span>
                <span className="sm:hidden">👍</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Controles à direita otimizados */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <GameRulesTooltip />
          <div 
            className="p-2 rounded-full bg-white/70 hover:bg-white/90 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer opacity-60 hover:opacity-80 backdrop-blur-sm"
            onClick={onDebugClick}
            title="Informações de Debug"
          >
            <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  );
};
