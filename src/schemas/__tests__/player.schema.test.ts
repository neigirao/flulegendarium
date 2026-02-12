import { describe, it, expect } from 'vitest';
import {
  PlayerStatisticsSchema,
  DifficultyLevelSchema,
  PlayerSchema,
  PlayerListSchema,
  CreatePlayerSchema,
  UpdatePlayerSchema,
} from '../player.schema';

describe('DifficultyLevelSchema', () => {
  it('should accept all valid difficulty levels', () => {
    expect(DifficultyLevelSchema.parse('muito_facil')).toBe('muito_facil');
    expect(DifficultyLevelSchema.parse('facil')).toBe('facil');
    expect(DifficultyLevelSchema.parse('medio')).toBe('medio');
    expect(DifficultyLevelSchema.parse('dificil')).toBe('dificil');
    expect(DifficultyLevelSchema.parse('muito_dificil')).toBe('muito_dificil');
  });

  it('should reject invalid difficulty levels', () => {
    expect(() => DifficultyLevelSchema.parse('easy')).toThrow();
    expect(() => DifficultyLevelSchema.parse('hard')).toThrow();
    expect(() => DifficultyLevelSchema.parse('')).toThrow();
    expect(() => DifficultyLevelSchema.parse(null)).toThrow();
  });
});

describe('PlayerStatisticsSchema', () => {
  it('should validate statistics with goals and games', () => {
    const stats = { gols: 100, jogos: 200 };
    const result = PlayerStatisticsSchema.parse(stats);
    expect(result.gols).toBe(100);
    expect(result.jogos).toBe(200);
  });

  it('should apply default values', () => {
    const result = PlayerStatisticsSchema.parse({});
    expect(result.gols).toBe(0);
    expect(result.jogos).toBe(0);
  });

  it('should reject negative values', () => {
    expect(() => PlayerStatisticsSchema.parse({ gols: -5 })).toThrow();
    expect(() => PlayerStatisticsSchema.parse({ jogos: -10 })).toThrow();
  });

  it('should reject non-integer values', () => {
    expect(() => PlayerStatisticsSchema.parse({ gols: 10.5 })).toThrow();
  });
});

describe('PlayerSchema', () => {
  const validPlayer = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Fred',
    position: 'Atacante',
    image_url: 'https://example.com/fred.jpg',
    statistics: { gols: 100, jogos: 200 },
  };

  it('should validate a complete player', () => {
    const fullPlayer = {
      ...validPlayer,
      year_highlight: '2012',
      fun_fact: 'Artilheiro da Copa de 2012',
      achievements: ['Artilheiro', 'Campeão'],
      nicknames: ['Fred', 'Fredo'],
      difficulty_level: 'facil',
      difficulty_score: 75,
      difficulty_confidence: 0.85,
      total_attempts: 1000,
      correct_attempts: 800,
      average_guess_time: 3500,
      decades: ['2000', '2010'],
    };

    const result = PlayerSchema.parse(fullPlayer);
    expect(result.name).toBe('Fred');
    expect(result.difficulty_level).toBe('facil');
    expect(result.achievements).toHaveLength(2);
  });

  it('should validate minimal player', () => {
    const result = PlayerSchema.parse(validPlayer);
    expect(result.name).toBe('Fred');
    expect(result.position).toBe('Atacante');
  });

  it('should apply default values', () => {
    const result = PlayerSchema.parse(validPlayer);
    expect(result.year_highlight).toBe('');
    expect(result.fun_fact).toBe('');
    expect(result.achievements).toEqual([]);
  });

  it('should reject empty name', () => {
    const invalidPlayer = { ...validPlayer, name: '' };
    expect(() => PlayerSchema.parse(invalidPlayer)).toThrow();
  });

  it('should reject empty position', () => {
    const invalidPlayer = { ...validPlayer, position: '' };
    expect(() => PlayerSchema.parse(invalidPlayer)).toThrow();
  });

  it('should reject invalid image URL', () => {
    const invalidPlayer = { ...validPlayer, image_url: 'not-a-url' };
    expect(() => PlayerSchema.parse(invalidPlayer)).toThrow();
  });

  it('should reject invalid UUID for id', () => {
    const invalidPlayer = { ...validPlayer, id: 'not-a-uuid' };
    expect(() => PlayerSchema.parse(invalidPlayer)).toThrow();
  });

  it('should reject name over 200 characters', () => {
    const invalidPlayer = { ...validPlayer, name: 'A'.repeat(201) };
    expect(() => PlayerSchema.parse(invalidPlayer)).toThrow();
  });

  it('should reject difficulty_score over 100', () => {
    const invalidPlayer = { ...validPlayer, difficulty_score: 150 };
    expect(() => PlayerSchema.parse(invalidPlayer)).toThrow();
  });

  it('should reject difficulty_confidence over 1', () => {
    const invalidPlayer = { ...validPlayer, difficulty_confidence: 1.5 };
    expect(() => PlayerSchema.parse(invalidPlayer)).toThrow();
  });
});

describe('PlayerListSchema', () => {
  const validPlayer = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Fred',
    position: 'Atacante',
    image_url: 'https://example.com/fred.jpg',
    statistics: { gols: 100, jogos: 200 },
  };

  it('should validate array of players', () => {
    const players = [
      validPlayer,
      { ...validPlayer, id: '123e4567-e89b-12d3-a456-426614174001', name: 'Romário' },
    ];

    const result = PlayerListSchema.parse(players);
    expect(result).toHaveLength(2);
  });

  it('should accept empty array', () => {
    const result = PlayerListSchema.parse([]);
    expect(result).toEqual([]);
  });

  it('should reject array with invalid player', () => {
    const players = [validPlayer, { name: 'Invalid' }];
    expect(() => PlayerListSchema.parse(players)).toThrow();
  });
});

describe('CreatePlayerSchema', () => {
  it('should validate player creation without id', () => {
    const newPlayer = {
      name: 'Novo Jogador',
      position: 'Meio-campo',
      image_url: 'https://example.com/novo.jpg',
      statistics: { gols: 0, jogos: 0 },
    };

    const result = CreatePlayerSchema.parse(newPlayer);
    expect(result.name).toBe('Novo Jogador');
    expect((result as unknown as Record<string, unknown>).id).toBeUndefined();
  });

  it('should omit tracking fields', () => {
    const newPlayer = {
      name: 'Novo Jogador',
      position: 'Goleiro',
      image_url: 'https://example.com/novo.jpg',
      statistics: { gols: 0, jogos: 0 },
      total_attempts: 100, // should be ignored
      correct_attempts: 80, // should be ignored
    };

    const result = CreatePlayerSchema.parse(newPlayer);
    expect((result as unknown as Record<string, unknown>).total_attempts).toBeUndefined();
    expect((result as unknown as Record<string, unknown>).correct_attempts).toBeUndefined();
  });
});

describe('UpdatePlayerSchema', () => {
  it('should require id for updates', () => {
    const update = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Nome Atualizado',
    };

    const result = UpdatePlayerSchema.parse(update);
    expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(result.name).toBe('Nome Atualizado');
  });

  it('should reject update without id', () => {
    const update = { name: 'Nome Atualizado' };
    expect(() => UpdatePlayerSchema.parse(update)).toThrow();
  });

  it('should allow partial updates', () => {
    const update = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      fun_fact: 'Novo fato interessante',
    };

    const result = UpdatePlayerSchema.parse(update);
    expect(result.fun_fact).toBe('Novo fato interessante');
    expect(result.name).toBeUndefined();
  });
});
