import { fluminenseJerseySvg } from '@/utils/fallback-images/fluminenseSvg';

/**
 * Constantes para gerenciamento de imagens de camisas
 */

// Tempo de expiração do cache de imagens (24 horas — camisas raramente mudam)
export const JERSEY_CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// SVG inline que NUNCA falha (fallback final garantido)
export const guaranteedJerseyFallback = fluminenseJerseySvg;

// Imagem padrão para fallback quando camisa não carrega (camisa tricolor clássica)
export const jerseyDefaultImage = guaranteedJerseyFallback;

/**
 * IDs de camisas problemáticas identificadas no banco de dados
 * Camisas com URLs base64 ou inválidas que precisam de fallback
 * 
 * Identificadas via query:
 * SELECT id, years, type FROM jerseys WHERE image_url LIKE 'data:%'
 */
export const problematicJerseyIds: string[] = [
  'f066e76c-e5bd-4791-ae02-6ce38bf223aa', // 1902 - home - BASE64
  '24af44de-e8b6-4400-b843-7752e17bfc4d', // 1980 - away - BASE64
  'd9344d4f-1074-47d7-b1cf-c99ab20f1843', // 1982 - away - BASE64
  'b90df8c7-9e74-4a6c-aa26-727f0f5010d7', // 1983 - home - BASE64
  '432e3a3a-b8ca-4179-a6d2-16b3e3657a93', // 1984 - home - BASE64
  'de299d5f-468a-44e3-abc6-d7bd4734db75', // 1985 - home - BASE64
  'cda2d0ed-49e8-468c-93fe-92dae81bca1d', // 1986 - away - BASE64
  'b475fd42-6730-4e9c-96d6-207ae39db37d', // 1987-1989 - home - BASE64
  '7ffaab4a-fd7b-496b-a779-4d90c1841124', // 1988-1989 - away - BASE64
  'cc4dc987-81c2-44e0-a864-b9aa7270a427', // 1988 - home - BASE64
  'e1887ddd-c328-4a77-bc90-45d812f7fff4', // 1990-1991 - home - BASE64
  '2ccbfaf4-77e0-458d-b625-f04fefd49b97', // 1990-1991 - home - BASE64
  'b7198393-3e58-430a-9a94-74c0bad67071', // 1992-1993 - home - BASE64
];

// Fallbacks manuais para camisas problemáticas (por ID)
// Quando encontrar URL alternativa, adicionar aqui
export const jerseyImagesFallbacks: Record<string, string> = {
  // As camisas com BASE64 usarão a imagem padrão automaticamente
  // Adicione URLs alternativas conforme encontrar:
  // 'jersey-id-aqui': 'https://url-alternativa.com/camisa.jpg'
};
