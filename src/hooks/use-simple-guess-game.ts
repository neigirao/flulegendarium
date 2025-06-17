
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types/guess-game";
import { isCorrectGuess } from "@/utils/name-processor";

export const useSimpleGuessGame = (players: Player[] | undefined) => {
  const { toast } = useToast();
  
  // Estado básico do jogo
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isProcessingGuess, setIsProcessingGuess] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  // Constantes
  const MAX_ATTEMPTS = 1;
  const TIME_LIMIT_SECONDS = 60;

  // Selecionar jogador aleatório de forma segura
  const selectRandomPlayer = useCallback(() => {
    try {
      if (!players || players.length === 0) {
        console.log('❌ Nenhum jogador disponível');
        return;
      }
      
      const randomIndex = Math.floor(Math.random() * players.length);
      const newPlayer = players[randomIndex];
      
      if (newPlayer && newPlayer.id !== currentPlayer?.id) {
        console.log('🎮 Novo jogador selecionado:', newPlayer.name);
        setCurrentPlayer(newPlayer);
        setGameOver(false);
        setGameActive(true);
        setTimeRemaining(TIME_LIMIT_SECONDS);
      }
    } catch (error) {
      console.error('❌ Erro ao selecionar jogador:', error);
    }
  }, [players, currentPlayer]);

  // Timer seguro
  useEffect(() => {
    if (!gameActive || gameOver || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setGameOver(true);
          setGameActive(false);
          setCurrentStreak(0);
          if (currentPlayer) {
            toast({
              variant: "destructive",
              title: "Tempo esgotado!",
              description: `O jogador era ${currentPlayer.name}`,
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, gameOver, timeRemaining, currentPlayer, toast]);

  // Processar palpite de forma segura
  const handleGuess = useCallback(async (guess: string) => {
    try {
      if (!currentPlayer || !guess || gameOver || isProcessingGuess) {
        console.log('❌ Condições não atendidas para processar palpite');
        return;
      }
      
      console.log('🎯 Processando palpite:', guess);
      setIsProcessingGuess(true);
      
      const isCorrect = isCorrectGuess(guess, currentPlayer.name);
      
      if (isCorrect) {
        const points = 5;
        setScore(prev => prev + points);
        setGamesPlayed(prev => prev + 1);
        setCurrentStreak(prev => {
          const newStreak = prev + 1;
          setMaxStreak(current => Math.max(current, newStreak));
          return newStreak;
        });
        
        toast({
          title: "Parabéns!",
          description: `Você acertou! +${points} pontos`,
        });
        
        setTimeout(() => {
          selectRandomPlayer();
          setIsProcessingGuess(false);
        }, 1000);
      } else {
        setGameOver(true);
        setGameActive(false);
        setCurrentStreak(0);
        
        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `O jogador era ${currentPlayer.name}. Pontuação final: ${score}`,
        });
        
        setIsProcessingGuess(false);
      }
    } catch (error) {
      console.error("❌ Erro ao processar palpite:", error);
      setIsProcessingGuess(false);
    }
  }, [currentPlayer, gameOver, isProcessingGuess, score, toast, selectRandomPlayer]);

  // Reset seguro do jogo
  const resetGame = useCallback(() => {
    try {
      console.log('🔄 Resetando jogo');
      setScore(0);
      setGameOver(false);
      setGameActive(false);
      setTimeRemaining(TIME_LIMIT_SECONDS);
      setCurrentPlayer(null);
      setGamesPlayed(0);
      setCurrentStreak(0);
      setMaxStreak(0);
      setIsProcessingGuess(false);
    } catch (error) {
      console.error('❌ Erro ao resetar jogo:', error);
    }
  }, []);

  const resetScore = useCallback(() => {
    setScore(0);
  }, []);

  // Selecionar primeiro jogador de forma segura
  useEffect(() => {
    try {
      if (players && players.length > 0 && !currentPlayer && !gameOver) {
        selectRandomPlayer();
      }
    } catch (error) {
      console.error('❌ Erro ao selecionar primeiro jogador:', error);
    }
  }, [players, currentPlayer, gameOver, selectRandomPlayer]);

  return {
    // Estado do jogo
    currentPlayer,
    score,
    gameOver,
    timeRemaining,
    isProcessingGuess,
    gameActive,
    gamesPlayed,
    currentStreak,
    maxStreak,
    
    // Propriedades calculadas
    gameKey: currentPlayer?.id || 'no-player',
    attempts: [],
    hasLost: gameOver,
    isTimerRunning: gameActive,
    playerChangeCount: gamesPlayed,
    
    // Constantes
    MAX_ATTEMPTS,
    TIME_LIMIT_SECONDS,
    
    // Funções
    handleGuess,
    selectRandomPlayer,
    resetGame,
    resetScore,
    handlePlayerImageFixed: () => {
      console.log('🖼️ Imagem do jogador corrigida');
    },
    startGameForPlayer: () => {
      console.log('🎮 Iniciando jogo para jogador');
    },
    forceRefresh: selectRandomPlayer,
  };
};
