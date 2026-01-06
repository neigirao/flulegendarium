import { describe, it, expect } from 'vitest';
import {
  RankingEntrySchema,
  CreateRankingEntrySchema,
  RankingListSchema,
  RankingFiltersSchema,
} from '../ranking.schema';

describe('RankingEntrySchema', () => {
  it('should validate complete ranking entry', () => {
    const validEntry = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      playerName: 'João Silva',
      score: 1500,
      gameMode: 'adaptive',
      difficultyLevel: 'dificil',
      gamesPlayed: 25,
      userId: '123e4567-e89b-12d3-a456-426614174001',
      createdAt: '2024-01-15T10:00:00Z',
    };

    const result = RankingEntrySchema.parse(validEntry);
    expect(result.playerName).toBe('João Silva');
    expect(result.score).toBe(1500);
  });

  it('should apply default values', () => {
    const minimalEntry = {
      playerName: 'Guest Player',
      score: 100,
    };

    const result = RankingEntrySchema.parse(minimalEntry);
    expect(result.gameMode).toBe('classic');
    expect(result.gamesPlayed).toBe(1);
  });

  it('should trim whitespace from player name', () => {
    const entry = {
      playerName: '  João Silva  ',
      score: 100,
    };

    const result = RankingEntrySchema.parse(entry);
    expect(result.playerName).toBe('João Silva');
  });

  it('should reject empty player name', () => {
    const invalidEntry = {
      playerName: '',
      score: 100,
    };

    expect(() => RankingEntrySchema.parse(invalidEntry)).toThrow();
  });

  it('should reject whitespace-only player name', () => {
    const invalidEntry = {
      playerName: '   ',
      score: 100,
    };

    expect(() => RankingEntrySchema.parse(invalidEntry)).toThrow();
  });

  it('should reject player name over 100 characters', () => {
    const invalidEntry = {
      playerName: 'A'.repeat(101),
      score: 100,
    };

    expect(() => RankingEntrySchema.parse(invalidEntry)).toThrow();
  });

  it('should accept negative score after skipping player', () => {
    const entryWithNegativeScore = {
      playerName: 'Player',
      score: -50,
    };

    const result = RankingEntrySchema.parse(entryWithNegativeScore);
    expect(result.score).toBe(-50);
  });

  it('should reject non-integer score', () => {
    const invalidEntry = {
      playerName: 'Player',
      score: 100.5,
    };

    expect(() => RankingEntrySchema.parse(invalidEntry)).toThrow();
  });

  it('should accept null userId for guest players', () => {
    const guestEntry = {
      playerName: 'Guest',
      score: 50,
      userId: null,
    };

    const result = RankingEntrySchema.parse(guestEntry);
    expect(result.userId).toBeNull();
  });

  it('should validate all game modes', () => {
    const modes = ['classic', 'adaptive', 'decade'];
    
    modes.forEach(mode => {
      const entry = {
        playerName: 'Player',
        score: 100,
        gameMode: mode,
      };

      const result = RankingEntrySchema.parse(entry);
      expect(result.gameMode).toBe(mode);
    });
  });

  it('should reject invalid game mode', () => {
    const invalidEntry = {
      playerName: 'Player',
      score: 100,
      gameMode: 'invalid_mode',
    };

    expect(() => RankingEntrySchema.parse(invalidEntry)).toThrow();
  });
});

describe('CreateRankingEntrySchema', () => {
  it('should validate creation without id and createdAt', () => {
    const newEntry = {
      playerName: 'New Player',
      score: 200,
      gameMode: 'adaptive',
      difficultyLevel: 'medio',
    };

    const result = CreateRankingEntrySchema.parse(newEntry);
    expect(result.playerName).toBe('New Player');
    expect((result as any).id).toBeUndefined();
    expect((result as any).createdAt).toBeUndefined();
  });

  it('should strip id if provided', () => {
    const entryWithId = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      playerName: 'Player',
      score: 100,
    };

    const result = CreateRankingEntrySchema.parse(entryWithId);
    expect((result as any).id).toBeUndefined();
  });
});

describe('RankingListSchema', () => {
  it('should validate array of ranking entries', () => {
    const rankings = [
      { playerName: 'Player 1', score: 1000 },
      { playerName: 'Player 2', score: 800 },
      { playerName: 'Player 3', score: 600 },
    ];

    const result = RankingListSchema.parse(rankings);
    expect(result).toHaveLength(3);
    expect(result[0].score).toBe(1000);
  });

  it('should accept empty array', () => {
    const result = RankingListSchema.parse([]);
    expect(result).toEqual([]);
  });

  it('should reject array with invalid entry', () => {
    const rankings = [
      { playerName: 'Valid', score: 100 },
      { playerName: '', score: 50 }, // invalid
    ];

    expect(() => RankingListSchema.parse(rankings)).toThrow();
  });
});

describe('RankingFiltersSchema', () => {
  it('should validate complete filters', () => {
    const filters = {
      gameMode: 'adaptive',
      difficultyLevel: 'dificil',
      limit: 50,
      offset: 100,
    };

    const result = RankingFiltersSchema.parse(filters);
    expect(result.gameMode).toBe('adaptive');
    expect(result.limit).toBe(50);
    expect(result.offset).toBe(100);
  });

  it('should apply default values', () => {
    const result = RankingFiltersSchema.parse({});
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
  });

  it('should reject limit over 100', () => {
    const invalidFilters = { limit: 150 };
    expect(() => RankingFiltersSchema.parse(invalidFilters)).toThrow();
  });

  it('should reject limit less than 1', () => {
    const invalidFilters = { limit: 0 };
    expect(() => RankingFiltersSchema.parse(invalidFilters)).toThrow();
  });

  it('should reject negative offset', () => {
    const invalidFilters = { offset: -10 };
    expect(() => RankingFiltersSchema.parse(invalidFilters)).toThrow();
  });

  it('should allow optional game mode filter', () => {
    const filters = { difficultyLevel: 'facil' };
    const result = RankingFiltersSchema.parse(filters);
    expect(result.gameMode).toBeUndefined();
    expect(result.difficultyLevel).toBe('facil');
  });
});
