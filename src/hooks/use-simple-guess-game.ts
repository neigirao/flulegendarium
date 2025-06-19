
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types/guess-game";
import { useSimplePlayerSelection } from "./use-simple-player-selection";
import { useAuth } from "./useAuth";
import { isCorrectGuess } from "@/utils/name-processor";

export const MAX_ATTEMPTS = 1;
export const TIME_LIMIT_SECONDS = 60;

export const useSimpleGuessGame = (players: Player[] | undefined) => {
  console.log("🎮 useSimpleGuessGame iniciando com:", {
    playersCount: players?.length || 0
  });

  const { toast } = useToast();
  const { user } = useAuth();
  
  // Verificação simples dos jogadores
  const validPlayers = players && Array.isArray(players) && players.length > 0 ? players : [];
  
  if (validPlayers.length === 0) {
    console.log("⚠️ Sem jogadores válidos disponíveis");
    return null;
  }

  // Estados do jogo
  const [gameOver, setGameOver] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [isProcessingGuess, setIsProcessingGuess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Timer
  const timerRef = useRef<number | null>(null);

  // Seleção de jogador
  const { currentPlayer, selectRandomPlayer } = useSimplePlayerSelection(validPlayers);

  // Iniciar timer
  const startTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    
    setTimeRemaining(TIME_LIMIT_SECONDS);
    setIsTimerRunning(true);
    
    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setGameOver(true);
          setHasLost(true);
          setGameActive(false);
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Parar timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTimerRunning(false);
  }, []);

  // Processar palpite
  const handleGuess = useCallback(async (guess: string) => {
    if (!currentPlayer || !guess.trim() || isProcessingGuess || gameOver) {
      return;
    }

    console.log('🎮 Processando palpite:', guess, 'para:', currentPlayer.name);
    setIsProcessingGuess(true);

    try {
      const isCorrect = isCorrectGuess(guess, currentPlayer.name);
      
      if (isCorrect) {
        console.log('🎯 ACERTOU!');
        const points = 5;
        
        stopTimer();
        setScore(prev => prev + points);
        setCurrentStreak(prev => prev + 1);
        setGamesPlayed(prev => prev + 1);
        
        toast({
          title: "Parabéns!",
          description: `Você acertou! +${points} pontos`,
        });
        
        // Próximo jogador após delay
        setTimeout(() => {
          selectRandomPlayer();
          setIsProcessingGuess(false);
          startTimer();
        }, 1500);
        
      } else {
        console.log('❌ ERROU!');
        
        stopTimer();
        setGameOver(true);
        setHasLost(true);
        setGameActive(false);
        setCurrentStreak(0);
        
        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `O jogador era ${currentPlayer.name}.`,
        });
        
        setIsProcessingGuess(false);
      }
    } catch (error) {
      console.error("Erro ao processar palpite:", error);
      setIsProcessingGuess(false);
    }
  }, [currentPlayer, isProcessingGuess, gameOver, toast, stopTimer, selectRandomPlayer, startTimer]);

  // Iniciar jogo para jogador
  const startGameForPlayer = useCallback(() => {
    if (currentPlayer && !gameOver) {
      console.log('🎮 Iniciando jogo para:', currentPlayer.name);
      setGameOver(false);
      setHasLost(false);
      setGameActive(true);
      startTimer();
    }
  }, [currentPlayer, gameOver, startTimer]);

  // Reset score
  const resetScore = useCallback(() => {
    setScore(0);
    setCurrentStreak(0);
    setGamesPlayed(0);
    setGameActive(false);
    stopTimer();
  }, [stopTimer]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  // Auto start quando jogador muda
  useEffect(() => {
    if (currentPlayer && !gameOver) {
      startGameForPlayer();
    }
  }, [currentPlayer, gameOver, startGameForPlayer]);

  const result = {
    currentPlayer,
    gameKey: Date.now(),
    attempts: [],
    score,
    gameOver,
    timeRemaining,
    MAX_ATTEMPTS,
    handleGuess,
    selectRandomPlayer,
    forceRefresh: selectRandomPlayer,
    handlePlayerImageFixed: () => {},
    isProcessingGuess,
    TIME_LIMIT_SECONDS,
    hasLost,
    startGameForPlayer,
    isTimerRunning,
    resetScore,
    gamesPlayed,
    currentStreak,
    maxStreak: Math.max(currentStreak, 0),
    playerChangeCount: 1
  };

  console.log("🎮 useSimpleGuessGame resultado:", {
    hasCurrentPlayer: !!result.currentPlayer,
    currentPlayerName: result.currentPlayer?.name
  });

  return result;
};
