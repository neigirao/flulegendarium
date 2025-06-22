
import { describe, it, expect } from 'vitest';
import { isCorrectGuess } from '../name-processor';

describe('name-processor', () => {
  describe('isCorrectGuess', () => {
    it('should return true for exact name match', () => {
      expect(isCorrectGuess('Romário', 'Romário')).toBe(true);
    });

    it('should return true for case insensitive match', () => {
      expect(isCorrectGuess('romário', 'Romário')).toBe(true);
      expect(isCorrectGuess('ROMÁRIO', 'Romário')).toBe(true);
    });

    it('should return true for name without accents', () => {
      expect(isCorrectGuess('romario', 'Romário')).toBe(true);
      expect(isCorrectGuess('ROMARIO', 'Romário')).toBe(true);
    });

    it('should return false for different names', () => {
      expect(isCorrectGuess('Bebeto', 'Romário')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(isCorrectGuess('', 'Romário')).toBe(false);
      expect(isCorrectGuess('Romário', '')).toBe(false);
    });

    it('should handle partial matches', () => {
      expect(isCorrectGuess('Rom', 'Romário')).toBe(false);
      expect(isCorrectGuess('Romário Silva', 'Romário')).toBe(true);
    });
  });
});
