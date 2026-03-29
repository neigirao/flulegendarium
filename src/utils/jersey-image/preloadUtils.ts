import type { Jersey } from "@/types/jersey-game";
import { logger } from "@/utils/logger";

/**
 * Cache para imagens de camisas
 */
const jerseyImageCache = new Map<string, { url: string; loaded: boolean }>();

/**
 * Obtém URL confiável da imagem da camisa
 */
const getJerseyImageUrl = (jersey: Jersey): string => {
  return jersey.image_url || '/placeholder.svg';
};

/**
 * Limpa o cache de imagens de camisas
 */
export const clearJerseyImageCache = (): void => {
  jerseyImageCache.clear();
  logger.debug('Jersey image cache cleared', 'JERSEY_IMAGE');
};

/**
 * Pré-carrega imagens de camisas de forma sequencial
 */
export const preloadJerseyImages = (jerseys: Jersey[]): void => {
  if (!jerseys || jerseys.length === 0) return;
  
  const preloadCount = Math.min(
    Math.max(3, navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4),
    8
  );
  
  logger.debug(`Precarregando ${preloadCount} imagens de camisas`, 'JERSEY_IMAGE');
  
  const preloadSequentially = (index = 0): void => {
    if (index >= preloadCount || index >= jerseys.length) return;
    
    const jersey = jerseys[index];
    const imageUrl = getJerseyImageUrl(jersey);
    const img = new Image();
    
    img.fetchPriority = index < 3 ? 'high' : 'low';
    
    const loadNextImage = (): void => {
      jerseyImageCache.set(jersey.id, { url: imageUrl, loaded: true });
      setTimeout(() => preloadSequentially(index + 1), 100);
    };
    
    img.onload = loadNextImage;
    img.onerror = () => {
      logger.warn(`Falha ao pré-carregar imagem da camisa ${jersey.years.join('/')}`, 'JERSEY_IMAGE');
      loadNextImage();
    };
    
    img.src = imageUrl;
  };
  
  preloadSequentially();
};

/**
 * Pré-carrega a próxima camisa em background
 */
export const preloadNextJersey = (nextJersey: Jersey | null): void => {
  if (!nextJersey) return;
  
  const imageUrl = getJerseyImageUrl(nextJersey);
  
  const cached = jerseyImageCache.get(nextJersey.id);
  if (cached?.loaded) {
    return;
  }
  
  if (typeof window !== 'undefined') {
    const requestIdleCallback = window.requestIdleCallback || 
      ((cb: IdleRequestCallback) => setTimeout(cb, Math.random() * 200 + 100));
    
    requestIdleCallback(() => {
      const img = new Image();
      img.fetchPriority = 'low';
      
      img.onload = () => {
        logger.debug(`Imagem da próxima camisa (${nextJersey.years.join('/')}) pré-carregada`, 'JERSEY_IMAGE');
        jerseyImageCache.set(nextJersey.id, { url: imageUrl, loaded: true });
      };
      
      img.onerror = () => {
        logger.warn(`Falha ao pré-carregar próxima camisa (${nextJersey.years.join('/')})`, 'JERSEY_IMAGE');
      };
      
      img.src = imageUrl;
    });
  }
};

/**
 * Prepara o próximo lote de camisas em background
 */
export const prepareNextJerseyBatch = (
  allJerseys: Jersey[], 
  currentJersey: Jersey | null, 
  batchSize = 2
): void => {
  if (!allJerseys || allJerseys.length <= 1 || !currentJersey) return;
  
  const currentIndex = allJerseys.findIndex(j => j.id === currentJersey.id);
  if (currentIndex === -1) return;
  
  const nextBatch: Jersey[] = [];
  let offset = 1;
  
  while (nextBatch.length < batchSize && offset < allJerseys.length) {
    const nextIndex = (currentIndex + offset) % allJerseys.length;
    nextBatch.push(allJerseys[nextIndex]);
    offset++;
  }
  
  if (nextBatch.length > 0) {
    logger.debug(`Preparando próximo lote de ${nextBatch.length} camisas em background`, 'JERSEY_IMAGE');
    
    setTimeout(() => {
      nextBatch.forEach((jersey, index) => {
        setTimeout(() => {
          const imageUrl = getJerseyImageUrl(jersey);
          const img = new Image();
          img.fetchPriority = 'low';
          img.src = imageUrl;
          
          img.onload = () => {
            jerseyImageCache.set(jersey.id, { url: imageUrl, loaded: true });
          };
        }, index * 200);
      });
    }, 800);
  }
};
