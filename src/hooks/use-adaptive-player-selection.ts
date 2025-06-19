
import { useState, useCallback, useMemo } from "react";
import { Player, DifficultyLevel } from "@/types/guess-game";

export const useAdaptivePlayerSelection = () => {
  const [currentDifficultyLevel, setCurrentDifficultyLevel] = useState<DifficultyLevel>('medio');

  const selectPlayerByDifficulty = useCallback((players: Player[], difficultyLevel: DifficultyLevel) => {
    if (!players || players.length === 0) return null;
    
    // Filter players by difficulty level
    const playersAtDifficulty = players.filter(player => 
      player.difficulty_level === difficultyLevel
    );
    
    // If no players at this difficulty, use all players as fallback
    const availablePlayers = playersAtDifficulty.length > 0 ? playersAtDifficulty : players;
    
    // Select random player
    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    return availablePlayers[randomIndex];
  }, []);

  return {
    selectPlayerByDifficulty,
    currentDifficultyLevel,
    setCurrentDifficultyLevel
  };
};
