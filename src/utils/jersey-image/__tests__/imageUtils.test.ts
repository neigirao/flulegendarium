import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  isValidJerseyImageUrl, 
  getReliableJerseyImageUrl, 
  jerseyDefaultImage,
  clearJerseyImageUrlCache 
} from '../imageUtils';

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }
}));

describe('Jersey Image Utils', () => {
  beforeEach(() => {
    clearJerseyImageUrlCache();
    vi.clearAllMocks();
  });

  describe('isValidJerseyImageUrl', () => {
    it('deve retornar false para URL vazia', () => {
      expect(isValidJerseyImageUrl('')).toBe(false);
    });

    it('deve retornar false para URL undefined/null', () => {
      expect(isValidJerseyImageUrl(undefined as unknown as string)).toBe(false);
      expect(isValidJerseyImageUrl(null as unknown as string)).toBe(false);
    });

    it('deve retornar false para URLs base64', () => {
      expect(isValidJerseyImageUrl('data:image/png;base64,abc123')).toBe(false);
      expect(isValidJerseyImageUrl('data:image/jpeg;base64,xyz789')).toBe(false);
    });

    it('deve retornar false para URLs gstatic (Google thumbnails)', () => {
      expect(isValidJerseyImageUrl('https://encrypted-tbn0.gstatic.com/images?q=tbn:abc123')).toBe(false);
      expect(isValidJerseyImageUrl('http://gstatic.com/images?q=tbn:xyz')).toBe(false);
    });

    it('deve retornar false para URLs com padrões suspeitos', () => {
      expect(isValidJerseyImageUrl('https://example.com/undefined.jpg')).toBe(false);
      expect(isValidJerseyImageUrl('https://example.com/null.png')).toBe(false);
      expect(isValidJerseyImageUrl('https://example.com/chat_123_ss.png')).toBe(false);
    });

    it('deve retornar false para URLs com espaços', () => {
      expect(isValidJerseyImageUrl('https://example.com/image name.jpg')).toBe(false);
    });

    it('deve retornar false para protocolo inválido', () => {
      expect(isValidJerseyImageUrl('ftp://example.com/image.jpg')).toBe(false);
      expect(isValidJerseyImageUrl('javascript:alert(1)')).toBe(false);
    });

    it('deve retornar true para URLs válidas com protocolo http', () => {
      expect(isValidJerseyImageUrl('http://example.com/jersey.jpg')).toBe(true);
    });

    it('deve retornar true para URLs válidas com protocolo https', () => {
      expect(isValidJerseyImageUrl('https://example.com/jersey.png')).toBe(true);
    });

    it('deve retornar true para caminhos relativos', () => {
      expect(isValidJerseyImageUrl('/images/jersey.jpg')).toBe(true);
      expect(isValidJerseyImageUrl('/lovable-uploads/abc123.png')).toBe(true);
    });

    it('deve retornar true para URLs do Supabase Storage', () => {
      expect(isValidJerseyImageUrl('https://xyz.supabase.co/storage/v1/object/public/jerseys/camisa.png')).toBe(true);
    });
  });

  describe('getReliableJerseyImageUrl', () => {
    const createMockJersey = (overrides = {}) => ({
      id: 'test-jersey-id',
      image_url: 'https://valid-url.com/jersey.jpg',
      years: [2020],
      ...overrides
    });

    it('deve retornar URL do banco quando válida', () => {
      const jersey = createMockJersey();
      const result = getReliableJerseyImageUrl(jersey);
      expect(result).toBe('https://valid-url.com/jersey.jpg');
    });

    it('deve retornar imagem padrão para URL inválida', () => {
      const jersey = createMockJersey({ image_url: 'data:image/png;base64,abc' });
      const result = getReliableJerseyImageUrl(jersey);
      expect(result).toBe(jerseyDefaultImage);
    });

    it('deve retornar imagem padrão para URL gstatic', () => {
      const jersey = createMockJersey({ 
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:abc123' 
      });
      const result = getReliableJerseyImageUrl(jersey);
      expect(result).toBe(jerseyDefaultImage);
    });

    it('deve retornar imagem padrão para URL vazia', () => {
      const jersey = createMockJersey({ image_url: '' });
      const result = getReliableJerseyImageUrl(jersey);
      expect(result).toBe(jerseyDefaultImage);
    });

    it('deve cachear resultado para mesma camisa', () => {
      const jersey = createMockJersey();
      
      const result1 = getReliableJerseyImageUrl(jersey);
      const result2 = getReliableJerseyImageUrl(jersey);
      
      expect(result1).toBe(result2);
    });

    it('deve limpar cache quando clearJerseyImageUrlCache é chamado', () => {
      const jersey = createMockJersey();
      
      getReliableJerseyImageUrl(jersey);
      clearJerseyImageUrlCache();
      
      // Modificar a jersey para verificar que cache foi limpo
      const modifiedJersey = createMockJersey({ 
        id: 'test-jersey-id', 
        image_url: 'https://new-url.com/jersey.jpg' 
      });
      const result = getReliableJerseyImageUrl(modifiedJersey);
      
      expect(result).toBe('https://new-url.com/jersey.jpg');
    });
  });

  describe('jerseyDefaultImage', () => {
    it('deve ser uma URL válida', () => {
      expect(jerseyDefaultImage).toBeTruthy();
      expect(jerseyDefaultImage.startsWith('/')).toBe(true);
    });

    it('não deve ser uma URL externa', () => {
      expect(jerseyDefaultImage).not.toContain('http://');
      expect(jerseyDefaultImage).not.toContain('https://');
    });
  });
});
