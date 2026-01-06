/**
 * Sistema de fallback de imagens garantido
 * 
 * Hierarquia de fallback:
 * 1. Imagem original do banco/configurada
 * 2. Fallback manual configurado (playerImagesFallbacks)
 * 3. Imagem padrão do storage (/lovable-uploads/...)
 * 4. SVG inline (NUNCA FALHA - embutido no código)
 */

export { 
  fluminenseJerseySvg, 
  playerSilhouetteSvg, 
  getFallbackSvg 
} from './fluminenseSvg';

// Imagens padrão do storage (podem falhar em casos extremos)
export const DEFAULT_PLAYER_IMAGE = "/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png";
export const DEFAULT_JERSEY_IMAGE = "/lovable-uploads/7df50b87-e220-4f5e-be35-e5f61cb46d2f.png";

/**
 * Obtém a imagem de fallback final que NUNCA falha
 * Usa SVG inline embutido no código
 */
export const getGuaranteedFallback = (type: 'jersey' | 'player' = 'player'): string => {
  // Importa dinamicamente para evitar dependência circular
  const { getFallbackSvg } = require('./fluminenseSvg');
  return getFallbackSvg(type);
};
