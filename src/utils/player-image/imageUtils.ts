
import { Player } from './types';
import { playerImagesFallbacks, defaultImage, CACHE_EXPIRATION } from './constants';
import { imageCache, cleanExpiredCache } from './cache';

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
      console.warn('🚨 URL de imagem com padrão suspeito:', url);
      return false;
    }
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
  
  // PRIORIDADE 1: Verificar se tem fallback configurado para este jogador
  if (playerImagesFallbacks[player.name]) {
    imageUrl = playerImagesFallbacks[player.name];
    console.log(`✅ Usando fallback para ${player.name}:`, imageUrl);
  } 
  // PRIORIDADE 2: Try to find partial match
  else if (player.image_url) {
    // Validar URL do banco antes de usar
    if (!isValidImageUrl(player.image_url)) {
      console.error(`❌ URL inválida para jogador ${player.name} (${player.id}):`, player.image_url);
      imageUrl = defaultImage;
    } else {
      // Procurar match parcial nos fallbacks
      for (const [key, url] of Object.entries(playerImagesFallbacks)) {
        if (player.name.includes(key) || key.includes(player.name)) {
          imageUrl = url;
          console.log(`✅ Usando fallback parcial para ${player.name}:`, imageUrl);
          break;
        }
      }
    }
  }
  
  // PRIORIDADE 3: Última validação antes de retornar
  if (!isValidImageUrl(imageUrl)) {
    console.error(`❌ Usando imagem padrão para ${player.name} - URL final inválida:`, imageUrl);
    imageUrl = defaultImage;
  }
  
  // Save to cache with timestamp
  imageCache.set(player.id, {
    url: imageUrl,
    timestamp: Date.now(),
    loaded: false
  });
  
  console.log(`🖼️ URL final para ${player.name}:`, imageUrl);
  
  return imageUrl;
};
