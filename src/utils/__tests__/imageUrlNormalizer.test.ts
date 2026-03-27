import { describe, it, expect } from 'vitest';
import { normalizeLegacyGameImageUrl } from '../imageUrlNormalizer';

describe('normalizeLegacyGameImageUrl', () => {
  it('converte URL local de lovable-uploads webp para png', () => {
    expect(
      normalizeLegacyGameImageUrl('/lovable-uploads/abc-123.webp')
    ).toBe('/lovable-uploads/abc-123.png');
  });

  it('normaliza caminho local sem barra inicial para evitar 404 em rotas aninhadas', () => {
    expect(
      normalizeLegacyGameImageUrl('lovable-uploads/abc-123.png')
    ).toBe('/lovable-uploads/abc-123.png');
  });

  it('converte URL absoluta com query/hash preservando sufixos', () => {
    expect(
      normalizeLegacyGameImageUrl('https://lendasdoflu.com/lovable-uploads/abc-123.webp?v=1#hero')
    ).toBe('https://lendasdoflu.com/lovable-uploads/abc-123.png?v=1#hero');
  });

  it('mantém URLs que não são webp de lovable-uploads', () => {
    expect(
      normalizeLegacyGameImageUrl('/lovable-uploads/abc-123.png')
    ).toBe('/lovable-uploads/abc-123.png');
  });

  it('retorna string vazia para valores vazios', () => {
    expect(normalizeLegacyGameImageUrl('')).toBe('');
    expect(normalizeLegacyGameImageUrl(null)).toBe('');
    expect(normalizeLegacyGameImageUrl(undefined)).toBe('');
  });
});
