/**
 * Tracking de problemas com imagens de camisas
 * Permite identificar camisas problemáticas para correção
 */

import { logger } from '@/utils/logger';
import { errorReporter } from '@/utils/errorReporting';

// Set de camisas com problemas de imagem
const problemJerseys = new Set<string>();

interface JerseyImageProblem {
  jerseyId: string;
  years: number[];
  originalUrl: string;
  optimizedUrl?: string;
  error?: string;
  timestamp: string;
}

// Histórico de problemas para debug
const problemHistory: JerseyImageProblem[] = [];

/**
 * Reporta problema com imagem de camisa
 */
export const reportJerseyImageProblem = (
  jerseyId: string,
  years: number[],
  originalUrl: string,
  optimizedUrl?: string,
  error?: string
) => {
  problemJerseys.add(jerseyId);
  
  const problem: JerseyImageProblem = {
    jerseyId,
    years,
    originalUrl,
    optimizedUrl,
    error,
    timestamp: new Date().toISOString()
  };
  
  problemHistory.push(problem);
  
  // Log detalhado para console
  logger.error('🚨 JERSEY IMAGE PROBLEM:', 'JERSEY_IMAGE_ERROR', {
    jerseyId,
    years: years.join('/'),
    originalUrl,
    optimizedUrl,
    error,
    timestamp: problem.timestamp
  });
  
  // Reportar para sistema de erros
  errorReporter.reportNetworkError(
    `Jersey image load failed: ${jerseyId} (${years.join('/')})`,
    {
      jerseyId,
      years: years.join('/'),
      imageUrl: originalUrl,
      optimizedUrl,
      errorMessage: error
    }
  );
};

/**
 * Retorna lista de IDs de camisas problemáticas
 */
export const getProblematicJerseys = (): string[] => {
  return Array.from(problemJerseys);
};

/**
 * Retorna histórico completo de problemas
 */
export const getJerseyProblemHistory = (): JerseyImageProblem[] => {
  return [...problemHistory];
};

/**
 * Limpa tracking de problemas (para reset entre sessões)
 */
export const clearJerseyProblems = () => {
  problemJerseys.clear();
  problemHistory.length = 0;
  logger.debug('Tracking de problemas de imagens de camisas limpo', 'JERSEY_IMAGE');
};
