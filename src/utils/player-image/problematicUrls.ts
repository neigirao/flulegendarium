import { logger } from '@/utils/logger';

// Domínios conhecidos por aplicar rate limiting ou ter problemas frequentes
const KNOWN_PROBLEMATIC_DOMAINS: string[] = [];

const PROBLEMATIC_URLS_KEY = 'flu-legendarium-problematic-urls';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

interface ProblematicUrlCache {
  url: string;
  timestamp: number;
  failureCount: number;
}

/**
 * Verifica se uma URL é de um domínio conhecido por ter problemas
 */
export const isProblematicDomain = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return KNOWN_PROBLEMATIC_DOMAINS.some(domain => 
      urlObj.hostname.includes(domain)
    );
  } catch {
    return false;
  }
};

/**
 * Obtém cache de URLs problemáticas do localStorage
 */
const getProblematicUrlsCache = (): ProblematicUrlCache[] => {
  try {
    const cached = localStorage.getItem(PROBLEMATIC_URLS_KEY);
    if (!cached) return [];
    
    const parsed = JSON.parse(cached) as ProblematicUrlCache[];
    const now = Date.now();
    
    // Filtrar URLs expiradas
    return parsed.filter(item => now - item.timestamp < CACHE_DURATION);
  } catch (error) {
    logger.error('Erro ao ler cache de URLs problemáticas:', error);
    return [];
  }
};

/**
 * Salva cache de URLs problemáticas no localStorage
 */
const saveProblematicUrlsCache = (cache: ProblematicUrlCache[]): void => {
  try {
    localStorage.setItem(PROBLEMATIC_URLS_KEY, JSON.stringify(cache));
  } catch (error) {
    logger.error('Erro ao salvar cache de URLs problemáticas:', error);
  }
};

/**
 * Marca uma URL como problemática
 */
export const markUrlAsProblematic = (url: string): void => {
  const cache = getProblematicUrlsCache();
  const existing = cache.find(item => item.url === url);
  
  if (existing) {
    existing.failureCount++;
    existing.timestamp = Date.now();
  } else {
    cache.push({
      url,
      timestamp: Date.now(),
      failureCount: 1,
    });
  }
  
  saveProblematicUrlsCache(cache);
  logger.warn(`🚫 URL marcada como problemática (${existing?.failureCount || 1}x): ${url}`);
};

/**
 * Verifica se uma URL está marcada como problemática
 */
export const isUrlProblematic = (url: string): boolean => {
  const cache = getProblematicUrlsCache();
  const found = cache.find(item => item.url === url);
  
  if (found && found.failureCount >= 2) {
    logger.info(`⚠️ URL problemática detectada no cache: ${url}`);
    return true;
  }
  
  return false;
};

/**
 * Limpa cache de URLs problemáticas (útil para debug)
 */
export const clearProblematicUrlsCache = (): void => {
  try {
    localStorage.removeItem(PROBLEMATIC_URLS_KEY);
    logger.info('🗑️ Cache de URLs problemáticas limpo');
  } catch (error) {
    logger.error('Erro ao limpar cache de URLs problemáticas:', error);
  }
};

/**
 * Obtém estatísticas do cache de URLs problemáticas
 */
export const getProblematicUrlsStats = (): { total: number; urls: string[] } => {
  const cache = getProblematicUrlsCache();
  return {
    total: cache.length,
    urls: cache.map(item => `${item.url} (${item.failureCount}x)`),
  };
};

/**
 * Calcula delay para retry com exponential backoff
 */
export const getRetryDelay = (attemptNumber: number): number => {
  const baseDelay = 1000; // 1 segundo
  const maxDelay = 10000; // 10 segundos
  const delay = Math.min(baseDelay * Math.pow(2, attemptNumber), maxDelay);
  return delay;
};
