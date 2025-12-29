/**
 * Constantes para gerenciamento de imagens de camisas
 */

// Tempo de expiração do cache de imagens (10 minutos)
export const JERSEY_CACHE_EXPIRATION = 10 * 60 * 1000;

// Imagem padrão para fallback quando camisa não carrega
export const jerseyDefaultImage = "/lovable-uploads/7df50b87-e220-4f5e-be35-e5f61cb46d2f.png";

// Fallbacks manuais para camisas problemáticas (por ID)
// Adicionar conforme identificar camisas que não carregam
export const jerseyImagesFallbacks: Record<string, string> = {
  // Exemplo: 'jersey-id-aqui': 'https://url-alternativa.com/camisa.jpg'
};
