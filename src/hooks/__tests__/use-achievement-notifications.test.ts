import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAchievementNotifications } from '../use-achievement-notifications';
import { Achievement } from '@/types/achievements';

// Helper to create mock achievements
const createMockAchievement = (id: string, name: string): Achievement => ({
  id,
  name,
  description: `Description for ${name}`,
  icon: '🏆',
  category: 'skill',
  condition: {
    type: 'score',
    operator: 'gte',
    value: 100,
  },
  rarity: 'common',
  points: 10,
});

describe('useAchievementNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should start with no current notification', () => {
      const { result } = renderHook(() => useAchievementNotifications());

      expect(result.current.currentNotification).toBeNull();
    });

    it('should start with empty notification queue', () => {
      const { result } = renderHook(() => useAchievementNotifications());

      expect(result.current.notificationQueue).toEqual([]);
    });

    it('should expose queueNotification function', () => {
      const { result } = renderHook(() => useAchievementNotifications());

      expect(typeof result.current.queueNotification).toBe('function');
    });

    it('should expose dismissNotification function', () => {
      const { result } = renderHook(() => useAchievementNotifications());

      expect(typeof result.current.dismissNotification).toBe('function');
    });
  });

  describe('queueNotification', () => {
    it('should show notification immediately if no current notification', () => {
      const { result } = renderHook(() => useAchievementNotifications());
      const achievement = createMockAchievement('1', 'First Achievement');

      act(() => {
        result.current.queueNotification(achievement);
      });

      expect(result.current.currentNotification).toEqual(achievement);
      expect(result.current.notificationQueue).toEqual([]);
    });

    it('should add to queue if notification is showing', () => {
      const { result } = renderHook(() => useAchievementNotifications());
      const achievement1 = createMockAchievement('1', 'First');
      const achievement2 = createMockAchievement('2', 'Second');

      act(() => {
        result.current.queueNotification(achievement1);
      });

      act(() => {
        result.current.queueNotification(achievement2);
      });

      expect(result.current.currentNotification).toEqual(achievement1);
      expect(result.current.notificationQueue).toHaveLength(1);
      expect(result.current.notificationQueue[0]).toEqual(achievement2);
    });

    it('should queue multiple notifications in order', () => {
      const { result } = renderHook(() => useAchievementNotifications());
      const achievements = [
        createMockAchievement('1', 'First'),
        createMockAchievement('2', 'Second'),
        createMockAchievement('3', 'Third'),
        createMockAchievement('4', 'Fourth'),
      ];

      // Queue all achievements
      achievements.forEach(achievement => {
        act(() => {
          result.current.queueNotification(achievement);
        });
      });

      expect(result.current.currentNotification).toEqual(achievements[0]);
      expect(result.current.notificationQueue).toHaveLength(3);
      expect(result.current.notificationQueue[0]).toEqual(achievements[1]);
      expect(result.current.notificationQueue[1]).toEqual(achievements[2]);
      expect(result.current.notificationQueue[2]).toEqual(achievements[3]);
    });
  });

  describe('dismissNotification', () => {
    it('should clear current notification', () => {
      const { result } = renderHook(() => useAchievementNotifications());
      const achievement = createMockAchievement('1', 'Test');

      act(() => {
        result.current.queueNotification(achievement);
      });

      act(() => {
        result.current.dismissNotification();
      });

      expect(result.current.currentNotification).toBeNull();
    });

    it('should show next notification from queue after delay', () => {
      const { result } = renderHook(() => useAchievementNotifications());
      const achievement1 = createMockAchievement('1', 'First');
      const achievement2 = createMockAchievement('2', 'Second');

      act(() => {
        result.current.queueNotification(achievement1);
        result.current.queueNotification(achievement2);
      });

      act(() => {
        result.current.dismissNotification();
      });

      // Initially null after dismiss
      expect(result.current.currentNotification).toBeNull();

      // After delay, next notification should appear
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.currentNotification).toEqual(achievement2);
      expect(result.current.notificationQueue).toHaveLength(0);
    });

    it('should process entire queue sequentially', () => {
      const { result } = renderHook(() => useAchievementNotifications());
      const achievements = [
        createMockAchievement('1', 'First'),
        createMockAchievement('2', 'Second'),
        createMockAchievement('3', 'Third'),
      ];

      achievements.forEach(achievement => {
        act(() => {
          result.current.queueNotification(achievement);
        });
      });

      // Process first
      expect(result.current.currentNotification).toEqual(achievements[0]);

      // Dismiss and process second
      act(() => {
        result.current.dismissNotification();
        vi.advanceTimersByTime(300);
      });
      expect(result.current.currentNotification).toEqual(achievements[1]);

      // Dismiss and process third
      act(() => {
        result.current.dismissNotification();
        vi.advanceTimersByTime(300);
      });
      expect(result.current.currentNotification).toEqual(achievements[2]);

      // Dismiss last
      act(() => {
        result.current.dismissNotification();
        vi.advanceTimersByTime(300);
      });
      expect(result.current.currentNotification).toBeNull();
      expect(result.current.notificationQueue).toHaveLength(0);
    });

    it('should do nothing if queue is empty', () => {
      const { result } = renderHook(() => useAchievementNotifications());

      act(() => {
        result.current.dismissNotification();
      });

      expect(result.current.currentNotification).toBeNull();
      expect(result.current.notificationQueue).toHaveLength(0);
    });

    it('should handle rapid dismiss calls', () => {
      const { result } = renderHook(() => useAchievementNotifications());
      const achievement = createMockAchievement('1', 'Test');

      act(() => {
        result.current.queueNotification(achievement);
      });

      // Rapid dismiss calls
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.dismissNotification();
        });
      }

      expect(result.current.currentNotification).toBeNull();
      expect(result.current.notificationQueue).toHaveLength(0);
    });
  });

  describe('animation timing', () => {
    it('should use 300ms delay for animation completion', () => {
      const { result } = renderHook(() => useAchievementNotifications());
      const achievement1 = createMockAchievement('1', 'First');
      const achievement2 = createMockAchievement('2', 'Second');

      act(() => {
        result.current.queueNotification(achievement1);
        result.current.queueNotification(achievement2);
      });

      act(() => {
        result.current.dismissNotification();
      });

      // Before animation completes
      act(() => {
        vi.advanceTimersByTime(299);
      });
      expect(result.current.currentNotification).toBeNull();

      // After animation completes
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current.currentNotification).toEqual(achievement2);
    });
  });

  describe('edge cases', () => {
    it('should handle same achievement queued multiple times', () => {
      const { result } = renderHook(() => useAchievementNotifications());
      const achievement = createMockAchievement('1', 'Repeated');

      act(() => {
        result.current.queueNotification(achievement);
        result.current.queueNotification(achievement);
        result.current.queueNotification(achievement);
      });

      expect(result.current.currentNotification).toEqual(achievement);
      expect(result.current.notificationQueue).toHaveLength(2);
    });

    it('should handle achievements with different rarities', () => {
      const { result } = renderHook(() => useAchievementNotifications());
      
      const commonAchievement: Achievement = {
        ...createMockAchievement('1', 'Common'),
        rarity: 'common',
      };
      
      const legendaryAchievement: Achievement = {
        ...createMockAchievement('2', 'Legendary'),
        rarity: 'legendary',
      };

      act(() => {
        result.current.queueNotification(commonAchievement);
        result.current.queueNotification(legendaryAchievement);
      });

      expect(result.current.currentNotification?.rarity).toBe('common');
      
      act(() => {
        result.current.dismissNotification();
        vi.advanceTimersByTime(300);
      });

      expect(result.current.currentNotification?.rarity).toBe('legendary');
    });

    it('should handle hidden achievements', () => {
      const { result } = renderHook(() => useAchievementNotifications());
      
      const hiddenAchievement: Achievement = {
        ...createMockAchievement('hidden', 'Hidden'),
        hidden: true,
      };

      act(() => {
        result.current.queueNotification(hiddenAchievement);
      });

      expect(result.current.currentNotification?.hidden).toBe(true);
    });

    it('should maintain queue integrity on unmount/remount', () => {
      const { result, unmount, rerender } = renderHook(() => 
        useAchievementNotifications()
      );

      const achievement = createMockAchievement('1', 'Test');

      act(() => {
        result.current.queueNotification(achievement);
      });

      expect(result.current.currentNotification).toEqual(achievement);

      // Rerender should maintain state (hook internal state)
      rerender();

      expect(result.current.currentNotification).toEqual(achievement);
    });
  });

  describe('concurrent operations', () => {
    it('should handle queue + dismiss in same batch', () => {
      const { result } = renderHook(() => useAchievementNotifications());
      const achievement1 = createMockAchievement('1', 'First');
      const achievement2 = createMockAchievement('2', 'Second');

      act(() => {
        result.current.queueNotification(achievement1);
      });

      act(() => {
        result.current.queueNotification(achievement2);
        result.current.dismissNotification();
      });

      // After dismiss, current is null, queue should still have second
      expect(result.current.currentNotification).toBeNull();
      
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.currentNotification).toEqual(achievement2);
    });

    it('should handle large queue efficiently', () => {
      const { result } = renderHook(() => useAchievementNotifications());
      
      const manyAchievements = Array.from({ length: 50 }, (_, i) => 
        createMockAchievement(`${i}`, `Achievement ${i}`)
      );

      manyAchievements.forEach(achievement => {
        act(() => {
          result.current.queueNotification(achievement);
        });
      });

      expect(result.current.currentNotification).toEqual(manyAchievements[0]);
      expect(result.current.notificationQueue).toHaveLength(49);

      // Process all
      for (let i = 1; i < 50; i++) {
        act(() => {
          result.current.dismissNotification();
          vi.advanceTimersByTime(300);
        });
        expect(result.current.currentNotification).toEqual(manyAchievements[i]);
      }

      // Final dismiss
      act(() => {
        result.current.dismissNotification();
        vi.advanceTimersByTime(300);
      });

      expect(result.current.currentNotification).toBeNull();
      expect(result.current.notificationQueue).toHaveLength(0);
    });
  });
});
