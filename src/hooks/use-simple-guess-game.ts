import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types/guess-game";
import { isCorrectGuess } from "@/utils/name-processor";

export const useSimpleGuessGame = (players: Player[] | undefined) => {
  const { toast } = useToast();
  
  // Estado do jogo
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isProcessingGuess, setIsProcessingGuess] = useState(false);
  const [gameActive, setGameActive] = useState(false);

  // Selecionar jogador aleatório
  const selectRandomPlayer = useCallback(() => {
    if (!players || players.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * players.length);
    const newPlayer = players[randomIndex];
    
    if (newPlayer && newPlayer.id !== currentPlayer?.id) {
      setCurrentPlayer(newPlayer);
      setGameOver(false);
      setGameActive(true);
      setTimeRemaining(60);
    }
  }, [players, currentPlayer]);

  // Timer do jogo
  useEffect(() => {
    if (!gameActive || gameOver) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setGameOver(true);
          setGameActive(false);
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
  }, [gameActive, gameOver, currentPlayer, toast]);

  // Processar palpite
  const handleGuess = useCallback(async (guess: string) => {
    if (!currentPlayer || !guess || gameOver || isProcessingGuess) return;
    
    setIsProcessingGuess(true);
    
    try {
      const isCorrect = isCorrectGuess(guess, currentPlayer.name);
      
      if (isCorrect) {
        const points = 5;
        setScore(prev => prev + points);
        
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
        
        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `O jogador era ${currentPlayer.name}. Pontuação final: ${score}`,
        });
        
        setIsProcessingGuess(false);
      }
    } catch (error) {
      console.error("Erro ao processar palpite:", error);
      setIsProcessingGuess(false);
    }
  }, [currentPlayer, gameOver, isProcessingGuess, score, toast, selectRandomPlayer]);

  // Reset do jogo
  const resetGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setGameActive(false);
    setTimeRemaining(60);
    setCurrentPlayer(null);
  }, []);

  // Selecionar primeiro jogador
  useEffect(() => {
    if (players && players.length > 0 && !currentPlayer) {
      selectRandomPlayer();
    }
  }, [players, currentPlayer, selectRandomPlayer]);

  return {
    currentPlayer,
    score,
    gameOver,
    timeRemaining,
    isProcessingGuess,
    gameActive,
    handleGuess,
    selectRandomPlayer,
    resetGame,
    handlePlayerImageFixed: () => {}, // placeholder
  };
};
