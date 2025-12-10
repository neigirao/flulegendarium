import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { decadePlayerService } from '../decadePlayerService';
import { supabase } from '@/integrations/supabase/client';
import { Decade } from '@/types/decade-game';

// Mock do logger
vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock do statistics-converter
vi.mock('@/utils/statistics-converter', () => ({
  convertStatistics: vi.fn((stats) => stats || {}),
}));

describe('decadePlayerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPlayersByDecade', () => {
    it('should fetch and return players for a specific decade', async () => {
      const mockPlayers = [
        {
          id: 'player-1',
          name: 'Fred',
          position: 'Atacante',
          image_url: 'https://example.com/fred.jpg',
          year_highlight: '2012',
          fun_fact: 'Maior artilheiro do Fluminense',
          achievements: ['Campeão Brasileiro'],
          nicknames: ['Fredgol'],
          statistics: { goals: 199 },
          difficulty_level: 'medio',
          difficulty_score: 50,
          difficulty_confidence: 80,
          total_attempts: 100,
          correct_attempts: 70,
          average_guess_time: 15000,
          decades: ['2010s', '2020s'],
        },
        {
          id: 'player-2',
          name: 'Washington',
          position: 'Atacante',
          image_url: 'https://example.com/washington.jpg',
          year_highlight: '2008',
          fun_fact: 'Coração Valente',
          achievements: ['Libertadores'],
          nicknames: ['Coração Valente'],
          statistics: { goals: 50 },
          difficulty_level: 'dificil',
          difficulty_score: 75,
          difficulty_confidence: 90,
          total_attempts: 80,
          correct_attempts: 40,
          average_guess_time: 25000,
          decades: ['2000s', '2010s'],
        },
      ];

      const mockContains = vi.fn().mockResolvedValue({
        data: mockPlayers,
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ contains: mockContains });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as Mock) = mockFrom;

      const result = await decadePlayerService.getPlayersByDecade('2010s');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Fred');
      expect(result[0].position).toBe('Atacante');
      expect(result[0].decades).toContain('2010s');
      expect(mockFrom).toHaveBeenCalledWith('players');
      expect(mockContains).toHaveBeenCalledWith('decades', ['2010s']);
    });

    it('should return empty array when no players found for decade', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          contains: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await decadePlayerService.getPlayersByDecade('1990s' as Decade);

      expect(result).toEqual([]);
    });

    it('should return empty array when data is null', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          contains: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await decadePlayerService.getPlayersByDecade('1990s' as Decade);

      expect(result).toEqual([]);
    });

    it('should throw error on database error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          contains: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' },
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      await expect(decadePlayerService.getPlayersByDecade('2000s')).rejects.toEqual({
        message: 'Database connection failed',
      });
    });

    it('should handle missing player fields with defaults', async () => {
      const mockPlayers = [
        {
          id: 'player-3',
          name: null,
          position: null,
          image_url: null,
          year_highlight: null,
          fun_fact: null,
          achievements: null,
          nicknames: null,
          statistics: null,
          difficulty_level: null,
          difficulty_score: null,
          difficulty_confidence: null,
          total_attempts: null,
          correct_attempts: null,
          average_guess_time: null,
          decades: null,
        },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          contains: vi.fn().mockResolvedValue({
            data: mockPlayers,
            error: null,
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await decadePlayerService.getPlayersByDecade('1970s');

      expect(result[0].name).toBe('Nome não informado');
      expect(result[0].position).toBe('Posição não informada');
      expect(result[0].image_url).toBe('/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png');
      expect(result[0].year_highlight).toBe('');
      expect(result[0].fun_fact).toBe('');
      expect(result[0].achievements).toEqual([]);
      expect(result[0].nicknames).toEqual([]);
      expect(result[0].difficulty_level).toBe('medio');
      expect(result[0].difficulty_score).toBe(50);
      expect(result[0].difficulty_confidence).toBe(0);
      expect(result[0].total_attempts).toBe(0);
      expect(result[0].correct_attempts).toBe(0);
      expect(result[0].average_guess_time).toBe(30000);
      expect(result[0].decades).toEqual([]);
    });

    it('should handle non-array achievements and nicknames', async () => {
      const mockPlayers = [
        {
          id: 'player-4',
          name: 'Test Player',
          position: 'Meio',
          image_url: 'test.jpg',
          year_highlight: '2020',
          fun_fact: 'Test fact',
          achievements: 'not an array',
          nicknames: 123,
          statistics: {},
          difficulty_level: 'facil',
          difficulty_score: 30,
          difficulty_confidence: 50,
          total_attempts: 10,
          correct_attempts: 8,
          average_guess_time: 10000,
          decades: ['2020s'],
        },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          contains: vi.fn().mockResolvedValue({
            data: mockPlayers,
            error: null,
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await decadePlayerService.getPlayersByDecade('2020s');

      expect(result[0].achievements).toEqual([]);
      expect(result[0].nicknames).toEqual([]);
    });

    it('should throw on exception', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          contains: vi.fn().mockRejectedValue(new Error('Network error')),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      await expect(decadePlayerService.getPlayersByDecade('1980s')).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getAvailableDecades', () => {
    it('should return sorted unique decades', async () => {
      const mockPlayers = [
        { decades: ['2010s', '2020s'] },
        { decades: ['2000s', '2010s'] },
        { decades: ['1990s'] },
        { decades: ['2000s'] },
      ];

      const mockNot = vi.fn().mockResolvedValue({
        data: mockPlayers,
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ not: mockNot });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as Mock) = mockFrom;

      const result = await decadePlayerService.getAvailableDecades();

      expect(result).toEqual(['1990s', '2000s', '2010s', '2020s']);
      expect(mockSelect).toHaveBeenCalledWith('decades');
      expect(mockNot).toHaveBeenCalledWith('decades', 'is', null);
    });

    it('should return empty array on error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          not: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Query failed' },
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await decadePlayerService.getAvailableDecades();

      expect(result).toEqual([]);
    });

    it('should handle empty player list', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          not: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await decadePlayerService.getAvailableDecades();

      expect(result).toEqual([]);
    });

    it('should filter out null/undefined decades', async () => {
      const mockPlayers = [
        { decades: ['2010s', null, undefined] },
        { decades: null },
        { decades: ['2000s'] },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          not: vi.fn().mockResolvedValue({
            data: mockPlayers,
            error: null,
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await decadePlayerService.getAvailableDecades();

      expect(result).toEqual(['2000s', '2010s']);
      expect(result).not.toContain(null);
      expect(result).not.toContain(undefined);
    });

    it('should return empty array on exception', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          not: vi.fn().mockRejectedValue(new Error('Network failure')),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await decadePlayerService.getAvailableDecades();

      expect(result).toEqual([]);
    });
  });
});
