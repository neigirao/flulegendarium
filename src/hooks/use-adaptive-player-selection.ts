
import { useState, useCallback, useMemo } from "react";
import { Player, DifficultyLevel } from "@/types/guess-game";

export const useAdaptivePlayerSelection = () => {
  const [currentDifficultyLevel, setCurrentDifficultyLevel] = useState<DifficultyLevel>('muito_facil');

  const selectPlayerByDifficulty = useCallback((players: Player[], difficultyLevel: DifficultyLevel) => {
    if (!players || players.length === 0) return null;
    
    console.log(`🎯 === SELEÇÃO DE JOGADOR POR DIFICULDADE ===`);
    console.log(`🎯 Dificuldade solicitada: "${difficultyLevel}"`);
    console.log(`📊 Total de jogadores disponíveis: ${players.length}`);
    
    // Log detalhado de todos os jogadores e suas dificuldades
    console.log(`📋 Lista completa de jogadores e dificuldades:`);
    players.forEach((player, index) => {
      console.log(`  ${index + 1}. ${player.name} - Dificuldade: "${player.difficulty_level}" (tipo: ${typeof player.difficulty_level})`);
    });
    
    // Filter players by difficulty level with strict comparison
    const playersAtDifficulty = players.filter(player => {
      const playerDifficulty = player.difficulty_level;
      const matches = playerDifficulty === difficultyLevel;
      
      console.log(`🔍 Jogador "${player.name}": dificuldade="${playerDifficulty}" | procurando="${difficultyLevel}" | match=${matches}`);
      
      return matches;
    });
    
    console.log(`✅ Jogadores encontrados com dificuldade "${difficultyLevel}": ${playersAtDifficulty.length}`);
    console.log(`📝 Jogadores filtrados:`, playersAtDifficulty.map(p => `${p.name} (${p.difficulty_level})`));
    
    if (playersAtDifficulty.length > 0) {
      // Select random player from the correct difficulty
      const randomIndex = Math.floor(Math.random() * playersAtDifficulty.length);
      const selectedPlayer = playersAtDifficulty[randomIndex];
      console.log(`🎲 Jogador selecionado: "${selectedPlayer.name}" (dificuldade: "${selectedPlayer.difficulty_level}")`);
      return selectedPlayer;
    }
    
    // Fallback: try to find players with any difficulty level set
    const playersWithDifficulty = players.filter(player => 
      player.difficulty_level && player.difficulty_level !== null && player.difficulty_level !== undefined
    );
    
    console.log(`⚠️ Fallback: Jogadores com alguma dificuldade definida: ${playersWithDifficulty.length}`);
    
    if (playersWithDifficulty.length > 0) {
      const randomIndex = Math.floor(Math.random() * playersWithDifficulty.length);
      const selectedPlayer = playersWithDifficulty[randomIndex];
      console.log(`🔄 Fallback selecionado: "${selectedPlayer.name}" (dificuldade: "${selectedPlayer.difficulty_level}")`);
      return selectedPlayer;
    }
    
    // Last fallback: use any player
    console.log(`🚨 Último fallback: usando qualquer jogador disponível`);
    const randomIndex = Math.floor(Math.random() * players.length);
    const selectedPlayer = players[randomIndex];
    console.log(`🎯 Jogador final selecionado: "${selectedPlayer.name}" (dificuldade: "${selectedPlayer.difficulty_level || 'indefinida'}")`);
    return selectedPlayer;
  }, []);

  return {
    selectPlayerByDifficulty,
    currentDifficultyLevel,
    setCurrentDifficultyLevel
  };
};
