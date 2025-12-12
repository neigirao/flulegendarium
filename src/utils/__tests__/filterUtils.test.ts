import { describe, it, expect } from 'vitest';
import { containsForbiddenWord, isValidPlayerName } from '../filterUtils';

describe('filterUtils', () => {
  describe('containsForbiddenWord', () => {
    describe('profanity detection', () => {
      it('should detect profanity in text', () => {
        expect(containsForbiddenWord('porra')).toBe(true);
        expect(containsForbiddenWord('caralho')).toBe(true);
        expect(containsForbiddenWord('merda')).toBe(true);
      });

      it('should detect profanity regardless of case', () => {
        expect(containsForbiddenWord('PORRA')).toBe(true);
        expect(containsForbiddenWord('Caralho')).toBe(true);
        expect(containsForbiddenWord('MeRdA')).toBe(true);
      });

      it('should detect profanity within longer text', () => {
        expect(containsForbiddenWord('que porra é essa')).toBe(true);
        expect(containsForbiddenWord('isso é uma merda')).toBe(true);
      });
    });

    describe('rival team detection', () => {
      it('should detect Flamengo references', () => {
        expect(containsForbiddenWord('flamengo')).toBe(true);
        expect(containsForbiddenWord('fla')).toBe(true);
        expect(containsForbiddenWord('mengo')).toBe(true);
        expect(containsForbiddenWord('mengão')).toBe(true);
        expect(containsForbiddenWord('urubu')).toBe(true);
      });

      it('should detect Vasco references', () => {
        expect(containsForbiddenWord('vasco')).toBe(true);
        expect(containsForbiddenWord('vascão')).toBe(true);
        expect(containsForbiddenWord('cruzmaltino')).toBe(true);
        expect(containsForbiddenWord('gigante da colina')).toBe(true);
      });

      it('should detect Botafogo references', () => {
        expect(containsForbiddenWord('botafogo')).toBe(true);
        expect(containsForbiddenWord('fogão')).toBe(true);
        expect(containsForbiddenWord('glorioso')).toBe(true);
        expect(containsForbiddenWord('estrela solitária')).toBe(true);
      });

      it('should detect rival teams regardless of case', () => {
        expect(containsForbiddenWord('FLAMENGO')).toBe(true);
        expect(containsForbiddenWord('Vasco')).toBe(true);
        expect(containsForbiddenWord('BOTAFOGO')).toBe(true);
      });
    });

    describe('valid input handling', () => {
      it('should return false for valid player names', () => {
        expect(containsForbiddenWord('Romário')).toBe(false);
        expect(containsForbiddenWord('Fred')).toBe(false);
        expect(containsForbiddenWord('Thiago Silva')).toBe(false);
        expect(containsForbiddenWord('Marcelo')).toBe(false);
      });

      it('should return false for Fluminense references', () => {
        expect(containsForbiddenWord('fluminense')).toBe(false);
        expect(containsForbiddenWord('flu')).toBe(false);
        expect(containsForbiddenWord('tricolor')).toBe(false);
      });

      it('should return false for common football terms', () => {
        expect(containsForbiddenWord('gol')).toBe(false);
        expect(containsForbiddenWord('atacante')).toBe(false);
        expect(containsForbiddenWord('zagueiro')).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle empty string', () => {
        expect(containsForbiddenWord('')).toBe(false);
      });

      it('should handle null/undefined gracefully', () => {
        expect(containsForbiddenWord(null as any)).toBe(false);
        expect(containsForbiddenWord(undefined as any)).toBe(false);
      });

      it('should handle whitespace-only strings', () => {
        expect(containsForbiddenWord('   ')).toBe(false);
      });

      it('should handle strings with extra whitespace', () => {
        expect(containsForbiddenWord('  porra  ')).toBe(true);
        expect(containsForbiddenWord('  flamengo  ')).toBe(true);
      });

      it('should handle partial matches within words', () => {
        // "fla" is in the forbidden list, so any word containing it should match
        expect(containsForbiddenWord('fla')).toBe(true);
      });
    });

    describe('case sensitivity', () => {
      it('should be case insensitive for all checks', () => {
        const testWords = ['PORRA', 'Porra', 'pOrRa', 'FLAMENGO', 'Flamengo', 'flAmEnGo'];
        testWords.forEach(word => {
          expect(containsForbiddenWord(word)).toBe(true);
        });
      });
    });
  });

  describe('isValidPlayerName', () => {
    describe('valid names', () => {
      it('should accept valid player names', () => {
        expect(isValidPlayerName('Romário')).toBe(true);
        expect(isValidPlayerName('Fred')).toBe(true);
        expect(isValidPlayerName('Thiago Silva')).toBe(true);
      });

      it('should accept names with accents', () => {
        expect(isValidPlayerName('José')).toBe(true);
        expect(isValidPlayerName('Ângelo')).toBe(true);
        expect(isValidPlayerName('João Paulo')).toBe(true);
      });

      it('should accept names with minimum 2 characters', () => {
        expect(isValidPlayerName('Ed')).toBe(true);
        expect(isValidPlayerName('Zé')).toBe(true);
      });
    });

    describe('invalid names - forbidden words', () => {
      it('should reject names containing profanity', () => {
        expect(isValidPlayerName('porra')).toBe(false);
        expect(isValidPlayerName('merda player')).toBe(false);
      });

      it('should reject names containing rival team references', () => {
        expect(isValidPlayerName('flamengo lover')).toBe(false);
        expect(isValidPlayerName('vascaino')).toBe(false);
        expect(isValidPlayerName('botafogo fan')).toBe(false);
      });
    });

    describe('invalid names - length', () => {
      it('should reject names shorter than 2 characters', () => {
        expect(isValidPlayerName('A')).toBe(false);
        expect(isValidPlayerName('Z')).toBe(false);
      });

      it('should reject empty strings', () => {
        expect(isValidPlayerName('')).toBe(false);
      });

      it('should reject whitespace-only strings', () => {
        expect(isValidPlayerName('   ')).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should trim names before validation', () => {
        expect(isValidPlayerName('  Fred  ')).toBe(true);
        expect(isValidPlayerName('  AB  ')).toBe(true);
      });

      it('should handle special characters', () => {
        expect(isValidPlayerName("O'Brien")).toBe(true);
        expect(isValidPlayerName('João-Carlos')).toBe(true);
      });

      it('should handle numbers in names', () => {
        expect(isValidPlayerName('Player123')).toBe(true);
      });
    });

    describe('combined validation', () => {
      it('should require both length and no forbidden words', () => {
        // Too short
        expect(isValidPlayerName('A')).toBe(false);
        
        // Contains forbidden word
        expect(isValidPlayerName('flamengo')).toBe(false);
        
        // Valid
        expect(isValidPlayerName('Valid Name')).toBe(true);
      });
    });
  });
});
