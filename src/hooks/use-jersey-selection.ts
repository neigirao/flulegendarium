import { useState, useCallback } from "react";
import { Jersey } from "@/types/jersey-game";
import { DifficultyLevel } from "@/types/guess-game";
import { logger } from "@/utils/logger";

/**
 * Hook para seleção de camisas baseada em dificuldade.
 * 
 * Gerencia a seleção inteligente de camisas considerando:
 * - Nível de dificuldade atual
 * - Camisas já utilizadas na partida
 * - Disponibilidade por dificuldade
 * 
 * @returns {Object} Seleção de camisas e estado de dificuldade
 */
export const useJerseySelection = () => {
  const [currentDifficultyLevel, setCurrentDifficultyLevel] = useState<DifficultyLevel>('muito_facil');

  /**
   * Seleciona uma camisa aleatória baseada no nível de dificuldade.
   */
  const selectJerseyByDifficulty = useCallback((
    jerseys: Jersey[], 
    difficultyLevel: DifficultyLevel,
    usedJerseyIds: Set<string> = new Set()
  ): Jersey | null => {
    if (!jerseys || jerseys.length === 0) {
      logger.warn('Nenhuma camisa disponível na lista', 'JERSEY_SELECTION');
      return null;
    }
    
    // Filtrar camisas já usadas
    const availableJerseys = jerseys.filter(jersey => !usedJerseyIds.has(jersey.id));
    
    if (availableJerseys.length === 0) {
      logger.warn('Todas as camisas já foram usadas nesta sessão', 'JERSEY_SELECTION');
      return null;
    }
    
    // Filtrar por dificuldade
    const jerseysAtDifficulty = availableJerseys.filter(jersey => 
      jersey.difficulty_level === difficultyLevel
    );
    
    if (jerseysAtDifficulty.length > 0) {
      const randomIndex = Math.floor(Math.random() * jerseysAtDifficulty.length);
      const selectedJersey = jerseysAtDifficulty[randomIndex];
      
      logger.info(
        `✅ Camisa selecionada da dificuldade ${difficultyLevel}: ${selectedJersey.year}`,
        'JERSEY_SELECTION',
        { 
          difficulty: difficultyLevel,
          jerseyYear: selectedJersey.year,
          availableCount: jerseysAtDifficulty.length,
          totalAvailable: availableJerseys.length
        }
      );
      
      return selectedJersey;
    }
    
    // Se não houver na dificuldade exata, retorna null
    logger.error(
      `❌ Nenhuma camisa disponível na dificuldade ${difficultyLevel}`,
      'JERSEY_SELECTION',
      {
        requestedDifficulty: difficultyLevel,
        totalJerseys: jerseys.length,
        availableJerseys: availableJerseys.length,
        usedJerseys: usedJerseyIds.size
      }
    );
    
    return null;
  }, []);

  /**
   * Seleciona uma camisa aleatória de qualquer dificuldade.
   */
  const selectRandomJersey = useCallback((
    jerseys: Jersey[],
    usedJerseyIds: Set<string> = new Set()
  ): Jersey | null => {
    if (!jerseys || jerseys.length === 0) {
      return null;
    }

    const availableJerseys = jerseys.filter(jersey => !usedJerseyIds.has(jersey.id));
    
    if (availableJerseys.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableJerseys.length);
    return availableJerseys[randomIndex];
  }, []);

  /**
   * Seleciona uma camisa por década específica.
   */
  const selectJerseyByDecade = useCallback((
    jerseys: Jersey[],
    decade: string,
    usedJerseyIds: Set<string> = new Set()
  ): Jersey | null => {
    if (!jerseys || jerseys.length === 0) {
      return null;
    }

    const availableJerseys = jerseys.filter(jersey => 
      !usedJerseyIds.has(jersey.id) && 
      jersey.decades?.includes(decade)
    );
    
    if (availableJerseys.length === 0) {
      logger.warn(`Nenhuma camisa disponível para a década ${decade}`, 'JERSEY_SELECTION');
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableJerseys.length);
    const selectedJersey = availableJerseys[randomIndex];
    
    logger.info(
      `Camisa selecionada da década ${decade}: ${selectedJersey.year}`,
      'JERSEY_SELECTION'
    );
    
    return selectedJersey;
  }, []);

  return {
    selectJerseyByDifficulty,
    selectRandomJersey,
    selectJerseyByDecade,
    currentDifficultyLevel,
    setCurrentDifficultyLevel
  };
};
