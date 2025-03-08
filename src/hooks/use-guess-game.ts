
import { useState, useEffect, useRef, useCallback } from "react";
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

const MAX_ATTEMPTS = 1;
const TIME_LIMIT_SECONDS = 60; // 1 minute timer

export const useGuessGame = (players: Player[] | undefined) => {
  const { toast } = useToast();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT_SECONDS);
  const timerRef = useRef<number | null>(null);
  const availablePlayers = useRef<Player[]>([]);

  // Cache available players
  useEffect(() => {
    if (players && players.length > 0) {
      availablePlayers.current = [...players];
    }
  }, [players]);

  // Cleanup function for timer
  const clearGameTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start timer when a new player is selected
  useEffect(() => {
    if (currentPlayer && !gameOver) {
      // Clear any existing timer
      clearGameTimer();
      
      // Reset time
      setTimeRemaining(TIME_LIMIT_SECONDS);
      
      // Start new timer
      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up
            clearGameTimer();
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    // Cleanup timer on unmount
    return clearGameTimer;
  }, [currentPlayer, gameOver, clearGameTimer]);

  // Initialize game when players data is loaded
  useEffect(() => {
    if (players?.length > 0 && !currentPlayer) {
      console.log("Selecionando jogador aleatório entre", players.length, "jogadores");
      selectRandomPlayer();
    }
  }, [players]);

  const handleTimeUp = useCallback(() => {
    if (!gameOver && currentPlayer) {
      setGameOver(true);
      toast({
        variant: "destructive",
        title: "Tempo esgotado!",
        description: `O jogador era ${currentPlayer.name}`,
      });
    }
  }, [currentPlayer, gameOver, toast]);

  const selectRandomPlayer = useCallback(() => {
    if (!availablePlayers.current || availablePlayers.current.length === 0) {
      console.log("Não há jogadores disponíveis para selecionar");
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * availablePlayers.current.length);
    const player = { ...availablePlayers.current[randomIndex] };
    console.log("Jogador selecionado:", player?.name || "Desconhecido");
    
    // Make sure we have a valid image
    if (player) {
      player.image_url = getReliableImageUrl(player);
    }
    
    setCurrentPlayer(player);
    setAttempts(0);
    setGameOver(false);
    setTimeRemaining(TIME_LIMIT_SECONDS);
  }, []);

  const handlePlayerImageFixed = useCallback(() => {
    // Refresh the current player with fixed image
    if (currentPlayer) {
      setCurrentPlayer(prevPlayer => {
        if (!prevPlayer) return null;
        return {
          ...prevPlayer,
          image_url: getReliableImageUrl(prevPlayer)
        };
      });
    }
  }, [currentPlayer]);

  // Helper function to check if guess matches player name
  const isCorrectGuess = (guess: string, playerName: string): boolean => {
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedPlayerName = playerName.toLowerCase().trim();
    
    // Exact match check
    if (normalizedGuess === normalizedPlayerName) {
      return true;
    }
    
    // Last name check (e.g., "Cavalieri" for "Diego Cavalieri")
    const playerNameParts = normalizedPlayerName.split(' ');
    if (playerNameParts.length > 1) {
      const lastName = playerNameParts[playerNameParts.length - 1];
      if (normalizedGuess === lastName) {
        return true;
      }
    }
    
    // First name check (e.g., "Diego" for "Diego Cavalieri")
    if (playerNameParts.length > 0) {
      const firstName = playerNameParts[0];
      if (normalizedGuess === firstName) {
        return true;
      }
    }
    
    // Nickname check - if the player name contains the guess as a whole word
    // This helps with known nicknames like "Fred" for "Frederico Chaves Guedes"
    const wordBoundaryRegex = new RegExp(`\\b${normalizedGuess}\\b`);
    if (wordBoundaryRegex.test(normalizedPlayerName)) {
      return true;
    }
    
    return false;
  };

  const handleGuess = useCallback((guess: string) => {
    if (!currentPlayer || !guess || gameOver) return;

    // Check if guess matches player name using our helper function
    if (isCorrectGuess(guess, currentPlayer.name)) {
      // Correct guess!
      const points = 5; // Always award 5 points since we only have one attempt now
      setScore(prev => prev + points);
      
      toast({
        title: "Parabéns!",
        description: `Você acertou e ganhou ${points} pontos!`,
      });
      
      // Clear the timer
      clearGameTimer();
      
      selectRandomPlayer();
    } else {
      // Wrong guess - game over immediately
      setGameOver(true);
      
      // Clear the timer
      clearGameTimer();
      
      toast({
        variant: "destructive",
        title: "Game Over!",
        description: `O jogador era ${currentPlayer.name}`,
      });
    }
  }, [currentPlayer, gameOver, clearGameTimer, selectRandomPlayer, toast]);

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
