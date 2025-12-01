
import { Player } from './types';
import { playerImagesFallbacks, defaultImage, CACHE_EXPIRATION } from './constants';
import { imageCache, cleanExpiredCache } from './cache';
import { isProblematicDomain, isUrlProblematic } from './problematicUrls';
import { logger } from '@/utils/logger';

/**
 * Valida se uma URL de imagem é válida e acessível
 */
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Verificar se começa com http/https ou é um caminho local válido
  if (!url.startsWith('http') && !url.startsWith('https') && !url.startsWith('/')) {
    console.warn('🚨 URL de imagem inválida (protocolo):', url);
    return false;
  }
  
  // Verificar se não contém caracteres suspeitos que podem causar 404
  const suspiciousPatterns = [
    /chat_\d+_ss\.png/, // Padrão de erro identificado
    /undefined/i,
    /null/i,
    /\s+/, // espaços
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      logger.warn('🚨 URL de imagem com padrão suspeito:', url);
      return false;
    }
  }
  
  // Verificar se é de domínio problemático ou está marcada como problemática
  if (isProblematicDomain(url) || isUrlProblematic(url)) {
    logger.warn('🚨 URL de domínio problemático ou marcada como problemática:', url);
    return false;
  }
  
  return true;
};

// Function to get a reliable image URL
export const getReliableImageUrl = (player: Player): string => {
  // Clean expired cache entries periodically
  if (Math.random() < 0.1) { // 10% chance to clean on each call
    cleanExpiredCache();
  }
  
  // Check cache first
  const cached = imageCache.get(player.id);
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRATION) {
    return cached.url;
  }
  
  let imageUrl = player.image_url;
  
  // PRIORIDADE 1: Se existe fallback configurado, priorizar (mais confiável)
  if (playerImagesFallbacks[player.name]) {
    imageUrl = playerImagesFallbacks[player.name];
    logger.info(`✅ Usando fallback configurado para ${player.name}:`, imageUrl);
  }
  // PRIORIDADE 2: Verificar se a URL do banco é válida
  else if (player.image_url && isValidImageUrl(player.image_url)) {
    imageUrl = player.image_url;
    logger.info(`✅ Usando URL do banco para ${player.name}:`, imageUrl);
  }
  // PRIORIDADE 3: Tentar match parcial nos fallbacks
  else {
    let fallbackFound = false;
    for (const [key, url] of Object.entries(playerImagesFallbacks)) {
      if (player.name.includes(key) || key.includes(player.name)) {
        imageUrl = url;
        logger.info(`⚠️ Usando fallback parcial para ${player.name}:`, imageUrl);
        fallbackFound = true;
        break;
      }
    }
    
    // PRIORIDADE 4: Última opção - imagem padrão
    if (!fallbackFound) {
      logger.error(`❌ Nenhuma URL válida encontrada para ${player.name}. Usando imagem padrão.`);
      imageUrl = defaultImage;
    }
  }
  
  // Validação final de segurança
  if (!isValidImageUrl(imageUrl)) {
    logger.error(`❌ Usando imagem padrão para ${player.name} - URL final inválida:`, imageUrl);
    imageUrl = defaultImage;
  }
  
  // Save to cache with timestamp
  imageCache.set(player.id, {
    url: imageUrl,
    timestamp: Date.now(),
    loaded: false
  });
  
  logger.info(`🖼️ URL final para ${player.name}:`, imageUrl);
  
  return imageUrl;
};
