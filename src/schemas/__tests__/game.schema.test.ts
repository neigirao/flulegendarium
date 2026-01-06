import { describe, it, expect } from 'vitest';
import {
  GameModeSchema,
  GuessResultSchema,
  AdaptiveGameMetadataSchema,
  DecadeGameMetadataSchema,
  GameStateSchema,
  GameSessionSchema,
  GameAttemptSchema,
  PlayerStatsSchema,
} from '../game.schema';

describe('GameModeSchema', () => {
  it('should accept valid game modes', () => {
    expect(GameModeSchema.parse('classic')).toBe('classic');
    expect(GameModeSchema.parse('adaptive')).toBe('adaptive');
    expect(GameModeSchema.parse('decade')).toBe('decade');
  });

  it('should reject invalid game modes', () => {
    expect(() => GameModeSchema.parse('invalid')).toThrow();
    expect(() => GameModeSchema.parse('')).toThrow();
    expect(() => GameModeSchema.parse(123)).toThrow();
  });
});

describe('GuessResultSchema', () => {
  it('should validate a complete guess result', () => {
    const validResult = {
      isCorrect: true,
      confidence: 0.95,
      pointsEarned: 150,
      timeSpent: 5000,
      correctName: 'Fred',
      userGuess: 'Fred',
    };

    const result = GuessResultSchema.parse(validResult);
    expect(result.isCorrect).toBe(true);
    expect(result.confidence).toBe(0.95);
    expect(result.pointsEarned).toBe(150);
  });

  it('should reject confidence outside 0-1 range', () => {
    const invalidResult = {
      isCorrect: true,
      confidence: 1.5,
      pointsEarned: 150,
      timeSpent: 5000,
      correctName: 'Fred',
      userGuess: 'Fred',
    };

    expect(() => GuessResultSchema.parse(invalidResult)).toThrow();
  });

  it('should reject negative points', () => {
    const invalidResult = {
      isCorrect: true,
      confidence: 0.5,
      pointsEarned: -10,
      timeSpent: 5000,
      correctName: 'Fred',
      userGuess: 'Fred',
    };

    expect(() => GuessResultSchema.parse(invalidResult)).toThrow();
  });

  it('should reject negative time spent', () => {
    const invalidResult = {
      isCorrect: true,
      confidence: 0.5,
      pointsEarned: 100,
      timeSpent: -1000,
      correctName: 'Fred',
      userGuess: 'Fred',
    };

    expect(() => GuessResultSchema.parse(invalidResult)).toThrow();
  });
});

describe('AdaptiveGameMetadataSchema', () => {
  it('should validate complete metadata', () => {
    const validMetadata = {
      currentDifficulty: 'medio',
      correctSequence: 5,
      incorrectSequence: 2,
      difficultyProgress: 75,
    };

    const result = AdaptiveGameMetadataSchema.parse(validMetadata);
    expect(result.currentDifficulty).toBe('medio');
    expect(result.correctSequence).toBe(5);
  });

  it('should apply default values', () => {
    const minimalMetadata = {
      currentDifficulty: 'facil',
    };

    const result = AdaptiveGameMetadataSchema.parse(minimalMetadata);
    expect(result.correctSequence).toBe(0);
    expect(result.incorrectSequence).toBe(0);
    expect(result.difficultyProgress).toBe(0);
  });

  it('should reject invalid difficulty level', () => {
    const invalidMetadata = {
      currentDifficulty: 'super_hard',
    };

    expect(() => AdaptiveGameMetadataSchema.parse(invalidMetadata)).toThrow();
  });

  it('should reject difficultyProgress over 100', () => {
    const invalidMetadata = {
      currentDifficulty: 'medio',
      difficultyProgress: 150,
    };

    expect(() => AdaptiveGameMetadataSchema.parse(invalidMetadata)).toThrow();
  });
});

describe('DecadeGameMetadataSchema', () => {
  it('should validate complete metadata', () => {
    const validMetadata = {
      selectedDecade: '1990',
      availablePlayers: ['uuid-1', 'uuid-2'],
      totalDecadePlayers: 50,
    };

    const result = DecadeGameMetadataSchema.parse(validMetadata);
    expect(result.selectedDecade).toBe('1990');
    expect(result.availablePlayers).toHaveLength(2);
  });

  it('should accept null selectedDecade', () => {
    const metadata = {
      selectedDecade: null,
      availablePlayers: [],
      totalDecadePlayers: 0,
    };

    const result = DecadeGameMetadataSchema.parse(metadata);
    expect(result.selectedDecade).toBeNull();
  });

  it('should reject invalid UUID in availablePlayers', () => {
    const invalidMetadata = {
      selectedDecade: '1990',
      availablePlayers: ['not-a-uuid'],
      totalDecadePlayers: 1,
    };

    expect(() => DecadeGameMetadataSchema.parse(invalidMetadata)).toThrow();
  });
});

describe('GameStateSchema', () => {
  it('should validate complete game state', () => {
    const validState = {
      mode: 'adaptive',
      currentPlayer: '123e4567-e89b-12d3-a456-426614174000',
      score: 500,
      gameOver: false,
      gameActive: true,
      timeLeft: 30,
      currentStreak: 3,
      maxStreak: 5,
      totalAttempts: 10,
      correctGuesses: 8,
    };

    const result = GameStateSchema.parse(validState);
    expect(result.mode).toBe('adaptive');
    expect(result.score).toBe(500);
  });

  it('should apply default values', () => {
    const minimalState = {
      mode: 'classic',
      currentPlayer: null,
      timeLeft: null,
    };

    const result = GameStateSchema.parse(minimalState);
    expect(result.score).toBe(0);
    expect(result.gameOver).toBe(false);
    expect(result.gameActive).toBe(false);
    expect(result.currentStreak).toBe(0);
    expect(result.maxStreak).toBe(0);
    expect(result.totalAttempts).toBe(0);
    expect(result.correctGuesses).toBe(0);
  });

  it('should accept negative score after skipping player', () => {
    const stateWithNegativeScore = {
      mode: 'classic',
      currentPlayer: null,
      score: -100,
      timeLeft: null,
    };

    const result = GameStateSchema.parse(stateWithNegativeScore);
    expect(result.score).toBe(-100);
  });
});

describe('GameSessionSchema', () => {
  it('should validate complete session', () => {
    const validSession = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      gameMode: 'adaptive',
      finalScore: 1000,
      totalCorrect: 15,
      totalAttempts: 20,
      maxStreak: 7,
      duration: 300000,
      startedAt: '2024-01-15T10:00:00Z',
      endedAt: '2024-01-15T10:05:00Z',
      difficultyLevel: 'dificil',
      difficultyMultiplier: 1.5,
    };

    const result = GameSessionSchema.parse(validSession);
    expect(result.finalScore).toBe(1000);
    expect(result.difficultyLevel).toBe('dificil');
  });

  it('should accept null userId for guest sessions', () => {
    const guestSession = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: null,
      gameMode: 'classic',
      finalScore: 500,
      totalCorrect: 10,
      totalAttempts: 15,
      maxStreak: 3,
      duration: 180000,
      startedAt: '2024-01-15T10:00:00Z',
      endedAt: '2024-01-15T10:03:00Z',
    };

    const result = GameSessionSchema.parse(guestSession);
    expect(result.userId).toBeNull();
  });

  it('should reject invalid datetime format', () => {
    const invalidSession = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: null,
      gameMode: 'classic',
      finalScore: 500,
      totalCorrect: 10,
      totalAttempts: 15,
      maxStreak: 3,
      duration: 180000,
      startedAt: 'invalid-date',
      endedAt: '2024-01-15T10:03:00Z',
    };

    expect(() => GameSessionSchema.parse(invalidSession)).toThrow();
  });
});

describe('GameAttemptSchema', () => {
  it('should validate complete attempt', () => {
    const validAttempt = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sessionId: '123e4567-e89b-12d3-a456-426614174001',
      targetPlayerName: 'Fred',
      guess: 'Romário',
      isCorrect: false,
      confidence: 0.3,
      timeSpent: 15000,
      pointsEarned: 0,
      attemptNumber: 5,
      createdAt: '2024-01-15T10:00:00Z',
    };

    const result = GameAttemptSchema.parse(validAttempt);
    expect(result.targetPlayerName).toBe('Fred');
    expect(result.isCorrect).toBe(false);
  });

  it('should accept minimal attempt data', () => {
    const minimalAttempt = {
      targetPlayerName: 'Thiago Silva',
      guess: 'Thiago Silva',
      isCorrect: true,
      attemptNumber: 1,
    };

    const result = GameAttemptSchema.parse(minimalAttempt);
    expect(result.isCorrect).toBe(true);
  });

  it('should reject empty player name', () => {
    const invalidAttempt = {
      targetPlayerName: '',
      guess: 'Fred',
      isCorrect: false,
      attemptNumber: 1,
    };

    expect(() => GameAttemptSchema.parse(invalidAttempt)).toThrow();
  });

  it('should reject zero or negative attempt number', () => {
    const invalidAttempt = {
      targetPlayerName: 'Fred',
      guess: 'Fred',
      isCorrect: true,
      attemptNumber: 0,
    };

    expect(() => GameAttemptSchema.parse(invalidAttempt)).toThrow();
  });
});

describe('PlayerStatsSchema', () => {
  it('should validate complete stats', () => {
    const validStats = {
      totalGames: 100,
      totalPoints: 15000,
      highScore: 500,
      accuracyRate: 85.5,
      avgResponseTime: 3.2,
      maxStreak: 15,
      achievementsUnlocked: 10,
      rankPosition: 5,
    };

    const result = PlayerStatsSchema.parse(validStats);
    expect(result.totalGames).toBe(100);
    expect(result.accuracyRate).toBe(85.5);
  });

  it('should apply default values', () => {
    const emptyStats = {};

    const result = PlayerStatsSchema.parse(emptyStats);
    expect(result.totalGames).toBe(0);
    expect(result.totalPoints).toBe(0);
    expect(result.highScore).toBe(0);
    expect(result.accuracyRate).toBe(0);
    expect(result.avgResponseTime).toBe(0);
    expect(result.maxStreak).toBe(0);
    expect(result.achievementsUnlocked).toBe(0);
  });

  it('should reject accuracy over 100', () => {
    const invalidStats = {
      accuracyRate: 150,
    };

    expect(() => PlayerStatsSchema.parse(invalidStats)).toThrow();
  });

  it('should accept null rank position', () => {
    const stats = {
      rankPosition: null,
    };

    const result = PlayerStatsSchema.parse(stats);
    expect(result.rankPosition).toBeNull();
  });
});
