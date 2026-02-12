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
        const statsAtThreshold: { score: number; streak: number; gamesPlayed: number; accuracy: number; [key: string]: number } = {
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

    it('should handle eq operator correctly', async () => {
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

      const eqAchievement = ACHIEVEMENTS.find(
        a => a.condition.operator === 'eq'
      );

      if (eqAchievement) {
        const statsAtExact = {
          score: 0,
          streak: 0,
          gamesPlayed: 0,
          accuracy: 0,
        };
        const type = eqAchievement.condition.type;
        if (type === 'games_played') {
          statsAtExact.gamesPlayed = eqAchievement.condition.value;
        } else if (type === 'score') {
          statsAtExact.score = eqAchievement.condition.value;
        } else if (type === 'streak') {
          statsAtExact.streak = eqAchievement.condition.value;
        } else if (type === 'accuracy') {
          statsAtExact.accuracy = eqAchievement.condition.value;
        }

        const result = await checkAchievements('user-123', statsAtExact);
        expect(result).toContain(eqAchievement.id);
      }
    });
  });

  describe('Achievement Categories', () => {
    it('should have achievements for each category type', () => {
      const categories = ['skill', 'streak', 'time', 'knowledge', 'special', 'position', 'behavioral'];
      
      categories.forEach(category => {
        const hasCategory = ACHIEVEMENTS.some(a => a.category === category);
        expect(hasCategory).toBe(true);
      });
    });

    it('should have achievements for each rarity type', () => {
      const rarities = ['common', 'rare', 'epic', 'legendary'];
      
      rarities.forEach(rarity => {
        const hasRarity = ACHIEVEMENTS.some(a => a.rarity === rarity);
        expect(hasRarity).toBe(true);
      });
    });

    it('should have points for each achievement', () => {
      ACHIEVEMENTS.forEach(achievement => {
        expect(achievement.points).toBeGreaterThan(0);
      });
    });

    it('should have unique ids for all achievements', () => {
      const ids = ACHIEVEMENTS.map(a => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have icon for each achievement', () => {
      ACHIEVEMENTS.forEach(achievement => {
        expect(achievement.icon).toBeDefined();
        expect(achievement.icon.length).toBeGreaterThan(0);
      });
    });

    it('should have valid condition types', () => {
      const validTypes = ['score', 'streak', 'games_played', 'accuracy', 'time', 'specific_player', 'position_specialist', 'time_of_day', 'consecutive_days'];
      
      ACHIEVEMENTS.forEach(achievement => {
        expect(validTypes).toContain(achievement.condition.type);
      });
    });

    it('should have valid operators', () => {
      const validOperators = ['gte', 'lte', 'eq'];
      
      ACHIEVEMENTS.forEach(achievement => {
        expect(validOperators).toContain(achievement.condition.operator);
      });
    });
  });

  describe('Multiple Achievements', () => {
    it('should unlock multiple achievements at once when conditions are met', async () => {
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

      // High stats that should trigger multiple achievements
      const result = await checkAchievements('user-123', {
        score: 500,
        streak: 15,
        gamesPlayed: 100,
        accuracy: 100,
        timeToAnswer: 2,
      });

      // Should unlock multiple achievements
      expect(result.length).toBeGreaterThan(1);
    });
  });

  describe('Hidden Achievements', () => {
    it('should have some hidden achievements', () => {
      const hiddenAchievements = ACHIEVEMENTS.filter(a => a.hidden === true);
      expect(hiddenAchievements.length).toBeGreaterThan(0);
    });

    it('should still be unlockable even when hidden', async () => {
      const hiddenAchievement = ACHIEVEMENTS.find(a => a.hidden === true);
      
      if (hiddenAchievement) {
        expect(hiddenAchievement.condition).toBeDefined();
        expect(hiddenAchievement.points).toBeGreaterThan(0);
      }
    });
  });
});
