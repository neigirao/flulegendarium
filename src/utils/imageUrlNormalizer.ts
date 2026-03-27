const LOVABLE_UPLOADS_WEBP_PATTERN = /(\/lovable-uploads\/[^/?#]+)\.webp(\?[^#]*)?(#.*)?$/i;
const LOVABLE_UPLOADS_RELATIVE_PATTERN = /^lovable-uploads\//i;

/**
 * Normaliza URLs legadas de imagens que apontam para assets removidos.
 * Hoje converte especificamente `/lovable-uploads/*.webp` para `.png`.
 */
export const normalizeLegacyGameImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  const normalizedPath = LOVABLE_UPLOADS_RELATIVE_PATTERN.test(trimmed)
    ? `/${trimmed}`
    : trimmed;

  return normalizedPath.replace(LOVABLE_UPLOADS_WEBP_PATTERN, '$1.png$2$3');
};
