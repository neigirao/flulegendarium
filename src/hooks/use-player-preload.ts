
import { useEffect } from "react";
import { Player } from "@/types/guess-game";
import { 
  prepareNextBatch, 
  preloadNextPlayer 
} from "@/utils/player-image";

export const usePlayerPreload = (players: Player[], currentPlayer: Player | null) => {
  // Prepare next batch of players for efficient loading - optimized batch size
  useEffect(() => {
    if (players && players.length > 1 && currentPlayer) {
      prepareNextBatch(players, currentPlayer, 3);
      
      const potentialNextPlayers = players.filter(p => p.id !== currentPlayer.id);
      if (potentialNextPlayers.length > 0) {
        const randomIndices = Array.from(
          { length: Math.min(2, potentialNextPlayers.length) },
          () => Math.floor(Math.random() * potentialNextPlayers.length)
        );
        
        randomIndices.forEach((idx, i) => {
          setTimeout(() => {
            preloadNextPlayer(potentialNextPlayers[idx]);
          }, i * 300);
        });
      }
    }
  }, [currentPlayer, players]);
};
