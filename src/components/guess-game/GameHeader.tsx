
import { ArrowLeft, Info, Trophy, Star, Brain, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { GameRulesTooltip } from "./GameRulesTooltip";
import { cn } from "@/lib/utils";
import { DifficultyLevel } from "@/types/guess-game";
import { GameTimer } from "./GameTimer";

interface GameHeaderProps {
  score: number;
  onDebugClick: () => void;
  currentDifficulty?: DifficultyLevel;
  isAdaptiveMode?: boolean;
  timeRemaining?: number;
  gameActive?: boolean;
}

export const GameHeader = ({ score, onDebugClick, currentDifficulty, isAdaptiveMode, timeRemaining, gameActive }: GameHeaderProps) => {
  const getScoreVariant = () => {
    if (score >= 50) return "legendary";
    if (score >= 30) return "excellent";
    if (score >= 15) return "good";
    if (score > 0) return "positive";
    return "zero";
  };

  const variant = getScoreVariant();

  const scoreStyles = {
    legendary: "bg-gradient-to-r from-accent via-destructive to-accent text-accent-foreground shadow-accent/30 animate-pulse",
    excellent: "bg-gradient-to-r from-success to-success/80 text-success-foreground shadow-success/30",
    good: "bg-gradient-to-r from-info to-info/80 text-info-foreground shadow-info/30",
    positive: "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-primary/30",
    zero: "bg-card/90 text-primary border-2 border-primary/30"
  };
  
  return (
    <header className="w-full">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-transparent to-primary/5 rounded-2xl pointer-events-none"></div>
      
      <div className="relative flex items-center justify-between p-3 sm:p-4 md:p-6 gap-3 sm:gap-4">
        
        {/* Botão Voltar otimizado para mobile */}
        <Link
          to="/"
          aria-label="Voltar para a página inicial"
          className="group flex items-center text-primary hover:text-primary/80 transition-all duration-200 shrink-0"
        >
          <div className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-card/80 hover:bg-card/95 border border-primary/20 hover:border-primary/40 transition-all duration-200 hover:shadow-lg backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="hidden xs:inline text-sm sm:text-base font-medium">Voltar</span>
            <span className="xs:hidden text-xs font-medium">Menu</span>
          </div>
        </Link>
        
        {/* Score e Timer lado a lado */}
        <div className="flex-1 flex justify-center gap-4">
          {/* Score */}
          <div 
            data-testid="score-display"
            role="status"
            aria-live="polite"
            aria-label={`Pontuação: ${score} ${score === 1 ? 'ponto' : 'pontos'}`}
            className={cn(
            "relative px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 cursor-default",
            "text-center border backdrop-blur-sm min-w-[120px] sm:min-w-[160px] md:min-w-[180px]",
            scoreStyles[variant]
          )}>
            {/* Indicador de modo adaptativo */}
            {isAdaptiveMode && (
              <div className="absolute -top-2 -left-2 bg-gradient-to-r from-secondary to-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Brain className="w-3 h-3" />
                <span className="hidden sm:inline">ADAPTATIVO</span>
                <span className="sm:hidden">AI</span>
              </div>
            )}

            {/* Efeito de brilho para scores altos */}
            {score >= 30 && (
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-card/20 to-transparent animate-shimmer"></div>
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
              </div>
              
              {score >= 50 && <Star className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-spin" style={{ animationDirection: 'reverse' }} />}
            </div>

            {/* Badge de achievement responsivo */}
            {score >= 50 && (
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-warning text-warning-foreground text-xs font-bold px-1 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-lg animate-bounce">
                <span className="hidden sm:inline">LENDA!</span>
                <span className="sm:hidden">🏆</span>
              </div>
            )}
            {score >= 30 && score < 50 && (
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-success text-success-foreground text-xs font-bold px-1 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-lg">
                <span className="hidden sm:inline">EXPERT!</span>
                <span className="sm:hidden">⭐</span>
              </div>
            )}
            {score >= 15 && score < 30 && (
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-info text-info-foreground text-xs font-bold px-1 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-lg">
                <span className="hidden sm:inline">BOM!</span>
                <span className="sm:hidden">👍</span>
              </div>
            )}
          </div>

          {/* Timer */}
          {timeRemaining !== undefined && (
            <div data-testid="timer-display" className="bg-card/90 backdrop-blur-sm rounded-xl p-4 border border-border shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Tempo</span>
              </div>
              <GameTimer 
                timeRemaining={timeRemaining} 
                isRunning={gameActive || false} 
                gameOver={!gameActive}
              />
            </div>
          )}
        </div>
        
        {/* Controles à direita otimizados */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <GameRulesTooltip />
          <button 
            className="p-2 rounded-full bg-card/70 hover:bg-card/90 border border-border hover:border-border/80 transition-colors cursor-pointer opacity-60 hover:opacity-80 backdrop-blur-sm"
            onClick={onDebugClick}
            aria-label="Informações de Debug"
            title="Informações de Debug"
          >
            <Info className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};