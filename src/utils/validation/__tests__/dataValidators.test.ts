
import { describe, it, expect } from 'vitest';
import { validateImageUrl, validatePlayerData, validateNumber } from '../dataValidators';

describe('dataValidators', () => {
  describe('validateImageUrl', () => {
    it('should return valid for proper image URLs', () => {
      const result = validateImageUrl('https://example.com/image.jpg');
      expect(result.isValid).toBe(true);
    });

    it('should return fallback for null/undefined URLs', () => {
      const result = validateImageUrl(null);
      expect(result.isValid).toBe(false);
      expect(result.sanitizedData).toBe('/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png');
    });

    it('should validate Supabase URLs', () => {
      const result = validateImageUrl('https://supabase.co/storage/image.png');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePlayerData', () => {
    it('should validate complete player data', () => {
      const player = {
        id: '1',
        name: 'Romário',
        position: 'Atacante',
        image_url: 'https://example.com/romario.jpg'
      };
      const result = validatePlayerData(player);
      expect(result.isValid).toBe(true);
    });

    it('should reject player without required fields', () => {
      const player = { name: 'Romário' };
      const result = validatePlayerData(player);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('id');
    });
  });

  describe('validateNumber', () => {
    it('should validate proper numbers', () => {
      const result = validateNumber(42);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData).toBe(42);
    });

    it('should sanitize invalid numbers', () => {
      const result = validateNumber('not a number');
      expect(result.isValid).toBe(false);
      expect(result.sanitizedData).toBe(0);
    });

    it('should enforce min/max constraints', () => {
      const result = validateNumber(-5, 0, 100);
      expect(result.isValid).toBe(false);
      expect(result.sanitizedData).toBe(0);
    });
  });
});
