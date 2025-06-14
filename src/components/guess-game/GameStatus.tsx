
import { useState, useEffect } from "react";
import { RankingForm } from "./RankingForm";
import { GameTimer } from "./GameTimer";
import { GameProgress } from "./GameProgress";
import { Timer, Trophy, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GameConfirmDialog } from "./GameConfirmDialog";
import { useGameConfirmations } from "@/hooks/use-game-confirmations";
import { Button } from "@/components/ui/button";

interface GameStatusProps {
  attempts: number;
  maxAttempts: number;
  score: number;
  gameOver: boolean;
  timeRemaining: number;
  onNextPlayer: () => void;
  isTimerRunning?: boolean;
  gamesPlayed?: number;
  currentStreak?: number;
  maxStreak?: number;
}

export const GameStatus = ({ 
  attempts, 
  maxAttempts, 
  score,
  gameOver,
  timeRemaining,
  onNextPlayer,
  isTimerRunning = false,
  gamesPlayed = 0,
  currentStreak = 0,
  maxStreak = 0
}: GameStatusProps) => {
  const [showRankingForm, setShowRankingForm] = useState(false);
  const [prevTime, setPrevTime] = useState(timeRemaining);
  const { toast } = useToast();
  const { confirmation, hideConfirmation, confirmExitGame, confirmNextPlayer } = useGameConfirmations();
  
  // Debug logs detalhados
  console.log('🎮 GameStatus - Score recebido e exibindo:', score);
  console.log('🎮 GameStatus - Game Over:', gameOver);
  console.log('🎮 GameStatus - Time Remaining:', timeRemaining);
  
  // Efeito para alertar quando o tempo estiver acabando
  useEffect(() => {
    if (timeRemaining === 10 && prevTime > 10 && !gameOver) {
      toast({
        variant: "destructive",
        title: "Atenção!",
        description: "Apenas 10 segundos restantes!",
      });
    }
    
    setPrevTime(timeRemaining);
  }, [timeRemaining, prevTime, gameOver, toast]);
  
  const handleShowRankingForm = () => {
    setShowRankingForm(true);
  };
  
  const handleNextPlayer = () => {
    if (score > 0) {
      confirmNextPlayer(() => {
        setShowRankingForm(false);
        onNextPlayer();
      }, score);
    } else {
      setShowRankingForm(false);
      onNextPlayer();
    }
  };

  const handleExitGame = () => {
    confirmExitGame(() => {
      window.location.href = '/';
    });
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Timer destacado no topo */}
        <div className="flex justify-center">
          <GameTimer 
            timeRemaining={timeRemaining}
            isRunning={isTimerRunning}
            gameOver={gameOver}
          />
        </div>

        {/* Progresso do jogo */}
        <GameProgress 
          currentScore={score}
          gamesPlayed={gamesPlayed}
          currentStreak={currentStreak}
          maxStreak={maxStreak}
        />

        {/* Regras do jogo e botão de sair */}
        <div className="flex flex-col gap-3 sm:gap-4 bg-flu-grena/10 p-3 sm:p-4 rounded-lg border border-flu-grena/20">
          <div className="text-xs sm:text-sm font-medium text-flu-grena flex items-center justify-center gap-2 text-center">
            <Timer className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="leading-tight">Uma tentativa por jogador • 60 segundos • 5 pontos por acerto</span>
          </div>
          
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExitGame}
              className="border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              <Home className="w-3 h-3 sm:w-4 sm:h-4" />
              Sair do Jogo
            </Button>
          </div>
        </div>

        {/* Botão de salvar pontuação quando o jogo termina */}
        {gameOver && !showRankingForm && (
          <div className="text-center animate-fade-in">
            <button
              onClick={handleShowRankingForm}
              className="bg-flu-grena text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg hover:opacity-90 transition-all hover:scale-105 flex items-center justify-center gap-2 mx-auto flu-shadow text-sm sm:text-base font-semibold w-full sm:w-auto max-w-xs"
            >
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              Salvar Pontuação
            </button>
          </div>
        )}
        
        {/* Formulário de ranking */}
        {gameOver && showRankingForm && (
          <RankingForm 
            score={score}
            onSaved={handleNextPlayer}
            onCancel={handleNextPlayer}
          />
        )}
      </div>

      <GameConfirmDialog
        open={confirmation.open}
        onClose={hideConfirmation}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        description={confirmation.description}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
      />
    </>
  );
};
