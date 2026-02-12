import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isCorrectGuess, processPlayerName } from '../name-processor';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

describe('name-processor (expanded)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('isCorrectGuess - text normalization', () => {
    it('should normalize accents for comparison', () => {
      expect(isCorrectGuess('jose', 'José')).toBe(true);
      expect(isCorrectGuess('angelo', 'Ângelo')).toBe(true);
      expect(isCorrectGuess('joao', 'João')).toBe(true);
    });

    it('should handle complex accent combinations', () => {
      expect(isCorrectGuess('romario', 'Romário')).toBe(true);
      expect(isCorrectGuess('zico', 'Zicó')).toBe(true);
      expect(isCorrectGuess('pele', 'Pelé')).toBe(true);
    });

    it('should handle cedilla', () => {
      expect(isCorrectGuess('goncalves', 'Gonçalves')).toBe(true);
      expect(isCorrectGuess('acacio', 'Acácio')).toBe(true);
    });

    it('should handle tilde', () => {
      expect(isCorrectGuess('joao', 'João')).toBe(true);
      expect(isCorrectGuess('germano', 'Germão')).toBe(true);
    });

    it('should handle umlaut and other diacritics', () => {
      expect(isCorrectGuess('muller', 'Müller')).toBe(true);
    });
  });

  describe('isCorrectGuess - case sensitivity', () => {
    it('should be case insensitive', () => {
      expect(isCorrectGuess('FRED', 'Fred')).toBe(true);
      expect(isCorrectGuess('fred', 'FRED')).toBe(true);
      expect(isCorrectGuess('FrEd', 'fReD')).toBe(true);
    });

    it('should handle all uppercase input', () => {
      expect(isCorrectGuess('ROMÁRIO', 'Romário')).toBe(true);
      expect(isCorrectGuess('THIAGO SILVA', 'Thiago Silva')).toBe(true);
    });

    it('should handle all lowercase input', () => {
      expect(isCorrectGuess('romário', 'ROMÁRIO')).toBe(true);
      expect(isCorrectGuess('thiago silva', 'THIAGO SILVA')).toBe(true);
    });
  });

  describe('isCorrectGuess - partial matching', () => {
    it('should match when guess is contained in target', () => {
      expect(isCorrectGuess('fred', 'Fred Chaves Guedes')).toBe(true);
      expect(isCorrectGuess('thiago', 'Thiago Silva')).toBe(true);
    });

    it('should match when target is contained in guess', () => {
      expect(isCorrectGuess('Fred Chaves', 'Fred')).toBe(true);
      expect(isCorrectGuess('Romário de Souza Faria', 'Romário')).toBe(true);
    });

    it('should match individual words (> 2 chars)', () => {
      expect(isCorrectGuess('Chaves', 'Fred Chaves Guedes')).toBe(true);
      expect(isCorrectGuess('Silva', 'Thiago Silva')).toBe(true);
    });

    it('should not match very short words', () => {
      // Words with 2 or fewer chars are filtered out
      expect(isCorrectGuess('da', 'Fred da Silva')).toBe(false);
      expect(isCorrectGuess('de', 'Romário de Souza')).toBe(false);
    });

    it('should handle multi-word matching', () => {
      expect(isCorrectGuess('Thiago', 'Thiago Silva')).toBe(true);
      expect(isCorrectGuess('Silva', 'Thiago Silva')).toBe(true);
    });
  });

  describe('isCorrectGuess - special characters', () => {
    it('should remove special characters before comparison', () => {
      expect(isCorrectGuess('fred!', 'Fred')).toBe(true);
      expect(isCorrectGuess('romario?', 'Romário')).toBe(true);
    });

    it('should handle apostrophes', () => {
      expect(isCorrectGuess("O'Brien", "OBrien")).toBe(true);
    });

    it('should handle hyphens', () => {
      expect(isCorrectGuess('Jean-Pierre', 'JeanPierre')).toBe(true);
    });

    it('should handle multiple spaces', () => {
      expect(isCorrectGuess('Fred  Chaves', 'Fred Chaves')).toBe(true);
    });
  });

  describe('isCorrectGuess - edge cases', () => {
    it('should return false for empty guess', () => {
      expect(isCorrectGuess('', 'Romário')).toBe(false);
    });

    it('should return false for empty player name', () => {
      expect(isCorrectGuess('Romário', '')).toBe(false);
    });

    it('should return false for completely different names', () => {
      expect(isCorrectGuess('Bebeto', 'Romário')).toBe(false);
      expect(isCorrectGuess('Zico', 'Fred')).toBe(false);
    });

    it('should handle whitespace-only input', () => {
      expect(isCorrectGuess('   ', 'Fred')).toBe(false);
    });

    it('should handle exact match', () => {
      expect(isCorrectGuess('Romário', 'Romário')).toBe(true);
    });

    it('should handle numbers in names', () => {
      expect(isCorrectGuess('Player123', 'Player123')).toBe(true);
    });
  });

  describe('isCorrectGuess - real player examples', () => {
    it('should match common Fluminense legends', () => {
      expect(isCorrectGuess('romario', 'Romário')).toBe(true);
      expect(isCorrectGuess('fred', 'Fred')).toBe(true);
      expect(isCorrectGuess('thiago silva', 'Thiago Silva')).toBe(true);
      expect(isCorrectGuess('marcelo', 'Marcelo')).toBe(true);
    });

    it('should match by nickname patterns', () => {
      expect(isCorrectGuess('baixinho', 'Romário Baixinho')).toBe(true);
    });

    it('should handle compound surnames', () => {
      expect(isCorrectGuess('Souza Faria', 'Romário de Souza Faria')).toBe(true);
    });
  });

  describe('processPlayerName', () => {
    it('should be exported as async function', () => {
      expect(typeof processPlayerName).toBe('function');
    });

    it('should return NameProcessingResult structure', async () => {
      // This test verifies the return type structure
      // Actual database calls are mocked
      const { supabase } = await import('@/integrations/supabase/client');
      
      (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { name: 'Fred', nicknames: ['Fredinho'] },
              error: null
            })
          })
        })
      });

      const result = await processPlayerName('fred', 'Fred', 'test-id');
      
      expect(result).toHaveProperty('processedName');
      expect(result).toHaveProperty('confidence');
    });

    it('should return confidence 0 on database error', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error')
            })
          })
        })
      });

      const result = await processPlayerName('test', 'Test', 'test-id');
      
      expect(result.confidence).toBe(0);
      expect(result.processedName).toBeNull();
    });

    it('should return confidence 0.9 for name match', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { name: 'Fred', nicknames: [] },
              error: null
            })
          })
        })
      });

      const result = await processPlayerName('fred', 'Fred', 'test-id');
      
      expect(result.confidence).toBe(0.9);
      expect(result.matchType).toBe('name');
    });

    it('should return confidence 0.85 for nickname match', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { name: 'Romário', nicknames: ['Baixinho'] },
              error: null
            })
          })
        })
      });

      const result = await processPlayerName('baixinho', 'Romário', 'test-id');
      
      expect(result.confidence).toBe(0.85);
      expect(result.matchType).toBe('nickname');
    });

    it('should handle empty nicknames array', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { name: 'Fred', nicknames: null },
              error: null
            })
          })
        })
      });

      const result = await processPlayerName('wrong', 'Fred', 'test-id');
      
      expect(result.confidence).toBe(0);
    });
  });
});
