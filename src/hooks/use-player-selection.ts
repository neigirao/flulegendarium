import { useState, useRef, useCallback, useEffect } from "react";
import { Player } from "@/types/guess-game";
import { getReliableImageUrl } from "@/utils/player-image";

export const usePlayerSelection = (players: Player[] | undefined) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const availablePlayers = useRef<Player[]>([]);

  // Cache available players
  useEffect(() => {
    if (players && players.length > 0) {
      availablePlayers.current = [...players];
    }
  }, [players]);

  // Select a random player
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
  }, []);

  // Handle image fixes
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

  return {
    currentPlayer,
    selectRandomPlayer,
    handlePlayerImageFixed,
  };
};
