
import { useState, useCallback, useMemo } from "react";
import { Player, DifficultyLevel } from "@/types/guess-game";
import { logger } from "@/utils/logger";

export const useAdaptivePlayerSelection = () => {
  const [currentDifficultyLevel, setCurrentDifficultyLevel] = useState<DifficultyLevel>('muito_facil');

  const selectPlayerByDifficulty = useCallback((
    players: Player[], 
    difficultyLevel: DifficultyLevel,
    usedPlayerIds: Set<string> = new Set()
  ) => {
    if (!players || players.length === 0) return null;
    
    // Filtrar jogadores já usados nesta partida
    const availablePlayers = players.filter(player => !usedPlayerIds.has(player.id));
    
    // Se todos os jogadores já foram usados, retornar null (fim da partida)
    if (availablePlayers.length === 0) {
      logger.warn('All players have been used in this game session', 'PLAYER_SELECTION');
      return null;
    }
    
    // Filtrar por dificuldade entre os jogadores disponíveis
    const playersAtDifficulty = availablePlayers.filter(player => 
      player.difficulty_level === difficultyLevel
    );
    
    if (playersAtDifficulty.length > 0) {
      const randomIndex = Math.floor(Math.random() * playersAtDifficulty.length);
      const selectedPlayer = playersAtDifficulty[randomIndex];
      logger.debug(`Selected player: ${selectedPlayer.name}`, 'PLAYER_SELECTION', { 
        difficulty: difficultyLevel,
        availableCount: playersAtDifficulty.length 
      });
      return selectedPlayer;
    }
    
    // Fallback: tentar jogadores disponíveis com qualquer dificuldade
    const playersWithDifficulty = availablePlayers.filter(player => 
      player.difficulty_level && player.difficulty_level !== null && player.difficulty_level !== undefined
    );
    
    if (playersWithDifficulty.length > 0) {
      const randomIndex = Math.floor(Math.random() * playersWithDifficulty.length);
      const selectedPlayer = playersWithDifficulty[randomIndex];
      logger.debug(`Fallback player selected: ${selectedPlayer.name}`, 'PLAYER_SELECTION');
      return selectedPlayer;
    }
    
    // Último fallback: qualquer jogador disponível
    if (availablePlayers.length > 0) {
      const randomIndex = Math.floor(Math.random() * availablePlayers.length);
      const selectedPlayer = availablePlayers[randomIndex];
      logger.debug(`Last fallback player: ${selectedPlayer.name}`, 'PLAYER_SELECTION');
      return selectedPlayer;
    }
    
    return null;
  }, []);

  return {
    selectPlayerByDifficulty,
    currentDifficultyLevel,
    setCurrentDifficultyLevel
  };
};
