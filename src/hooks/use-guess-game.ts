import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getReliableImageUrl } from "@/utils/playerImageUtils";

interface Player {
  id: string;
  name: string;
  position: string;
  image_url: string;
  year_highlight: string;
  fun_fact: string;
  achievements: string[];
  statistics: {
    gols: number;
    jogos: number;
  };
}

const MAX_ATTEMPTS = 1; // Changed from 3 to 1
const TIME_LIMIT_SECONDS = 60; // 1 minute timer

export const useGuessGame = (players: Player[] | undefined) => {
  const { toast } = useToast();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT_SECONDS);
  const timerRef = useRef<number | null>(null);

  // Setup timer when a new player is selected
  useEffect(() => {
    if (currentPlayer && !gameOver) {
      // Clear any existing timer
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      // Reset time
      setTimeRemaining(TIME_LIMIT_SECONDS);
      
      // Start new timer
      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up
            window.clearInterval(timerRef.current as number);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [currentPlayer, gameOver]);

  useEffect(() => {
    if (players?.length > 0 && !currentPlayer) {
      console.log("Selecionando jogador aleatório entre", players.length, "jogadores");
      selectRandomPlayer();
    }
  }, [players]);

  const handleTimeUp = () => {
    if (!gameOver && currentPlayer) {
      setGameOver(true);
      toast({
        variant: "destructive",
        title: "Tempo esgotado!",
        description: `O jogador era ${currentPlayer.name}`,
      });
    }
  };

  const selectRandomPlayer = () => {
    if (!players || players.length === 0) {
      console.log("Não há jogadores disponíveis para selecionar");
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * players.length);
    const player = players[randomIndex];
    console.log("Jogador selecionado:", player?.name || "Desconhecido");
    
    // Make sure we have a valid image
    if (player) {
      player.image_url = getReliableImageUrl(player);
    }
    
    setCurrentPlayer(player);
    setAttempts(0);
    setGameOver(false);
    setTimeRemaining(TIME_LIMIT_SECONDS);
  };

  const handlePlayerImageFixed = () => {
    // Refresh the current player with fixed image
    if (currentPlayer) {
      setCurrentPlayer({
        ...currentPlayer,
        image_url: getReliableImageUrl(currentPlayer)
      });
    }
  };

  const handleGuess = (guess: string) => {
    if (!currentPlayer || !guess || gameOver) return;

    // Simplified name check (case insensitive)
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedPlayerName = currentPlayer.name.toLowerCase().trim();
    
    console.log(`Comparando "${normalizedGuess}" com "${normalizedPlayerName}"`);
    
    if (normalizedGuess === normalizedPlayerName) {
      // Correct guess!
      const points = 5; // Always award 5 points since we only have one attempt now
      setScore((prev) => prev + points);
      
      toast({
        title: "Parabéns!",
        description: `Você acertou e ganhou ${points} pontos!`,
      });
      
      // Clear the timer
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      selectRandomPlayer();
    } else {
      // Wrong guess - game over immediately
      setGameOver(true);
      
      // Clear the timer
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      toast({
        variant: "destructive",
        title: "Game Over!",
        description: `O jogador era ${currentPlayer.name}`,
      });
    }
  };

  return {
    currentPlayer,
    attempts,
    score,
    gameOver,
    timeRemaining,
    MAX_ATTEMPTS,
    handleGuess,
    selectRandomPlayer,
    handlePlayerImageFixed
  };
};
