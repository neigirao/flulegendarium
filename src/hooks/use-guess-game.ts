
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types/guess-game";
import { usePlayerSelection } from "./use-player-selection";
import { useGameTimer, TIME_LIMIT_SECONDS } from "./use-game-timer";
import { useTabVisibility } from "./use-tab-visibility";
import { processPlayerName, isCorrectGuess } from "@/utils/name-processor";
import { useAnalytics } from "./use-analytics";
import { useAchievements } from "./use-achievements";
import { useAuth } from "./useAuth";

export const MAX_ATTEMPTS = 1;

export const useGuessGame = (players: Player[] | undefined) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { trackEvent, trackCorrectGuess, trackIncorrectGuess } = useAnalytics();
  const { checkAndUnlockAchievements } = useAchievements();
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isProcessingGuess, setIsProcessingGuess] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  
  // Player selection hook
  const { currentPlayer, selectRandomPlayer, handlePlayerImageFixed } = usePlayerSelection(players);
  
  // Handle time up callback
  const handleTimeUp = useCallback(() => {
    if (!gameOver && currentPlayer && gameActive) {
      console.log('⏰ Tempo esgotado para:', currentPlayer.name);
      console.log('🎯 Score final por tempo:', score);
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
      setCurrentStreak(0);
      
      trackEvent({
        action: 'game_timeout',
        category: 'Game',
        label: currentPlayer.name
      });
      
      toast({
        variant: "destructive",
        title: "Tempo esgotado!",
        description: `O jogador era ${currentPlayer.name}. Pontuação final: ${score}`,
      });
    }
  }, [currentPlayer, gameOver, score, toast, trackEvent, gameActive]);

  // Handle tab change callback
  const handleTabChange = useCallback(() => {
    if (gameActive && !gameOver) {
      console.log('🚫 Jogo encerrado por mudança de aba');
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
      setCurrentStreak(0);
      
      trackEvent({
        action: 'game_tab_change',
        category: 'Game',
        label: 'tab_switch_violation'
      });
    }
  }, [gameActive, gameOver, trackEvent]);
  
  // Tab visibility hook
  useTabVisibility({ 
    onTabChange: handleTabChange, 
    isGameActive: gameActive 
  });
  
  // Game timer hook
  const { timeRemaining, isRunning, startTimer, stopTimer } = useGameTimer(gameOver, handleTimeUp);

  // Start timer when a new player is selected and ready
  const startGameForPlayer = useCallback(() => {
    if (currentPlayer && !gameOver && !isRunning) {
      console.log('🎮 Iniciando jogo para novo jogador:', currentPlayer.name);
      console.log('🎯 Score atual ao iniciar:', score);
      
      // Reset states for new player (but keep the score)
      setAttempts(0);
      setGameOver(false);
      setHasLost(false);
      setGameActive(true);
      setGameStartTime(Date.now());
      
      // Start timer
      startTimer();
      
      trackEvent({
        action: 'new_player_shown',
        category: 'Game',
        label: currentPlayer.name
      });
    }
  }, [currentPlayer, gameOver, isRunning, startTimer, trackEvent, score]);

  // Reset score function - zera a pontuação completamente
  const resetScore = useCallback(() => {
    console.log('🎯 Resetando pontuação de', score, 'para 0');
    setScore(0);
    setCurrentStreak(0);
    setGamesPlayed(0);
    setGameActive(false);
  }, [score]);

  // Handle guess submission
  const handleGuess = useCallback(async (guess: string) => {
    if (!currentPlayer || !guess || gameOver || isProcessingGuess || !gameActive) return;
    
    console.log('🎮 Processando palpite:', guess, 'para jogador:', currentPlayer.name);
    console.log('🎯 Score antes do palpite:', score);
    setIsProcessingGuess(true);
    
    const timeToAnswer = gameStartTime ? (Date.now() - gameStartTime) / 1000 : undefined;
    
    try {
      const processingResult = await processPlayerName(guess, currentPlayer.name, currentPlayer.id);
      
      let isCorrect = false;
      
      if (processingResult.processedName) {
        isCorrect = processingResult.processedName.toLowerCase() === currentPlayer.name.toLowerCase();
      }
      
      if (!isCorrect) {
        isCorrect = isCorrectGuess(guess, currentPlayer.name);
      }
      
      if (isCorrect) {
        const points = 5;
        const newScore = score + points;
        const newStreak = currentStreak + 1;
        const newGamesPlayed = gamesPlayed + 1;
        
        console.log('🎯 ACERTOU! Score anterior:', score, '+ pontos:', points, '= novo score:', newScore);
        
        // Update score and streak
        setScore(newScore);
        setCurrentStreak(newStreak);
        setGamesPlayed(newGamesPlayed);
        
        // Check for achievements (only for authenticated users)
        if (user) {
          const accuracy = (newGamesPlayed > 0) ? (newGamesPlayed / newGamesPlayed) * 100 : 100; // 100% since they got it right
          await checkAndUnlockAchievements({
            score: newScore,
            streak: newStreak,
            gamesPlayed: newGamesPlayed,
            accuracy,
            timeToAnswer
          });
        }
        
        trackCorrectGuess(currentPlayer.name);
        trackEvent({
          action: 'points_earned',
          category: 'Game',
          label: currentPlayer.name,
          value: points
        });
        
        toast({
          title: "Parabéns!",
          description: `Você acertou e ganhou ${points} pontos! Total: ${newScore}`,
        });
        
        stopTimer();
        setGameActive(false);
        
        // Delay para mostrar a pontuação antes de selecionar novo jogador
        setTimeout(() => {
          console.log('🔄 Selecionando próximo jogador após acerto. Score atual:', newScore);
          selectRandomPlayer();
        }, 2000);
      } else {
        console.log('❌ ERROU! Resposta:', guess, 'Esperado:', currentPlayer.name);
        console.log('🎯 Score final por erro:', score);
        setGameOver(true);
        setHasLost(true);
        setGameActive(false);
        setCurrentStreak(0);
        
        trackIncorrectGuess(currentPlayer.name, guess);
        
        stopTimer();
        
        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `O jogador era ${currentPlayer.name}. Pontuação final: ${score}`,
        });
      }
    } catch (error) {
      console.error("Erro ao processar palpite:", error);
      
      // Fallback check
      if (isCorrectGuess(guess, currentPlayer.name)) {
        const points = 5;
        const newScore = score + points;
        const newStreak = currentStreak + 1;
        const newGamesPlayed = gamesPlayed + 1;
        
        console.log('🎯 ACERTOU (fallback)! Score anterior:', score, '+ pontos:', points, '= novo score:', newScore);
        
        setScore(newScore);
        setCurrentStreak(newStreak);
        setGamesPlayed(newGamesPlayed);
        
        // Check for achievements (only for authenticated users)
        if (user) {
          const accuracy = (newGamesPlayed > 0) ? (newGamesPlayed / newGamesPlayed) * 100 : 100;
          await checkAndUnlockAchievements({
            score: newScore,
            streak: newStreak,
            gamesPlayed: newGamesPlayed,
            accuracy,
            timeToAnswer
          });
        }
        
        trackCorrectGuess(currentPlayer.name);
        
        toast({
          title: "Parabéns!",
          description: `Você acertou e ganhou ${points} pontos! Total: ${newScore}`,
        });
        
        stopTimer();
        setGameActive(false);
        setTimeout(() => {
          selectRandomPlayer();
        }, 2000);
      } else {
        console.log('❌ ERROU (fallback)! Score final:', score);
        setGameOver(true);
        setHasLost(true);
        setGameActive(false);
        setCurrentStreak(0);
        stopTimer();
        
        trackIncorrectGuess(currentPlayer.name, guess);
        
        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `O jogador era ${currentPlayer.name}. Pontuação final: ${score}`,
        });
      }
    } finally {
      setIsProcessingGuess(false);
    }
  }, [currentPlayer, gameOver, stopTimer, selectRandomPlayer, toast, isProcessingGuess, trackCorrectGuess, trackIncorrectGuess, trackEvent, score, gameActive, currentStreak, gamesPlayed, gameStartTime, user, checkAndUnlockAchievements]);

  // Debug logs detalhados para rastrear o estado
  useEffect(() => {
    console.log('🎮 useGuessGame State Update:');
    console.log('- Current Player:', currentPlayer?.name);
    console.log('- Score:', score);
    console.log('- Current Streak:', currentStreak);
    console.log('- Games Played:', gamesPlayed);
    console.log('- Time Remaining:', timeRemaining);
    console.log('- Game Over:', gameOver);
    console.log('- Timer Running:', isRunning);
    console.log('- Game Active:', gameActive);
  }, [currentPlayer, score, currentStreak, gamesPlayed, timeRemaining, gameOver, isRunning, gameActive]);

  return {
    currentPlayer,
    attempts,
    score,
    gameOver,
    timeRemaining,
    MAX_ATTEMPTS,
    handleGuess,
    selectRandomPlayer,
    handlePlayerImageFixed,
    isProcessingGuess,
    TIME_LIMIT_SECONDS,
    hasLost,
    startGameForPlayer,
    isTimerRunning: isRunning,
    resetScore
  };
};
