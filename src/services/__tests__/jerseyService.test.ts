import { describe, it, expect, vi, beforeEach } from 'vitest';
import { jerseyService } from '../jerseyService';
import type { Jersey } from '@/types/jersey-game';
import type { DifficultyLevel } from '@/types/guess-game';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    functions: { invoke: vi.fn() },
  },
}));

vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/utils/jersey-game', () => ({
  generateYearOptions: vi.fn((years: number[]) => [
    { year: years[0], label: String(years[0]) },
    { year: years[0] + 1, label: String(years[0] + 1) },
    { year: years[0] + 2, label: String(years[0] + 2) },
  ]),
  checkYearOption: vi.fn((selected: number, correct: number[]) => correct.includes(selected)),
}));

const createMockJersey = (id: string, difficulty: DifficultyLevel, years: number[] = [1990]): Jersey => ({
  id,
  years,
  image_url: `https://example.com/jersey-${id}.jpg`,
  type: 'home',
  manufacturer: 'Umbro',
  season: '1990/1991',
  title: `Camisa ${id}`,
  fun_fact: null,
  nicknames: null,
  difficulty_level: difficulty,
  difficulty_score: 50,
  difficulty_confidence: 0.8,
  total_attempts: null,
  correct_attempts: null,
  average_guess_time: null,
  decades: ['1990s'],
  created_at: '2024-01-01T00:00:00Z',
});

describe('jerseyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('selectJerseyByDifficulty', () => {
    const jerseys: Jersey[] = [
      createMockJersey('1', 'facil'),
      createMockJersey('2', 'facil'),
      createMockJersey('3', 'medio'),
      createMockJersey('4', 'dificil'),
    ];

    it('returns a jersey matching the requested difficulty', () => {
      const result = jerseyService.selectJerseyByDifficulty(jerseys, 'facil', new Set());
      expect(result).not.toBeNull();
      expect(result!.difficulty_level).toBe('facil');
    });

    it('excludes jerseys in usedIds', () => {
      const usedIds = new Set(['1']);
      const result = jerseyService.selectJerseyByDifficulty(jerseys, 'facil', usedIds);
      expect(result).not.toBeNull();
      expect(result!.id).toBe('2');
    });

    it('returns null if all jerseys of that difficulty are used', () => {
      const usedIds = new Set(['1', '2']);
      const result = jerseyService.selectJerseyByDifficulty(jerseys, 'facil', usedIds);
      expect(result).toBeNull();
    });

    it('returns null for empty jersey array', () => {
      const result = jerseyService.selectJerseyByDifficulty([], 'facil', new Set());
      expect(result).toBeNull();
    });

    it('returns null when no jersey matches difficulty', () => {
      const result = jerseyService.selectJerseyByDifficulty(jerseys, 'muito_dificil', new Set());
      expect(result).toBeNull();
    });

    it('selects randomly from available pool', () => {
      const manyJerseys = Array.from({ length: 20 }, (_, i) =>
        createMockJersey(String(i), 'medio')
      );
      const selectedIds = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const r = jerseyService.selectJerseyByDifficulty(manyJerseys, 'medio', new Set());
        if (r) selectedIds.add(r.id);
      }
      expect(selectedIds.size).toBeGreaterThan(1);
    });
  });

  describe('selectRandomJersey', () => {
    const jerseys: Jersey[] = [
      createMockJersey('a', 'facil'),
      createMockJersey('b', 'medio'),
      createMockJersey('c', 'dificil'),
    ];

    it('returns a jersey when none are used', () => {
      const result = jerseyService.selectRandomJersey(jerseys, new Set());
      expect(result).not.toBeNull();
    });

    it('excludes used jersey ids', () => {
      const usedIds = new Set(['a', 'b']);
      const result = jerseyService.selectRandomJersey(jerseys, usedIds);
      expect(result).not.toBeNull();
      expect(result!.id).toBe('c');
    });

    it('returns null when all jerseys are used', () => {
      const usedIds = new Set(['a', 'b', 'c']);
      const result = jerseyService.selectRandomJersey(jerseys, usedIds);
      expect(result).toBeNull();
    });

    it('returns null for empty jersey array', () => {
      const result = jerseyService.selectRandomJersey([], new Set());
      expect(result).toBeNull();
    });
  });

  describe('generateOptions', () => {
    it('calls generateYearOptions with correct years', () => {
      const result = jerseyService.generateOptions([1990, 1991]);
      expect(result).toHaveLength(3);
    });
  });

  describe('checkOptionSelection', () => {
    it('returns true when selected year is in correctYears', () => {
      expect(jerseyService.checkOptionSelection(1990, [1990, 1991])).toBe(true);
    });

    it('returns false when selected year is not in correctYears', () => {
      expect(jerseyService.checkOptionSelection(1995, [1990, 1991])).toBe(false);
    });
  });

  describe('calculatePoints', () => {
    it('returns 0 points for incorrect answer', () => {
      const result = jerseyService.calculatePoints(false, 1.5, 15, 30);
      expect(result.points).toBe(0);
      expect(result.bonus).toBe(0);
    });

    it('returns base points for correct answer', () => {
      const result = jerseyService.calculatePoints(true, 1.0, 15, 30);
      expect(result.points).toBe(10);
    });

    it('applies difficulty multiplier to points', () => {
      const result = jerseyService.calculatePoints(true, 2.0, 15, 30);
      expect(result.points).toBe(20);
    });

    it('adds bonus for very fast response (>70% time remaining)', () => {
      const result = jerseyService.calculatePoints(true, 1.0, 25, 30); // ~83%
      expect(result.bonus).toBeGreaterThan(5); // base bonus + speed bonus
    });

    it('adds smaller bonus for fast response (40-70% time remaining)', () => {
      const result = jerseyService.calculatePoints(true, 1.0, 15, 30); // 50%
      expect(result.bonus).toBeGreaterThanOrEqual(6); // base 5 + 1
    });

    it('handles zero totalTime without crashing', () => {
      const result = jerseyService.calculatePoints(true, 1.0, 0, 0);
      expect(result.points).toBeGreaterThan(0);
    });
  });

  describe('checkGuess', () => {
    it('returns isCorrect true for exact year match', () => {
      const result = jerseyService.checkGuess(1990, [1990, 1991]);
      expect(result.isCorrect).toBe(true);
      expect(result.yearDifference).toBe(0);
    });

    it('returns isCorrect false for wrong year', () => {
      const result = jerseyService.checkGuess(1995, [1990, 1991]);
      expect(result.isCorrect).toBe(false);
      expect(result.yearDifference).toBeGreaterThan(0);
    });

    it('provides "higher" hint when guess is below closest year', () => {
      const result = jerseyService.checkGuess(1985, [1990]);
      expect(result.hint).toBe('higher');
    });

    it('provides "lower" hint when guess is above closest year', () => {
      const result = jerseyService.checkGuess(1995, [1990]);
      expect(result.hint).toBe('lower');
    });

    it('returns no hint on exact match', () => {
      const result = jerseyService.checkGuess(1990, [1990]);
      expect(result.hint).toBeUndefined();
    });

    it('finds closest year among multiple valid years', () => {
      const result = jerseyService.checkGuess(1992, [1990, 1995]);
      expect(result.yearDifference).toBe(2);
    });

    it('returns matchedYear on exact hit', () => {
      const result = jerseyService.checkGuess(1991, [1990, 1991, 1992]);
      expect(result.matchedYear).toBe(1991);
    });
  });
});
