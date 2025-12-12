import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  validateImageUrl, 
  validatePlayerData, 
  validateApiResponse,
  withRetry,
  sanitizeString,
  validateNumber
} from '../dataValidators';

describe('dataValidators (expanded)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('validateImageUrl', () => {
    describe('valid URLs', () => {
      it('should accept valid image URLs with common extensions', () => {
        const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        
        extensions.forEach(ext => {
          const result = validateImageUrl(`https://example.com/image${ext}`);
          expect(result.isValid).toBe(true);
        });
      });

      it('should accept Supabase URLs', () => {
        const result = validateImageUrl('https://supabase.co/storage/v1/object/public/image.png');
        expect(result.isValid).toBe(true);
      });

      it('should accept lovable-uploads URLs', () => {
        const result = validateImageUrl('https://example.com/lovable-uploads/image.png');
        expect(result.isValid).toBe(true);
      });

      it('should return sanitizedData as the URL', () => {
        const url = 'https://example.com/image.jpg';
        const result = validateImageUrl(url);
        expect(result.sanitizedData).toBe(url);
      });
    });

    describe('invalid URLs', () => {
      it('should reject null URL', () => {
        const result = validateImageUrl(null);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('não fornecida');
      });

      it('should reject undefined URL', () => {
        const result = validateImageUrl(undefined);
        expect(result.isValid).toBe(false);
      });

      it('should reject empty string', () => {
        const result = validateImageUrl('');
        expect(result.isValid).toBe(false);
      });

      it('should reject malformed URLs', () => {
        const result = validateImageUrl('not-a-valid-url');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('inválida');
      });

      it('should provide fallback image on invalid', () => {
        const result = validateImageUrl(null);
        expect(result.sanitizedData).toContain('lovable-uploads');
      });
    });

    describe('extension validation', () => {
      it('should warn about URLs without image extensions', () => {
        const result = validateImageUrl('https://example.com/file.pdf');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('não parece ser uma imagem');
      });

      it('should accept URLs with extensions in path (case insensitive)', () => {
        const result = validateImageUrl('https://example.com/IMAGE.JPG');
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('validatePlayerData', () => {
    describe('valid player data', () => {
      it('should accept complete player data', () => {
        const player = {
          id: '123',
          name: 'Romário',
          image_url: 'https://example.com/romario.jpg',
          position: 'Atacante'
        };
        
        const result = validatePlayerData(player);
        expect(result.isValid).toBe(true);
      });

      it('should sanitize player data', () => {
        const player = {
          id: 123, // number
          name: '  Romário  ', // with spaces
          image_url: null,
          position: undefined
        };
        
        const result = validatePlayerData(player);
        expect(result.sanitizedData.id).toBe('123');
        expect(result.sanitizedData.name).toBe('Romário');
        expect(result.sanitizedData.position).toBe('Não informado');
      });
    });

    describe('invalid player data', () => {
      it('should reject null player', () => {
        const result = validatePlayerData(null);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('não fornecidos');
      });

      it('should reject undefined player', () => {
        const result = validatePlayerData(undefined);
        expect(result.isValid).toBe(false);
      });

      it('should reject player without id', () => {
        const player = { name: 'Romário' };
        const result = validatePlayerData(player);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('id');
      });

      it('should reject player without name', () => {
        const player = { id: '123' };
        const result = validatePlayerData(player);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('name');
      });

      it('should list all missing required fields', () => {
        const player = {};
        const result = validatePlayerData(player);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('id');
        expect(result.error).toContain('name');
      });
    });

    describe('default values', () => {
      it('should use default for missing image_url', () => {
        const player = { id: '1', name: 'Test' };
        const result = validatePlayerData(player);
        expect(result.sanitizedData.image_url).toBeNull();
      });

      it('should use default for missing position', () => {
        const player = { id: '1', name: 'Test' };
        const result = validatePlayerData(player);
        expect(result.sanitizedData.position).toBe('Não informado');
      });

      it('should use default for missing period', () => {
        const player = { id: '1', name: 'Test' };
        const result = validatePlayerData(player);
        expect(result.sanitizedData.period).toBe('Não informado');
      });
    });
  });

  describe('validateApiResponse', () => {
    describe('valid responses', () => {
      it('should accept non-empty data', () => {
        const data = { key: 'value' };
        const result = validateApiResponse(data);
        expect(result.isValid).toBe(true);
      });

      it('should accept non-empty array', () => {
        const data = [{ id: 1 }, { id: 2 }];
        const result = validateApiResponse(data);
        expect(result.isValid).toBe(true);
      });

      it('should return data as sanitizedData', () => {
        const data = { key: 'value' };
        const result = validateApiResponse(data);
        expect(result.sanitizedData).toEqual(data);
      });
    });

    describe('invalid responses', () => {
      it('should reject null data', () => {
        const result = validateApiResponse(null);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('vazia');
      });

      it('should reject undefined data', () => {
        const result = validateApiResponse(undefined);
        expect(result.isValid).toBe(false);
      });

      it('should reject empty array', () => {
        const result = validateApiResponse([]);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Array vazio');
      });
    });

    describe('expected fields validation', () => {
      it('should validate expected fields in object', () => {
        const data = { id: 1, name: 'Test' };
        const result = validateApiResponse(data, ['id', 'name']);
        expect(result.isValid).toBe(true);
      });

      it('should validate expected fields in first array element', () => {
        const data = [{ id: 1, name: 'Test' }];
        const result = validateApiResponse(data, ['id', 'name']);
        expect(result.isValid).toBe(true);
      });

      it('should reject if expected fields are missing', () => {
        const data = { id: 1 };
        const result = validateApiResponse(data, ['id', 'name', 'email']);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('name');
        expect(result.error).toContain('email');
      });

      it('should pass if no expected fields specified', () => {
        const data = { anything: 'works' };
        const result = validateApiResponse(data);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('withRetry', () => {
    it('should return result on first success', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      
      const result = await withRetry(fn);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('First fail'))
        .mockResolvedValue('success');
      
      const result = await withRetry(fn, 3, 10);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Always fails'));
      
      await expect(withRetry(fn, 3, 10)).rejects.toThrow('Always fails');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should use increasing delays', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');
      
      const start = Date.now();
      await withRetry(fn, 3, 10);
      const elapsed = Date.now() - start;
      
      // delay * 1 + delay * 2 = 30ms minimum
      expect(elapsed).toBeGreaterThanOrEqual(20);
    });

    it('should log attempt numbers', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success');
      
      await withRetry(fn, 3, 10);
      
      expect(console.log).toHaveBeenCalled();
    });

    it('should log errors', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Failed'));
      
      try {
        await withRetry(fn, 2, 10);
      } catch {
        // Expected
      }
      
      expect(console.error).toHaveBeenCalled();
    });

    it('should use default values', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      
      await withRetry(fn);
      
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should remove extra internal spaces', () => {
      expect(sanitizeString('hello    world')).toBe('hello world');
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeString('hello<script>world')).toBe('helloscriptworld');
      expect(sanitizeString('test>injection')).toBe('testinjection');
    });

    it('should handle non-string input', () => {
      expect(sanitizeString(123)).toBe('123');
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
    });

    it('should handle empty string', () => {
      expect(sanitizeString('')).toBe('');
    });

    it('should preserve normal characters', () => {
      expect(sanitizeString('Romário é um jogador')).toBe('Romário é um jogador');
    });

    it('should handle boolean input', () => {
      expect(sanitizeString(true as any)).toBe('true');
      expect(sanitizeString(false as any)).toBe('false');
    });

    it('should handle object input', () => {
      expect(sanitizeString({} as any)).toBe('[object Object]');
    });
  });

  describe('validateNumber', () => {
    describe('valid numbers', () => {
      it('should accept valid integers', () => {
        const result = validateNumber(42);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedData).toBe(42);
      });

      it('should accept valid floats', () => {
        const result = validateNumber(3.14);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedData).toBe(3.14);
      });

      it('should accept zero', () => {
        const result = validateNumber(0);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedData).toBe(0);
      });

      it('should accept negative numbers', () => {
        const result = validateNumber(-5);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedData).toBe(-5);
      });

      it('should convert numeric strings', () => {
        const result = validateNumber('42');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedData).toBe(42);
      });
    });

    describe('invalid numbers', () => {
      it('should reject NaN', () => {
        const result = validateNumber(NaN);
        expect(result.isValid).toBe(false);
        expect(result.sanitizedData).toBe(0);
      });

      it('should reject non-numeric strings', () => {
        const result = validateNumber('not a number');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('não é um número');
      });

      it('should reject undefined', () => {
        const result = validateNumber(undefined);
        expect(result.isValid).toBe(false);
      });

      it('should reject null', () => {
        const result = validateNumber(null);
        expect(result.isValid).toBe(false);
      });
    });

    describe('min/max constraints', () => {
      it('should reject below minimum', () => {
        const result = validateNumber(5, 10);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('maior ou igual a 10');
        expect(result.sanitizedData).toBe(10);
      });

      it('should reject above maximum', () => {
        const result = validateNumber(150, 0, 100);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('menor ou igual a 100');
        expect(result.sanitizedData).toBe(100);
      });

      it('should accept value at minimum', () => {
        const result = validateNumber(10, 10, 100);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedData).toBe(10);
      });

      it('should accept value at maximum', () => {
        const result = validateNumber(100, 0, 100);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedData).toBe(100);
      });

      it('should accept value within range', () => {
        const result = validateNumber(50, 0, 100);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedData).toBe(50);
      });

      it('should work with only min specified', () => {
        const result = validateNumber(100, 50);
        expect(result.isValid).toBe(true);
      });

      it('should work with only max specified', () => {
        const result = validateNumber(50, undefined, 100);
        expect(result.isValid).toBe(true);
      });
    });
  });
});
