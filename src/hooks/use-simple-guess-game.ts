
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types/guess-game";
import { useSimpleGameTimer, TIME_LIMIT_SECONDS } from "./use-simple-game-timer";
import { useTabVisibility } from "./use-tab-visibility";
import { usePlayerSelection } from "./use-player-selection";
import { useGameSession } from "./use-game-session";
import { useGameScore } from "./use-game-score";
import { useSimpleGameLogic } from "./use-simple-game-logic";

export const useSimpleGuessGame = (players: Player[] | undefined) => {
  const { toast } = useToast();
  
  // Estados básicos do jogo
  const [gameOver, setGameOver] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [gameActive, setGameActive] = useState(false);

  // Hooks compostos
  const { currentPlayer, selectRandomPlayer, handlePlayerImageFixed } = usePlayerSelection(players);
  const { sessionId, registerGameStart, resetSession } = useGameSession();
  const { score, currentStreak, gamesPlayed, maxStreak, addScore, resetStreak, resetAll } = useGameScore();

  // Callback para quando o tempo acabar
  const handleTimeUp = useCallback(() => {
    if (!gameOver && currentPlayer && gameActive) {
      console.log('⏰ Tempo esgotado para:', currentPlayer.name);
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
      resetStreak();
      
      toast({
        variant: "destructive",
        title: "Tempo esgotado!",
        description: `O jogador era ${currentPlayer.name}. Pontuação final: ${score}`,
      });
    }
  }, [currentPlayer, gameOver, score, toast, gameActive, resetStreak]);

  // Callback para mudança de aba
  const handleTabChange = useCallback(() => {
    if (gameActive && !gameOver) {
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
      resetStreak();
    }
  }, [gameActive, gameOver, resetStreak]);
  
  // Hook de visibilidade da aba
  useTabVisibility({ 
    onTabChange: handleTabChange, 
    isGameActive: gameActive 
  });
  
  // Hook do timer
  const { timeRemaining, isRunning, startTimer, stopTimer, resetTimer } = useSimpleGameTimer(handleTimeUp);

  // Callbacks para a lógica do jogo
  const handleCorrectGuess = useCallback((points: number) => {
    console.log('✅ Resposta correta! Pontos:', points);
    addScore(points);
    stopTimer();
  }, [addScore, stopTimer]);

  const handleIncorrectGuess = useCallback(() => {
    console.log('❌ Resposta incorreta!');
    setGameOver(true);
    setHasLost(true);
    setGameActive(false);
    resetStreak();
    stopTimer();
  }, [resetStreak, stopTimer]);

  const handleNextPlayer = useCallback(() => {
    console.log('🔄 Indo para próximo jogador...');
    selectRandomPlayer();
  }, [selectRandomPlayer]);

  // Hook da lógica do jogo
  const { handleGuess, isProcessing } = useSimpleGameLogic({
    currentPlayer,
    onCorrectGuess: handleCorrectGuess,
    onIncorrectGuess: handleIncorrectGuess,
    onNextPlayer: handleNextPlayer
  });

  // Iniciar jogo quando há um jogador atual
  const startGameForPlayer = useCallback(async () => {
    if (currentPlayer && !gameOver) {
      console.log('🎮 Iniciando jogo para:', currentPlayer.name);
      
      setGameOver(false);
      setHasLost(false);
      setGameActive(true);
      
      // Registrar início do jogo se necessário
      if (!sessionId) {
        await registerGameStart();
      }
      
      // Iniciar timer após um breve delay
      setTimeout(() => {
        resetTimer();
        startTimer();
      }, 500);
    }
  }, [currentPlayer, gameOver, sessionId, registerGameStart, resetTimer, startTimer]);

  // Effect para iniciar jogo quando jogador muda
  useEffect(() => {
    if (currentPlayer) {
      console.log('🔄 Novo jogador detectado:', currentPlayer.name);
      startGameForPlayer();
    }
  }, [currentPlayer, startGameForPlayer]);

  // Função para resetar pontuação
  const resetScore = useCallback(() => {
    console.log('🎯 Resetando pontuação');
    resetAll();
    setGameActive(false);
    resetSession();
  }, [resetAll, resetSession]);

  return {
    // Estado do jogo
    currentPlayer,
    score,
    gameOver,
    hasLost,
    gameActive,
    
    // Timer
    timeRemaining,
    isTimerRunning: isRunning,
    TIME_LIMIT_SECONDS,
    
    // Estatísticas
    gamesPlayed,
    currentStreak,
    maxStreak,
    
    // Ações
    handleGuess,
    selectRandomPlayer,
    handlePlayerImageFixed,
    startGameForPlayer,
    resetScore,
    
    // Estados de carregamento
    isProcessingGuess: isProcessing,
    
    // Constantes
    attempts: 0,
    MAX_ATTEMPTS: 1
  };
};
