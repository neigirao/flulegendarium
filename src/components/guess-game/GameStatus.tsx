
import { useState, useEffect, memo, useMemo, useCallback } from "react";
import { RankingForm } from "./RankingForm";
import { GameTimer } from "./GameTimer";
import { GameProgress } from "./GameProgress";
import { Timer, Trophy, Home, Info, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GameConfirmDialog } from "./GameConfirmDialog";
import { useGameConfirmations } from "@/hooks/game";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";

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

const GameRulesInfo = memo(() => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-sm">
    <div className="bg-background/70 rounded-lg p-3 border border-primary/20">
      <div className="font-semibold text-primary">1 Tentativa</div>
      <div className="text-muted-foreground">por jogador</div>
    </div>
    <div className="bg-background/70 rounded-lg p-3 border border-secondary/20">
      <div className="font-semibold text-secondary">60 Segundos</div>
      <div className="text-muted-foreground">para responder</div>
    </div>
    <div className="bg-background/70 rounded-lg p-3 border border-warning/30">
      <div className="font-semibold text-warning">5 Pontos</div>
      <div className="text-muted-foreground">por acerto</div>
    </div>
  </div>
));

GameRulesInfo.displayName = 'GameRulesInfo';

const SaveScoreButton = memo(({ onShowRankingForm }: { onShowRankingForm: () => void }) => (
  <div className="text-center animate-fadeIn">
    <button
      onClick={onShowRankingForm}
      className="bg-gradient-to-r from-flu-grena to-flu-grena/90 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 mx-auto flu-shadow font-bold text-lg w-full sm:w-auto max-w-sm group"
    >
      <Trophy className="w-6 h-6 group-hover:animate-bounce" />
      Salvar Pontuação
      <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
    </button>
  </div>
));

SaveScoreButton.displayName = 'SaveScoreButton';

export const GameStatus = memo(({ 
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
  const { confirmation, hideConfirmation, confirmExitGame } = useGameConfirmations();
  
  logger.debug('GameStatus render', 'UI', { score, gameOver, timeRemaining });
  
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
  
  const handleShowRankingForm = useCallback(() => {
    setShowRankingForm(true);
  }, []);
  
  const handleAfterSave = useCallback(() => {
    window.location.href = '/';
  }, []);

  const handleExitGame = useCallback(() => {
    confirmExitGame(() => {
      window.location.href = '/';
    });
  }, [confirmExitGame]);

  const shouldShowSaveButton = useMemo(() => 
    gameOver && !showRankingForm, 
    [gameOver, showRankingForm]
  );

  const shouldShowRankingForm = useMemo(() => 
    gameOver && showRankingForm, 
    [gameOver, showRankingForm]
  );

  return (
    <>
      <div className="space-y-6" data-testid="game-status">
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
          <div className="p-6 bg-gradient-to-r from-muted to-background">
            <div className="flex items-center gap-2 mb-4 justify-center">
              <Zap className="w-5 h-5 text-secondary" />
              <h3 className="font-semibold text-foreground text-lg">Seu Progresso</h3>
            </div>
            <div data-testid="game-score">
              <GameProgress 
                currentScore={score}
                gamesPlayed={gamesPlayed}
                currentStreak={currentStreak}
                maxStreak={maxStreak}
              />
            </div>
          </div>

          {/* Regras e informações */}
          <div className="bg-gradient-to-r from-secondary/10 to-primary/10 p-4 border-t border-border">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Info className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">Como Jogar</span>
            </div>
            
            <GameRulesInfo />
          </div>

          {/* Botão de sair com visual melhorado - só mostra quando o jogo não acabou */}
          {!gameOver && (
            <div className="p-4 bg-background border-t border-border">
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExitGame}
                  className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/40 transition-all duration-200 flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
                >
                  <Home className="w-4 h-4" />
                  Sair do Jogo
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Botão de salvar pontuação com animação - só quando o jogo acabar */}
        {shouldShowSaveButton && (
          <SaveScoreButton onShowRankingForm={handleShowRankingForm} />
        )}
        
        {/* Formulário de ranking com transição suave */}
        {shouldShowRankingForm && (
          <div className="animate-fadeIn">
            <RankingForm 
              score={score}
              onSaved={handleAfterSave}
              onCancel={handleAfterSave}
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
});

GameStatus.displayName = 'GameStatus';
