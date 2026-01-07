/**
 * Utilitários para validação e fallback de imagens de camisas
 * Espelha a lógica de src/utils/player-image/imageUtils.ts
 */

import { logger } from '@/utils/logger';
import { JERSEY_CACHE_EXPIRATION } from './constants';

// Imagem padrão para fallback quando camisa não carrega
export const jerseyDefaultImage = "/lovable-uploads/7df50b87-e220-4f5e-be35-e5f61cb46d2f.png";

// Fallbacks manuais para camisas problemáticas (por ID)
export const jerseyImagesFallbacks: Record<string, string> = {};

// Cache local de URLs validadas
const jerseyImageCache = new Map<string, { url: string; timestamp: number }>();

/**
 * Valida se uma URL de imagem de camisa é válida
 */
export const isValidJerseyImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // CRÍTICO: Rejeitar URLs base64 - são muito longas e problemáticas
  if (url.startsWith('data:')) {
    logger.warn('URL de imagem de camisa é base64 (inválida):', 'JERSEY_IMAGE', url.substring(0, 50) + '...');
    return false;
  }
  
  // Verificar protocolo válido
  if (!url.startsWith('http') && !url.startsWith('https') && !url.startsWith('/')) {
    logger.warn('URL de imagem de camisa inválida (protocolo):', 'JERSEY_IMAGE', url);
    return false;
  }
  
  // Verificar padrões suspeitos
  const suspiciousPatterns = [
    /undefined/i,
    /null/i,
    /\s+/, // espaços
    /chat_\d+_ss\.png/, // padrão de erro
    /encrypted-tbn0\.gstatic\.com/i, // Google thumbnails/QR codes
    /gstatic\.com\/images\?q=tbn/i, // Google image thumbnails
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      logger.warn('URL de imagem de camisa com padrão suspeito:', 'JERSEY_IMAGE', url);
      return false;
    }
  }
  
  return true;
};

interface JerseyForImage {
  id: string;
  image_url: string;
  years: number[];
}

/**
 * Obtém URL confiável para imagem de camisa com sistema de fallback
 */
export const getReliableJerseyImageUrl = (jersey: JerseyForImage): string => {
  // Limpar cache expirado periodicamente
  if (Math.random() < 0.1) {
    cleanExpiredCache();
  }
  
  // Verificar cache primeiro
  const cached = jerseyImageCache.get(jersey.id);
  if (cached && Date.now() - cached.timestamp < JERSEY_CACHE_EXPIRATION) {
    return cached.url;
  }
  
  let imageUrl = jersey.image_url;
  
  // PRIORIDADE 1: Se existe fallback configurado, priorizar
  if (jerseyImagesFallbacks[jersey.id]) {
    imageUrl = jerseyImagesFallbacks[jersey.id];
    logger.info(`✅ Usando fallback configurado para camisa ${jersey.years.join('/')}:`, 'JERSEY_IMAGE', imageUrl);
  }
  // PRIORIDADE 2: Verificar se a URL do banco é válida
  else if (jersey.image_url && isValidJerseyImageUrl(jersey.image_url)) {
    imageUrl = jersey.image_url;
    logger.debug(`✅ Usando URL do banco para camisa ${jersey.years.join('/')}`, 'JERSEY_IMAGE');
  }
  // PRIORIDADE 3: Imagem padrão
  else {
    logger.error(`❌ Nenhuma URL válida para camisa ${jersey.years.join('/')}. Usando padrão.`, 'JERSEY_IMAGE');
    imageUrl = jerseyDefaultImage;
  }
  
  // Validação final de segurança
  if (!isValidJerseyImageUrl(imageUrl)) {
    logger.error(`❌ URL final inválida para camisa ${jersey.years.join('/')}:`, 'JERSEY_IMAGE', imageUrl);
    imageUrl = jerseyDefaultImage;
  }
  
  // Salvar no cache
  jerseyImageCache.set(jersey.id, {
    url: imageUrl,
    timestamp: Date.now()
  });
  
  return imageUrl;
};

/**
 * Limpa entradas expiradas do cache
 */
const cleanExpiredCache = () => {
  const now = Date.now();
  let cleaned = 0;
  
  jerseyImageCache.forEach((value, key) => {
    if (now - value.timestamp > JERSEY_CACHE_EXPIRATION) {
      jerseyImageCache.delete(key);
      cleaned++;
    }
  });
  
  if (cleaned > 0) {
    logger.debug(`Cache de imagens de camisas: ${cleaned} entradas expiradas removidas`, 'JERSEY_IMAGE');
  }
};

/**
 * Limpa todo o cache de imagens de camisas
 */
export const clearJerseyImageUrlCache = () => {
  jerseyImageCache.clear();
  logger.debug('Cache de URLs de imagens de camisas limpo', 'JERSEY_IMAGE');
};
