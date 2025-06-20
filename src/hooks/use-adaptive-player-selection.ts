
import { useState, useCallback, useMemo } from "react";
import { Player, DifficultyLevel } from "@/types/guess-game";

export const useAdaptivePlayerSelection = () => {
  const [currentDifficultyLevel, setCurrentDifficultyLevel] = useState<DifficultyLevel>('muito_facil');

  const selectPlayerByDifficulty = useCallback((players: Player[], difficultyLevel: DifficultyLevel) => {
    if (!players || players.length === 0) return null;
    
    console.log(`🎯 Tentando selecionar jogador com dificuldade: ${difficultyLevel}`);
    console.log(`📊 Total de jogadores disponíveis: ${players.length}`);
    
    // Filter players by difficulty level
    const playersAtDifficulty = players.filter(player => {
      const playerDifficulty = player.difficulty_level;
      console.log(`🎮 Jogador ${player.name}: dificuldade=${playerDifficulty}, procurando=${difficultyLevel}`);
      return playerDifficulty === difficultyLevel;
    });
    
    console.log(`✅ Jogadores encontrados com dificuldade ${difficultyLevel}: ${playersAtDifficulty.length}`);
    
    if (playersAtDifficulty.length > 0) {
      // Select random player from the correct difficulty
      const randomIndex = Math.floor(Math.random() * playersAtDifficulty.length);
      const selectedPlayer = playersAtDifficulty[randomIndex];
      console.log(`🎲 Jogador selecionado: ${selectedPlayer.name} (${selectedPlayer.difficulty_level})`);
      return selectedPlayer;
    }
    
    // Fallback: try to find players with any difficulty level set
    const playersWithDifficulty = players.filter(player => 
      player.difficulty_level && player.difficulty_level !== null
    );
    
    console.log(`⚠️ Fallback: Jogadores com alguma dificuldade definida: ${playersWithDifficulty.length}`);
    
    if (playersWithDifficulty.length > 0) {
      const randomIndex = Math.floor(Math.random() * playersWithDifficulty.length);
      const selectedPlayer = playersWithDifficulty[randomIndex];
      console.log(`🔄 Fallback selecionado: ${selectedPlayer.name} (${selectedPlayer.difficulty_level})`);
      return selectedPlayer;
    }
    
    // Last fallback: use any player
    console.log(`🚨 Último fallback: usando qualquer jogador`);
    const randomIndex = Math.floor(Math.random() * players.length);
    const selectedPlayer = players[randomIndex];
    console.log(`🎯 Jogador final selecionado: ${selectedPlayer.name}`);
    return selectedPlayer;
  }, []);

  return {
    selectPlayerByDifficulty,
    currentDifficultyLevel,
    setCurrentDifficultyLevel
  };
};
