
import { useState, useEffect } from "react";
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

const MAX_ATTEMPTS = 3;

export const useGuessGame = (players: Player[] | undefined) => {
  const { toast } = useToast();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (players?.length > 0 && !currentPlayer) {
      console.log("Selecionando jogador aleatório entre", players.length, "jogadores");
      selectRandomPlayer();
    }
  }, [players]);

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
      const points = (MAX_ATTEMPTS - attempts) * 5;
      setScore((prev) => prev + points);
      
      toast({
        title: "Parabéns!",
        description: `Você acertou e ganhou ${points} pontos!`,
      });
      
      selectRandomPlayer();
    } else {
      // Wrong guess
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      // Show hints based on attempt count
      if (newAttempts === 1) {
        toast({
          title: "Dica!",
          description: `Posição: ${currentPlayer.position}`,
        });
      } else if (newAttempts === 2) {
        if (currentPlayer.achievements && currentPlayer.achievements.length > 0) {
          toast({
            title: "Dica!",
            description: `Conquistas: ${currentPlayer.achievements.join(", ")}`,
          });
        } else {
          toast({
            title: "Dica!",
            description: `Ano de destaque: ${currentPlayer.year_highlight}`,
          });
        }
      } else {
        // Game over after 3 attempts
        setGameOver(true);
        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `O jogador era ${currentPlayer.name}`,
        });
      }
    }
  };

  return {
    currentPlayer,
    attempts,
    score,
    gameOver,
    MAX_ATTEMPTS,
    handleGuess,
    selectRandomPlayer,
    handlePlayerImageFixed
  };
};
