
import { useState, useEffect } from "react";
import { RankingForm } from "./RankingForm";
import { GameTimer } from "./GameTimer";
import { GameProgress } from "./GameProgress";
import { Timer, Trophy, Home, Info, Zap } from "lucide-react";
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
        title: "⏰ Atenção!",
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
      <div className="space-y-6">
        {/* Container principal com melhor visual hierarchy */}
        <div className="bg-gradient-to-br from-flu-grena/5 via-white to-flu-verde/5 rounded-2xl border border-flu-grena/10 shadow-lg overflow-hidden">
          
          {/* Header com timer destacado */}
          <div className="bg-gradient-to-r from-flu-grena to-flu-grena/90 p-4 text-white">
            <div className="flex items-center justify-center gap-3">
              <Timer className="w-5 h-5 animate-pulse" />
              <h3 className="font-bold text-lg">Tempo Restante</h3>
            </div>
          </div>

          {/* Timer centralizado */}
          <div className="p-6 flex justify-center bg-white/50 backdrop-blur-sm">
            <GameTimer 
              timeRemaining={timeRemaining}
              isRunning={isTimerRunning}
              gameOver={gameOver}
            />
          </div>

          {/* Progresso do jogo com visual aprimorado */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2 mb-4 justify-center">
              <Zap className="w-5 h-5 text-flu-verde" />
              <h3 className="font-semibold text-gray-700 text-lg">Seu Progresso</h3>
            </div>
            <GameProgress 
              currentScore={score}
              gamesPlayed={gamesPlayed}
              currentStreak={currentStreak}
              maxStreak={maxStreak}
            />
          </div>

          {/* Regras e informações */}
          <div className="bg-gradient-to-r from-flu-verde/10 to-flu-grena/10 p-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Info className="w-4 h-4 text-flu-grena" />
              <span className="font-medium text-gray-700">Como Jogar</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-sm">
              <div className="bg-white/70 rounded-lg p-3 border border-flu-grena/20">
                <div className="font-semibold text-flu-grena">1 Tentativa</div>
                <div className="text-gray-600">por jogador</div>
              </div>
              <div className="bg-white/70 rounded-lg p-3 border border-flu-verde/20">
                <div className="font-semibold text-flu-verde">60 Segundos</div>
                <div className="text-gray-600">para responder</div>
              </div>
              <div className="bg-white/70 rounded-lg p-3 border border-orange-300">
                <div className="font-semibold text-orange-600">5 Pontos</div>
                <div className="text-gray-600">por acerto</div>
              </div>
            </div>
          </div>

          {/* Botão de sair com visual melhorado */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExitGame}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200 flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
              >
                <Home className="w-4 h-4" />
                Sair do Jogo
              </Button>
            </div>
          </div>
        </div>

        {/* Botão de salvar pontuação com animação */}
        {gameOver && !showRankingForm && (
          <div className="text-center animate-fadeIn">
            <button
              onClick={handleShowRankingForm}
              className="bg-gradient-to-r from-flu-grena to-flu-grena/90 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 mx-auto flu-shadow font-bold text-lg w-full sm:w-auto max-w-sm group"
            >
              <Trophy className="w-6 h-6 group-hover:animate-bounce" />
              Salvar Pontuação
              <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
            </button>
          </div>
        )}
        
        {/* Formulário de ranking com transição suave */}
        {gameOver && showRankingForm && (
          <div className="animate-fadeIn">
            <RankingForm 
              score={score}
              onSaved={handleNextPlayer}
              onCancel={handleNextPlayer}
            />
          </div>
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
