import { describe, it, expect } from 'vitest';
import { 
  fluminenseJerseySvg, 
  playerSilhouetteSvg, 
  getFallbackSvg 
} from '../fluminenseSvg';

describe('Fallback SVG Images', () => {
  describe('fluminenseJerseySvg', () => {
    it('should be a valid data URL', () => {
      expect(fluminenseJerseySvg).toMatch(/^data:image\/svg\+xml,/);
    });

    it('should contain SVG content', () => {
      expect(fluminenseJerseySvg).toContain('%3Csvg');
    });

    it('should contain Fluminense colors', () => {
      // Burgundy color encoded
      expect(fluminenseJerseySvg).toContain('780028');
      // Green color encoded
      expect(fluminenseJerseySvg).toContain('00543d');
    });

    it('should be usable as img src', () => {
      // Data URLs são sempre válidas como src
      expect(fluminenseJerseySvg.length).toBeGreaterThan(100);
    });
  });

  describe('playerSilhouetteSvg', () => {
    it('should be a valid data URL', () => {
      expect(playerSilhouetteSvg).toMatch(/^data:image\/svg\+xml,/);
    });

    it('should contain SVG content', () => {
      expect(playerSilhouetteSvg).toContain('%3Csvg');
    });

    it('should contain Fluminense colors', () => {
      expect(playerSilhouetteSvg).toContain('780028');
      expect(playerSilhouetteSvg).toContain('00543d');
    });
  });

  describe('getFallbackSvg', () => {
    it('should return jersey SVG for jersey type', () => {
      const result = getFallbackSvg('jersey');
      expect(result).toBe(fluminenseJerseySvg);
    });

    it('should return player SVG for player type', () => {
      const result = getFallbackSvg('player');
      expect(result).toBe(playerSilhouetteSvg);
    });

    it('should default to player SVG', () => {
      const result = getFallbackSvg();
      expect(result).toBe(playerSilhouetteSvg);
    });
  });

  describe('SVG Guarantee', () => {
    it('should never be empty', () => {
      expect(fluminenseJerseySvg).toBeTruthy();
      expect(playerSilhouetteSvg).toBeTruthy();
    });

    it('should not depend on external resources', () => {
      // Não deve conter URLs http/https
      expect(fluminenseJerseySvg).not.toContain('http://');
      expect(fluminenseJerseySvg).not.toContain('https://');
      expect(playerSilhouetteSvg).not.toContain('http://');
      expect(playerSilhouetteSvg).not.toContain('https://');
    });

    it('should be immediately available (no async loading)', () => {
      // Strings síncronas - sempre disponíveis
      expect(typeof fluminenseJerseySvg).toBe('string');
      expect(typeof playerSilhouetteSvg).toBe('string');
    });
  });
});
