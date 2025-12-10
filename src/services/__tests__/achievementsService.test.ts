import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { getUserAchievements, unlockAchievement, checkAchievements } from '../achievementsService';
import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENTS } from '@/types/achievements';

describe('achievementsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserAchievements', () => {
    it('should return user achievements ordered by unlocked_at', async () => {
      const mockAchievements = [
        { id: '1', user_id: 'user-123', achievement_id: 'primeiro_gol', unlocked_at: '2024-01-02', progress: 1, max_progress: 1 },
        { id: '2', user_id: 'user-123', achievement_id: 'artilheiro', unlocked_at: '2024-01-01', progress: 10, max_progress: 10 },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockAchievements,
              error: null,
            }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await getUserAchievements('user-123');

      expect(result).toEqual(mockAchievements);
      expect(mockFrom).toHaveBeenCalledWith('user_achievements');
    });

    it('should return empty array if no achievements', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await getUserAchievements('user-no-achievements');

      expect(result).toEqual([]);
    });

    it('should throw on database error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      await expect(getUserAchievements('user-123')).rejects.toEqual({
        message: 'Database error',
      });
    });
  });

  describe('unlockAchievement', () => {
    it('should create new achievement record', async () => {
      const mockInsertResult = {
        id: 'achievement-record-123',
        user_id: 'user-123',
        achievement_id: 'primeiro_gol',
        progress: 1,
        max_progress: 1,
        unlocked_at: '2024-01-01',
      };

      // First call checks if exists (returns null)
      // Second call inserts
      let callCount = 0;
      const mockFrom = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockInsertResult,
                error: null,
              }),
            }),
          }),
        };
      });
      (supabase.from as Mock) = mockFrom;

      const result = await unlockAchievement('user-123', 'primeiro_gol');

      expect(result).toEqual(mockInsertResult);
    });

    it('should return existing achievement if already unlocked', async () => {
      const existingAchievement = {
        id: 'existing-123',
        user_id: 'user-123',
        achievement_id: 'primeiro_gol',
        progress: 1,
        max_progress: 1,
        unlocked_at: '2024-01-01',
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: existingAchievement,
                error: null,
              }),
            }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await unlockAchievement('user-123', 'primeiro_gol');

      expect(result).toEqual(existingAchievement);
    });

    it('should throw error for invalid achievement id', async () => {
      await expect(unlockAchievement('user-123', 'invalid_achievement_id')).rejects.toThrow(
        'Achievement invalid_achievement_id not found'
      );
    });

    it('should throw on insert error', async () => {
      let callCount = 0;
      const mockFrom = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Insert error' },
              }),
            }),
          }),
        };
      });
      (supabase.from as Mock) = mockFrom;

      await expect(unlockAchievement('user-123', 'primeiro_gol')).rejects.toEqual({
        message: 'Insert error',
      });
    });
  });

  describe('checkAchievements', () => {
    beforeEach(() => {
      // Mock getUserAchievements to return empty (no achievements yet)
      const mockFrom = vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'new-achievement' },
              error: null,
            }),
          }),
        }),
      }));
      (supabase.from as Mock) = mockFrom;
    });

    it('should check score achievements with gte operator', async () => {
      // Find an achievement with score condition
      const scoreAchievement = ACHIEVEMENTS.find(
        a => a.condition.type === 'score' && a.condition.operator === 'gte'
      );

      if (scoreAchievement) {
        const result = await checkAchievements('user-123', {
          score: scoreAchievement.condition.value,
          streak: 0,
          gamesPlayed: 1,
          accuracy: 50,
        });

        expect(result).toContain(scoreAchievement.id);
      }
    });

    it('should check streak achievements', async () => {
      const streakAchievement = ACHIEVEMENTS.find(
        a => a.condition.type === 'streak' && a.condition.operator === 'gte'
      );

      if (streakAchievement) {
        const result = await checkAchievements('user-123', {
          score: 0,
          streak: streakAchievement.condition.value,
          gamesPlayed: 1,
          accuracy: 50,
        });

        expect(result).toContain(streakAchievement.id);
      }
    });

    it('should check games_played achievements', async () => {
      const gamesAchievement = ACHIEVEMENTS.find(
        a => a.condition.type === 'games_played' && a.condition.operator === 'gte'
      );

      if (gamesAchievement) {
        const result = await checkAchievements('user-123', {
          score: 0,
          streak: 0,
          gamesPlayed: gamesAchievement.condition.value,
          accuracy: 50,
        });

        expect(result).toContain(gamesAchievement.id);
      }
    });

    it('should check accuracy achievements', async () => {
      const accuracyAchievement = ACHIEVEMENTS.find(
        a => a.condition.type === 'accuracy' && a.condition.operator === 'gte'
      );

      if (accuracyAchievement) {
        const result = await checkAchievements('user-123', {
          score: 0,
          streak: 0,
          gamesPlayed: 1,
          accuracy: accuracyAchievement.condition.value,
        });

        expect(result).toContain(accuracyAchievement.id);
      }
    });

    it('should check time achievements when timeToAnswer is provided', async () => {
      const timeAchievement = ACHIEVEMENTS.find(
        a => a.condition.type === 'time' && a.condition.operator === 'lte'
      );

      if (timeAchievement) {
        const result = await checkAchievements('user-123', {
          score: 0,
          streak: 0,
          gamesPlayed: 1,
          accuracy: 50,
          timeToAnswer: timeAchievement.condition.value - 1,
        });

        expect(result).toContain(timeAchievement.id);
      }
    });

    it('should not unlock already unlocked achievements', async () => {
      const firstAchievement = ACHIEVEMENTS[0];

      // Mock that user already has the first achievement
      const mockFrom = vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [{ achievement_id: firstAchievement.id }],
              error: null,
            }),
          }),
        }),
      }));
      (supabase.from as Mock) = mockFrom;

      const result = await checkAchievements('user-123', {
        score: 1000,
        streak: 100,
        gamesPlayed: 1000,
        accuracy: 100,
      });

      expect(result).not.toContain(firstAchievement.id);
    });

    it('should handle unlock errors gracefully', async () => {
      // Mock that throws on insert but succeeds on select
      const mockFrom = vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          }),
        }),
      }));
      (supabase.from as Mock) = mockFrom;

      // Should not throw, just return empty array
      const result = await checkAchievements('user-123', {
        score: 1000,
        streak: 100,
        gamesPlayed: 1000,
        accuracy: 100,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when no conditions are met', async () => {
      const result = await checkAchievements('user-123', {
        score: 0,
        streak: 0,
        gamesPlayed: 0,
        accuracy: 0,
      });

      expect(result).toEqual([]);
    });
  });

  describe('checkCondition (internal)', () => {
    // Test via checkAchievements as checkCondition is internal

    it('should handle gte operator correctly', async () => {
      const mockFrom = vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'new' },
              error: null,
            }),
          }),
        }),
      }));
      (supabase.from as Mock) = mockFrom;

      const gteAchievement = ACHIEVEMENTS.find(
        a => a.condition.operator === 'gte'
      );

      if (gteAchievement) {
        // Exactly at threshold should pass
        const statsAtThreshold: any = {
          score: 0,
          streak: 0,
          gamesPlayed: 0,
          accuracy: 0,
        };
        statsAtThreshold[gteAchievement.condition.type === 'games_played' ? 'gamesPlayed' : gteAchievement.condition.type] = gteAchievement.condition.value;

        const result = await checkAchievements('user-123', statsAtThreshold);
        expect(result).toContain(gteAchievement.id);
      }
    });

    it('should handle lte operator correctly', async () => {
      const mockFrom = vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'new' },
              error: null,
            }),
          }),
        }),
      }));
      (supabase.from as Mock) = mockFrom;

      const lteAchievement = ACHIEVEMENTS.find(
        a => a.condition.operator === 'lte' && a.condition.type === 'time'
      );

      if (lteAchievement) {
        const result = await checkAchievements('user-123', {
          score: 0,
          streak: 0,
          gamesPlayed: 1,
          accuracy: 50,
          timeToAnswer: lteAchievement.condition.value,
        });
        expect(result).toContain(lteAchievement.id);
      }
    });
  });
});
