/**
 * SVG inline da camisa do Fluminense como fallback final
 * Este SVG está embutido no código - não depende de requisição HTTP
 * GARANTE que sempre haverá uma imagem visual, nunca um erro
 */

// Cores oficiais do Fluminense
const FLU_BURGUNDY = '#780028';
const FLU_GREEN = '#00543d';
const FLU_WHITE = '#ffffff';

/**
 * SVG da camisa tricolor do Fluminense
 * Design simplificado mas reconhecível
 */
export const fluminenseJerseySvg = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
  <!-- Fundo da camisa -->
  <path d="M40 60 L20 80 L20 200 L180 200 L180 80 L160 60 L140 60 L130 40 L70 40 L60 60 Z" fill="${FLU_WHITE}" stroke="#ccc" stroke-width="1"/>
  
  <!-- Faixas tricolores horizontais -->
  <rect x="20" y="90" width="160" height="25" fill="${FLU_BURGUNDY}"/>
  <rect x="20" y="115" width="160" height="25" fill="${FLU_WHITE}"/>
  <rect x="20" y="140" width="160" height="25" fill="${FLU_GREEN}"/>
  
  <!-- Gola -->
  <path d="M70 40 L80 55 L120 55 L130 40 Z" fill="${FLU_BURGUNDY}"/>
  
  <!-- Manga esquerda -->
  <path d="M40 60 L20 80 L20 100 L45 100 L60 60 Z" fill="${FLU_WHITE}" stroke="#ccc" stroke-width="1"/>
  
  <!-- Manga direita -->
  <path d="M160 60 L180 80 L180 100 L155 100 L140 60 Z" fill="${FLU_WHITE}" stroke="#ccc" stroke-width="1"/>
  
  <!-- Contorno das mangas com listras -->
  <rect x="20" y="90" width="25" height="10" fill="${FLU_BURGUNDY}"/>
  <rect x="155" y="90" width="25" height="10" fill="${FLU_BURGUNDY}"/>
  
  <!-- Texto FFC -->
  <text x="100" y="185" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${FLU_BURGUNDY}" text-anchor="middle">FFC</text>
</svg>
`)}`;

/**
 * SVG de silhueta de jogador como fallback para fotos de jogadores
 * Usa as cores do Fluminense
 */
export const playerSilhouetteSvg = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <!-- Fundo circular -->
  <circle cx="100" cy="100" r="95" fill="${FLU_GREEN}" opacity="0.1"/>
  <circle cx="100" cy="100" r="95" fill="none" stroke="${FLU_BURGUNDY}" stroke-width="3"/>
  
  <!-- Cabeça -->
  <circle cx="100" cy="70" r="35" fill="${FLU_BURGUNDY}"/>
  
  <!-- Corpo/Ombros -->
  <ellipse cx="100" cy="160" rx="55" ry="45" fill="${FLU_BURGUNDY}"/>
  
  <!-- Camisa tricolor estilizada no corpo -->
  <rect x="60" y="130" width="80" height="8" fill="${FLU_WHITE}"/>
  <rect x="60" y="140" width="80" height="8" fill="${FLU_GREEN}"/>
  <rect x="60" y="150" width="80" height="8" fill="${FLU_BURGUNDY}"/>
</svg>
`)}`;

/**
 * Retorna o SVG apropriado baseado no tipo
 */
export const getFallbackSvg = (type: 'jersey' | 'player' = 'player'): string => {
  return type === 'jersey' ? fluminenseJerseySvg : playerSilhouetteSvg;
};
