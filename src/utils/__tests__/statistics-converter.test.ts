import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convertStatistics, PlayerStatistics } from '../statistics-converter';

describe('statistics-converter', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('convertStatistics', () => {
    describe('valid object input', () => {
      it('should convert valid statistics object', () => {
        const stats = { gols: 100, jogos: 200 };
        const result = convertStatistics(stats);
        
        expect(result).toEqual({ gols: 100, jogos: 200 });
      });

      it('should handle statistics with extra fields', () => {
        const stats = { gols: 50, jogos: 100, assists: 30, extra: 'field' };
        const result = convertStatistics(stats);
        
        expect(result).toEqual({ gols: 50, jogos: 100 });
      });

      it('should handle zero values', () => {
        const stats = { gols: 0, jogos: 0 };
        const result = convertStatistics(stats);
        
        expect(result).toEqual({ gols: 0, jogos: 0 });
      });

      it('should handle large numbers', () => {
        const stats = { gols: 1000000, jogos: 5000000 };
        const result = convertStatistics(stats);
        
        expect(result).toEqual({ gols: 1000000, jogos: 5000000 });
      });
    });

    describe('null/undefined handling', () => {
      it('should return defaults for null', () => {
        const result = convertStatistics(null);
        
        expect(result).toEqual({ gols: 0, jogos: 0 });
      });

      it('should return defaults for undefined', () => {
        const result = convertStatistics(undefined);
        
        expect(result).toEqual({ gols: 0, jogos: 0 });
      });

      it('should log warning for null/undefined', () => {
        convertStatistics(null);
        
        expect(console.warn).toHaveBeenCalledWith(
          'Statistics is null or undefined, using default values'
        );
      });
    });

    describe('string input (JSON parsing)', () => {
      it('should parse valid JSON string', () => {
        const jsonString = '{"gols": 75, "jogos": 150}';
        const result = convertStatistics(jsonString);
        
        expect(result).toEqual({ gols: 75, jogos: 150 });
      });

      it('should handle JSON string with extra fields', () => {
        const jsonString = '{"gols": 25, "jogos": 50, "assists": 10}';
        const result = convertStatistics(jsonString);
        
        expect(result).toEqual({ gols: 25, jogos: 50 });
      });

      it('should return defaults for invalid JSON', () => {
        const invalidJson = 'not valid json';
        const result = convertStatistics(invalidJson);
        
        expect(result).toEqual({ gols: 0, jogos: 0 });
      });

      it('should log error for invalid JSON', () => {
        const invalidJson = '{broken json';
        convertStatistics(invalidJson);
        
        expect(console.error).toHaveBeenCalled();
      });

      it('should handle empty string', () => {
        const result = convertStatistics('');
        
        expect(result).toEqual({ gols: 0, jogos: 0 });
      });
    });

    describe('invalid data types', () => {
      it('should return defaults for number input', () => {
        const result = convertStatistics(42 as unknown as Parameters<typeof convertStatistics>[0]);
        
        expect(result).toEqual({ gols: 0, jogos: 0 });
      });

      it('should return defaults for boolean input', () => {
        const result = convertStatistics(true as unknown as Parameters<typeof convertStatistics>[0]);
        
        expect(result).toEqual({ gols: 0, jogos: 0 });
      });

      it('should return defaults for array input', () => {
        const result = convertStatistics([1, 2, 3] as unknown as Parameters<typeof convertStatistics>[0]);
        
        expect(result).toEqual({ gols: 0, jogos: 0 });
      });

      it('should log warning for unexpected types', () => {
        convertStatistics(42 as unknown as Parameters<typeof convertStatistics>[0]);
        
        expect(console.warn).toHaveBeenCalled();
      });
    });

    describe('non-negative value enforcement', () => {
      it('should convert negative gols to 0', () => {
        const stats = { gols: -10, jogos: 50 };
        const result = convertStatistics(stats);
        
        expect(result.gols).toBe(0);
        expect(result.jogos).toBe(50);
      });

      it('should convert negative jogos to 0', () => {
        const stats = { gols: 30, jogos: -5 };
        const result = convertStatistics(stats);
        
        expect(result.gols).toBe(30);
        expect(result.jogos).toBe(0);
      });

      it('should handle both negative values', () => {
        const stats = { gols: -100, jogos: -200 };
        const result = convertStatistics(stats);
        
        expect(result).toEqual({ gols: 0, jogos: 0 });
      });
    });

    describe('NaN handling', () => {
      it('should convert NaN gols to 0', () => {
        const stats = { gols: NaN, jogos: 50 };
        const result = convertStatistics(stats);
        
        expect(result.gols).toBe(0);
        expect(result.jogos).toBe(50);
      });

      it('should convert NaN jogos to 0', () => {
        const stats = { gols: 25, jogos: NaN };
        const result = convertStatistics(stats);
        
        expect(result.gols).toBe(25);
        expect(result.jogos).toBe(0);
      });

      it('should handle both NaN values', () => {
        const stats = { gols: NaN, jogos: NaN };
        const result = convertStatistics(stats);
        
        expect(result).toEqual({ gols: 0, jogos: 0 });
      });
    });

    describe('missing field handling', () => {
      it('should use 0 for missing gols', () => {
        const stats = { jogos: 100 };
        const result = convertStatistics(stats);
        
        expect(result).toEqual({ gols: 0, jogos: 100 });
      });

      it('should use 0 for missing jogos', () => {
        const stats = { gols: 50 };
        const result = convertStatistics(stats);
        
        expect(result).toEqual({ gols: 50, jogos: 0 });
      });

      it('should handle empty object', () => {
        const stats = {};
        const result = convertStatistics(stats);
        
        expect(result).toEqual({ gols: 0, jogos: 0 });
      });
    });

    describe('type coercion', () => {
      it('should handle string numbers in gols', () => {
        const stats = { gols: '50' as unknown as number, jogos: 100 };
        const result = convertStatistics(stats);
        
        // String '50' is not typeof 'number', so it becomes 0
        expect(result.gols).toBe(0);
      });

      it('should handle string numbers in jogos', () => {
        const stats = { gols: 50, jogos: '100' as unknown as number };
        const result = convertStatistics(stats);
        
        expect(result.jogos).toBe(0);
      });

      it('should handle null values in fields', () => {
        const stats = { gols: null, jogos: 100 };
        const result = convertStatistics(stats);
        
        expect(result.gols).toBe(0);
        expect(result.jogos).toBe(100);
      });

      it('should handle undefined values in fields', () => {
        const stats = { gols: undefined, jogos: 50 };
        const result = convertStatistics(stats);
        
        expect(result.gols).toBe(0);
        expect(result.jogos).toBe(50);
      });
    });

    describe('edge cases', () => {
      it('should handle decimal numbers', () => {
        const stats = { gols: 10.5, jogos: 20.7 };
        const result = convertStatistics(stats);
        
        // Decimals should be preserved
        expect(result.gols).toBe(10.5);
        expect(result.jogos).toBe(20.7);
      });

      it('should handle Infinity', () => {
        const stats = { gols: Infinity, jogos: 100 };
        const result = convertStatistics(stats);
        
        expect(result.gols).toBe(Infinity);
        expect(result.jogos).toBe(100);
      });

      it('should handle -Infinity', () => {
        const stats = { gols: -Infinity, jogos: 100 };
        const result = convertStatistics(stats);
        
        // -Infinity should be converted to 0 by Math.max(0, value)
        expect(result.gols).toBe(0);
        expect(result.jogos).toBe(100);
      });
    });
  });
});
