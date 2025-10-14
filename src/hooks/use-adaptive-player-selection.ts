import { useState, useCallback, useMemo } from "react";
import { Player, DifficultyLevel } from "@/types/guess-game";
import { logger } from "@/utils/logger";

/**
 * Hook para seleção adaptativa de jogadores baseada em dificuldade.
 * 
 * Gerencia a seleção inteligente de jogadores considerando:
 * - Nível de dificuldade atual
 * - Jogadores já utilizados na partida
 * - Disponibilidade de jogadores por dificuldade
 * - Fallbacks para garantir continuidade do jogo
 * 
 * ### Estratégia de Seleção
 * 1. Tenta selecionar jogador no nível de dificuldade especificado
 * 2. Se não houver, tenta jogadores disponíveis com qualquer dificuldade
 * 3. Como último recurso, seleciona qualquer jogador disponível
 * 
 * ### Controle de Repetição
 * - Aceita Set de IDs de jogadores já usados
 * - Garante que jogadores não se repitam na mesma partida
 * - Retorna null se todos os jogadores foram usados
 * 
 * @returns {Object} Seleção de jogadores e estado de dificuldade
 * @returns {Function} selectPlayerByDifficulty - Seleciona jogador por dificuldade
 * @returns {DifficultyLevel} currentDifficultyLevel - Nível de dificuldade atual
 * @returns {Function} setCurrentDifficultyLevel - Altera o nível de dificuldade
 * 
 * @example
 * ```typescript
 * const {
 *   selectPlayerByDifficulty,
 *   currentDifficultyLevel
 * } = useAdaptivePlayerSelection();
 * 
 * // Selecionar jogador médio sem repetir
 * const usedIds = new Set(['player-1', 'player-2']);
 * const player = selectPlayerByDifficulty(
 *   allPlayers,
 *   'medio',
 *   usedIds
 * );
 * ```
 * 
 * @see {@link useAdaptiveGuessGame} Hook principal que utiliza esta seleção
 */
export const useAdaptivePlayerSelection = () => {
  const [currentDifficultyLevel, setCurrentDifficultyLevel] = useState<DifficultyLevel>('muito_facil');

  /**
   * Seleciona um jogador aleatório baseado no nível de dificuldade.
   * 
   * @param {Player[]} players - Lista completa de jogadores
   * @param {DifficultyLevel} difficultyLevel - Nível de dificuldade desejado
   * @param {Set<string>} usedPlayerIds - IDs de jogadores já usados (opcional)
   * 
   * @returns {Player | null} Jogador selecionado ou null se não houver disponível
   * 
   * @example
   * ```typescript
   * const usedIds = new Set(['id-1', 'id-2']);
   * const player = selectPlayerByDifficulty(
   *   players,
   *   'dificil',
   *   usedIds
   * );
   * 
   * if (player) {
   *   console.log(`Jogador selecionado: ${player.name}`);
   * }
   * ```
   */
  const selectPlayerByDifficulty = useCallback((
    players: Player[], 
    difficultyLevel: DifficultyLevel,
    usedPlayerIds: Set<string> = new Set()
  ) => {
    if (!players || players.length === 0) {
      logger.warn('No players available in the list', 'PLAYER_SELECTION');
      return null;
    }
    
    // Filtrar jogadores já usados nesta partida
    const availablePlayers = players.filter(player => !usedPlayerIds.has(player.id));
    
    // Se todos os jogadores já foram usados, retornar null (fim da partida)
    if (availablePlayers.length === 0) {
      logger.warn('All players have been used in this game session', 'PLAYER_SELECTION');
      return null;
    }
    
    // SEMPRE RESPEITAR A DIFICULDADE DO BANCO - SEM FALLBACKS
    const playersAtDifficulty = availablePlayers.filter(player => 
      player.difficulty_level === difficultyLevel
    );
    
    if (playersAtDifficulty.length > 0) {
      const randomIndex = Math.floor(Math.random() * playersAtDifficulty.length);
      const selectedPlayer = playersAtDifficulty[randomIndex];
      
      // Log todos os jogadores disponíveis nesta dificuldade
      const availableNames = playersAtDifficulty.map(p => p.name).join(', ');
      
      logger.info(
        `✅ Jogador selecionado da dificuldade ${difficultyLevel}: ${selectedPlayer.name}`,
        'PLAYER_SELECTION',
        { 
          difficulty: difficultyLevel,
          playerDifficulty: selectedPlayer.difficulty_level,
          difficultyScore: selectedPlayer.difficulty_score,
          availableCount: playersAtDifficulty.length,
          totalAvailable: availablePlayers.length,
          availablePlayers: availableNames,
          selectedFromPool: `${randomIndex + 1}/${playersAtDifficulty.length}`
        }
      );
      
      return selectedPlayer;
    }
    
    // Se não houver jogadores na dificuldade exata, retornar null
    // O sistema deve respeitar SEMPRE a dificuldade do banco de dados
    logger.error(
      `❌ Nenhum jogador disponível na dificuldade ${difficultyLevel}`,
      'PLAYER_SELECTION',
      {
        requestedDifficulty: difficultyLevel,
        totalPlayers: players.length,
        availablePlayers: availablePlayers.length,
        usedPlayers: usedPlayerIds.size
      }
    );
    
    return null;
  }, []);

  return {
    selectPlayerByDifficulty,
    currentDifficultyLevel,
    setCurrentDifficultyLevel
  };
};
