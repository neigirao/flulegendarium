/**
 * Funções de embaralhamento para camisas do Quiz
 * Usa algoritmo Fisher-Yates para garantir distribuição uniforme
 */

import { Jersey } from '@/types/jersey-game';
import { logger } from '@/utils/logger';

/**
 * Embaralha array usando Fisher-Yates (Knuth) shuffle
 * Garante ordem diferente a cada chamada
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Embaralha camisas mantendo agrupamento por dificuldade
 * Randomiza dentro de cada grupo de dificuldade
 */
export const shuffleJerseysByDifficulty = (jerseys: Jersey[]): Jersey[] => {
  if (!jerseys || jerseys.length === 0) return [];
  
  // Agrupar por dificuldade
  const byDifficulty: Record<string, Jersey[]> = {};
  
  jerseys.forEach(jersey => {
    const level = jersey.difficulty_level || 'medio';
    if (!byDifficulty[level]) {
      byDifficulty[level] = [];
    }
    byDifficulty[level].push(jersey);
  });
  
  // Embaralhar cada grupo
  Object.keys(byDifficulty).forEach(level => {
    byDifficulty[level] = shuffleArray(byDifficulty[level]);
  });
  
  // Recombinar todos os grupos (mantendo grupos mas embaralhados internamente)
  const result = Object.values(byDifficulty).flat();
  
  // Embaralhar o resultado final também para variar a ordem das dificuldades
  const finalResult = shuffleArray(result);
  
  logger.debug('Camisas embaralhadas', 'JERSEY_SHUFFLE', {
    total: finalResult.length,
    distribuicao: Object.entries(byDifficulty).map(([k, v]) => `${k}: ${v.length}`)
  });
  
  return finalResult;
};

/**
 * Embaralha camisas simples (sem considerar dificuldade)
 */
export const shuffleJerseys = (jerseys: Jersey[]): Jersey[] => {
  if (!jerseys || jerseys.length === 0) return [];
  
  const shuffled = shuffleArray(jerseys);
  
  logger.debug(`Camisas embaralhadas: ${shuffled.length}`, 'JERSEY_SHUFFLE');
  
  return shuffled;
};
