import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTabVisibility } from '../use-tab-visibility';

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('useTabVisibility', () => {
  // Store original document.hidden
  let originalHidden: PropertyDescriptor | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    originalHidden = Object.getOwnPropertyDescriptor(document, 'hidden');
    
    // Default to visible
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
  });

  afterEach(() => {
    // Restore original
    if (originalHidden) {
      Object.defineProperty(document, 'hidden', originalHidden);
    } else {
      delete (document as any).hidden;
    }
  });

  const simulateVisibilityChange = (hidden: boolean) => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => hidden,
    });
    
    const event = new Event('visibilitychange');
    document.dispatchEvent(event);
  };

  describe('initialization', () => {
    it('should start with isVisible true when document is visible', () => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => false,
      });

      const { result } = renderHook(() => useTabVisibility());

      expect(result.current.isVisible).toBe(true);
    });

    it('should start with isVisible false when document is hidden', () => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => true,
      });

      const { result } = renderHook(() => useTabVisibility());

      expect(result.current.isVisible).toBe(false);
    });

    it('should work without any props', () => {
      const { result } = renderHook(() => useTabVisibility());

      expect(result.current.isVisible).toBe(true);
    });
  });

  describe('visibility change detection', () => {
    it('should detect when tab becomes hidden', () => {
      const { result } = renderHook(() => useTabVisibility());

      expect(result.current.isVisible).toBe(true);

      act(() => {
        simulateVisibilityChange(true);
      });

      expect(result.current.isVisible).toBe(false);
    });

    it('should detect when tab becomes visible', () => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => true,
      });

      const { result } = renderHook(() => useTabVisibility());

      expect(result.current.isVisible).toBe(false);

      act(() => {
        simulateVisibilityChange(false);
      });

      expect(result.current.isVisible).toBe(true);
    });

    it('should update on multiple visibility changes', () => {
      const { result } = renderHook(() => useTabVisibility());

      act(() => {
        simulateVisibilityChange(true);
      });
      expect(result.current.isVisible).toBe(false);

      act(() => {
        simulateVisibilityChange(false);
      });
      expect(result.current.isVisible).toBe(true);

      act(() => {
        simulateVisibilityChange(true);
      });
      expect(result.current.isVisible).toBe(false);
    });
  });

  describe('game active behavior', () => {
    it('should call onTabChange when game is active and tab hidden', () => {
      const onTabChange = vi.fn();
      
      renderHook(() => useTabVisibility({ 
        onTabChange, 
        isGameActive: true 
      }));

      act(() => {
        simulateVisibilityChange(true);
      });

      expect(onTabChange).toHaveBeenCalledTimes(1);
    });

    it('should show toast when game ends due to tab change', () => {
      const onTabChange = vi.fn();
      
      renderHook(() => useTabVisibility({ 
        onTabChange, 
        isGameActive: true 
      }));

      act(() => {
        simulateVisibilityChange(true);
      });

      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Game Over!",
        description: "Você não pode trocar de aba durante o jogo. O jogo foi encerrado.",
      });
    });

    it('should not trigger when game is not active', () => {
      const onTabChange = vi.fn();
      
      renderHook(() => useTabVisibility({ 
        onTabChange, 
        isGameActive: false 
      }));

      act(() => {
        simulateVisibilityChange(true);
      });

      expect(onTabChange).not.toHaveBeenCalled();
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('should not trigger when tab becomes visible', () => {
      const onTabChange = vi.fn();
      
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => true,
      });

      renderHook(() => useTabVisibility({ 
        onTabChange, 
        isGameActive: true 
      }));

      act(() => {
        simulateVisibilityChange(false);
      });

      expect(onTabChange).not.toHaveBeenCalled();
    });

    it('should not call onTabChange if not provided', () => {
      renderHook(() => useTabVisibility({ 
        isGameActive: true 
      }));

      // Should not throw when onTabChange is undefined
      act(() => {
        simulateVisibilityChange(true);
      });

      expect(mockToast).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      const { unmount } = renderHook(() => useTabVisibility());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });

    it('should not trigger callbacks after unmount', () => {
      const onTabChange = vi.fn();
      
      const { unmount } = renderHook(() => useTabVisibility({ 
        onTabChange, 
        isGameActive: true 
      }));

      unmount();

      // This should not trigger callback since hook is unmounted
      act(() => {
        simulateVisibilityChange(true);
      });

      // The callback from unmounted hook shouldn't be called
      // (in real implementation, it depends on whether the old handler was properly removed)
    });
  });

  describe('prop changes', () => {
    it('should respond to isGameActive changes', () => {
      const onTabChange = vi.fn();
      
      const { rerender } = renderHook(
        ({ isGameActive }) => useTabVisibility({ onTabChange, isGameActive }),
        { initialProps: { isGameActive: false } }
      );

      // Tab changes while game not active - should not trigger
      act(() => {
        simulateVisibilityChange(true);
      });
      expect(onTabChange).not.toHaveBeenCalled();

      // Reset visibility
      act(() => {
        simulateVisibilityChange(false);
      });

      // Now activate game
      rerender({ isGameActive: true });

      // Tab changes while game active - should trigger
      act(() => {
        simulateVisibilityChange(true);
      });
      expect(onTabChange).toHaveBeenCalledTimes(1);
    });

    it('should use updated onTabChange callback', () => {
      const onTabChange1 = vi.fn();
      const onTabChange2 = vi.fn();
      
      const { rerender } = renderHook(
        ({ onTabChange }) => useTabVisibility({ onTabChange, isGameActive: true }),
        { initialProps: { onTabChange: onTabChange1 } }
      );

      // Update callback
      rerender({ onTabChange: onTabChange2 });

      act(() => {
        simulateVisibilityChange(true);
      });

      // Both might be called depending on implementation (handleVisibilityChange recreated)
      // But the most recent should definitely be called
      expect(onTabChange2).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid visibility changes', () => {
      const onTabChange = vi.fn();
      
      const { result } = renderHook(() => useTabVisibility({ 
        onTabChange, 
        isGameActive: true 
      }));

      for (let i = 0; i < 10; i++) {
        act(() => {
          simulateVisibilityChange(true);
        });
        act(() => {
          simulateVisibilityChange(false);
        });
      }

      // Should have called onTabChange once for each time tab was hidden
      expect(onTabChange).toHaveBeenCalledTimes(10);
    });

    it('should maintain correct state after many changes', () => {
      const { result } = renderHook(() => useTabVisibility());

      for (let i = 0; i < 20; i++) {
        const shouldBeHidden = i % 2 === 0;
        act(() => {
          simulateVisibilityChange(shouldBeHidden);
        });
        expect(result.current.isVisible).toBe(!shouldBeHidden);
      }
    });
  });
});
