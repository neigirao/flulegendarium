import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCleanTimer, TIME_LIMIT_SECONDS } from '../use-clean-timer';

// Mock the logger
vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useCleanTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should start with TIME_LIMIT_SECONDS', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      expect(result.current.timeRemaining).toBe(TIME_LIMIT_SECONDS);
    });

    it('should not be running initially', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      expect(result.current.isRunning).toBe(false);
    });

    it('should not be paused initially', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      expect(result.current.isPaused).toBe(false);
    });

    it('should expose all timer control functions', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      expect(typeof result.current.startTimer).toBe('function');
      expect(typeof result.current.stopTimer).toBe('function');
      expect(typeof result.current.pauseTimer).toBe('function');
      expect(typeof result.current.resumeTimer).toBe('function');
      expect(typeof result.current.clearGameTimer).toBe('function');
    });
  });

  describe('startTimer', () => {
    it('should set isRunning to true', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      expect(result.current.isRunning).toBe(true);
    });

    it('should reset time to TIME_LIMIT_SECONDS', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      // Start and let some time pass
      act(() => {
        result.current.startTimer();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Restart timer
      act(() => {
        result.current.startTimer();
      });

      expect(result.current.timeRemaining).toBe(TIME_LIMIT_SECONDS);
    });

    it('should decrement every second', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.timeRemaining).toBe(TIME_LIMIT_SECONDS - 1);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.timeRemaining).toBe(TIME_LIMIT_SECONDS - 2);
    });

    it('should call onTimeUp when reaches 0', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      act(() => {
        vi.advanceTimersByTime(TIME_LIMIT_SECONDS * 1000);
      });

      expect(onTimeUp).toHaveBeenCalledTimes(1);
      expect(result.current.timeRemaining).toBe(0);
    });

    it('should stop running after time is up', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      act(() => {
        vi.advanceTimersByTime(TIME_LIMIT_SECONDS * 1000);
      });

      expect(result.current.isRunning).toBe(false);
    });

    it('should not start if gameOver is true', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(true, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      expect(result.current.isRunning).toBe(false);
    });

    it('should set isPaused to false when starting', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      expect(result.current.isPaused).toBe(false);
    });
  });

  describe('pauseTimer', () => {
    it('should pause running timer', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      const timeBeforePause = result.current.timeRemaining;

      act(() => {
        result.current.pauseTimer();
      });

      expect(result.current.isPaused).toBe(true);
      expect(result.current.isRunning).toBe(false);

      // Time should not change after pause
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeRemaining).toBe(timeBeforePause);
    });

    it('should preserve timeRemaining', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      const timeBeforePause = result.current.timeRemaining;

      act(() => {
        result.current.pauseTimer();
      });

      expect(result.current.timeRemaining).toBe(timeBeforePause);
    });

    it('should not pause if not running', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.pauseTimer();
      });

      expect(result.current.isPaused).toBe(false);
    });

    it('should not pause if already paused', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      act(() => {
        result.current.pauseTimer();
      });

      const stateAfterFirstPause = {
        isPaused: result.current.isPaused,
        timeRemaining: result.current.timeRemaining,
      };

      act(() => {
        result.current.pauseTimer();
      });

      expect(result.current.isPaused).toBe(stateAfterFirstPause.isPaused);
      expect(result.current.timeRemaining).toBe(stateAfterFirstPause.timeRemaining);
    });
  });

  describe('resumeTimer', () => {
    it('should continue from paused state', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      const timeBeforePause = result.current.timeRemaining;

      act(() => {
        result.current.pauseTimer();
      });

      act(() => {
        result.current.resumeTimer();
      });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.timeRemaining).toBe(timeBeforePause);
    });

    it('should continue countdown after resume', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      const timeBeforePause = result.current.timeRemaining;

      act(() => {
        result.current.pauseTimer();
      });

      act(() => {
        result.current.resumeTimer();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeRemaining).toBe(timeBeforePause - 5);
    });

    it('should not resume if not paused', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      const initialState = {
        isRunning: result.current.isRunning,
        isPaused: result.current.isPaused,
      };

      act(() => {
        result.current.resumeTimer();
      });

      expect(result.current.isRunning).toBe(initialState.isRunning);
      expect(result.current.isPaused).toBe(initialState.isPaused);
    });

    it('should not resume if gameOver is true', () => {
      const onTimeUp = vi.fn();
      const { result, rerender } = renderHook(
        ({ gameOver }) => useCleanTimer(gameOver, onTimeUp),
        { initialProps: { gameOver: false } }
      );

      act(() => {
        result.current.startTimer();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      act(() => {
        result.current.pauseTimer();
      });

      // Set gameOver to true
      rerender({ gameOver: true });

      act(() => {
        result.current.resumeTimer();
      });

      expect(result.current.isRunning).toBe(false);
    });

    it('should call onTimeUp if resumed timer reaches 0', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      // Use most of the time
      act(() => {
        vi.advanceTimersByTime((TIME_LIMIT_SECONDS - 5) * 1000);
      });

      act(() => {
        result.current.pauseTimer();
      });

      act(() => {
        result.current.resumeTimer();
      });

      // Use remaining time
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(onTimeUp).toHaveBeenCalledTimes(1);
    });
  });

  describe('stopTimer', () => {
    it('should reset to TIME_LIMIT_SECONDS', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      act(() => {
        vi.advanceTimersByTime(30000);
      });

      act(() => {
        result.current.stopTimer();
      });

      expect(result.current.timeRemaining).toBe(TIME_LIMIT_SECONDS);
    });

    it('should clear interval', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      act(() => {
        result.current.stopTimer();
      });

      expect(result.current.isRunning).toBe(false);

      // Advance time and verify no changes
      const timeAfterStop = result.current.timeRemaining;

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeRemaining).toBe(timeAfterStop);
    });

    it('should set isRunning to false', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      act(() => {
        result.current.stopTimer();
      });

      expect(result.current.isRunning).toBe(false);
    });

    it('should set isPaused to false', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      act(() => {
        result.current.pauseTimer();
      });

      act(() => {
        result.current.stopTimer();
      });

      expect(result.current.isPaused).toBe(false);
    });
  });

  describe('clearGameTimer', () => {
    it('should stop the timer without resetting time', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      act(() => {
        vi.advanceTimersByTime(20000);
      });

      const timeBeforeClear = result.current.timeRemaining;

      act(() => {
        result.current.clearGameTimer();
      });

      // clearGameTimer doesn't reset time, just clears interval
      expect(result.current.isRunning).toBe(false);
      expect(result.current.timeRemaining).toBe(timeBeforeClear);
    });

    it('should be called on component unmount', () => {
      const onTimeUp = vi.fn();
      const { result, unmount } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      unmount();

      // No more timer callbacks should fire
      expect(onTimeUp).not.toHaveBeenCalled();
    });
  });

  describe('gameOver effect', () => {
    it('should clear timer when gameOver changes to true', () => {
      const onTimeUp = vi.fn();
      const { result, rerender } = renderHook(
        ({ gameOver }) => useCleanTimer(gameOver, onTimeUp),
        { initialProps: { gameOver: false } }
      );

      act(() => {
        result.current.startTimer();
      });

      expect(result.current.isRunning).toBe(true);

      // Set gameOver to true
      rerender({ gameOver: true });

      expect(result.current.isRunning).toBe(false);
    });

    it('should not call onTimeUp when game ends via gameOver', () => {
      const onTimeUp = vi.fn();
      const { result, rerender } = renderHook(
        ({ gameOver }) => useCleanTimer(gameOver, onTimeUp),
        { initialProps: { gameOver: false } }
      );

      act(() => {
        result.current.startTimer();
      });

      act(() => {
        vi.advanceTimersByTime(30000);
      });

      // End game via gameOver flag, not timeout
      rerender({ gameOver: true });

      // The onTimeUp should NOT be called - game ended differently
      expect(onTimeUp).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid start/stop cycles', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.startTimer();
        });
        act(() => {
          result.current.stopTimer();
        });
      }

      // Should be in clean stopped state
      expect(result.current.isRunning).toBe(false);
      expect(result.current.timeRemaining).toBe(TIME_LIMIT_SECONDS);
    });

    it('should handle pause/resume cycles', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      for (let i = 0; i < 5; i++) {
        act(() => {
          vi.advanceTimersByTime(1000);
        });
        act(() => {
          result.current.pauseTimer();
        });
        act(() => {
          result.current.resumeTimer();
        });
      }

      // Should have decremented by 5 seconds total
      expect(result.current.timeRemaining).toBe(TIME_LIMIT_SECONDS - 5);
    });

    it('should handle multiple consecutive starts', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useCleanTimer(false, onTimeUp));

      act(() => {
        result.current.startTimer();
      });

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      act(() => {
        result.current.startTimer();
      });

      // Should reset to full time
      expect(result.current.timeRemaining).toBe(TIME_LIMIT_SECONDS);
      expect(result.current.isRunning).toBe(true);
    });
  });
});
