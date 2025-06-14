
import { useState, useRef, useCallback, useEffect } from "react";
import { Player } from "@/types/guess-game";
import { getReliableImageUrl } from "@/utils/player-image";

export const usePlayerSelection = (players: Player[] | undefined) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const availablePlayers = useRef<Player[]>([]);
  const isInitialized = useRef(false);

  // Cache available players
  useEffect(() => {
    if (players && players.length > 0) {
      availablePlayers.current = [...players];
      
      // Only initialize once when players are first loaded
      if (!isInitialized.current && !currentPlayer) {
        isInitialized.current = true;
        const randomIndex = Math.floor(Math.random() * players.length);
        const player = { ...players[randomIndex] };
        player.image_url = getReliableImageUrl(player);
        setCurrentPlayer(player);
      }
    }
  }, [players]);

  // Select a random player
  const selectRandomPlayer = useCallback(() => {
    if (!availablePlayers.current || availablePlayers.current.length === 0) {
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * availablePlayers.current.length);
    const player = { ...availablePlayers.current[randomIndex] };
    
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
