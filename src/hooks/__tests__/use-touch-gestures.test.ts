import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTouch, useTouchGestures } from '../use-touch-gestures';

describe('useTouch', () => {
  it('should initialize with default gesture state', () => {
    const { result } = renderHook(() => useTouch({}));
    
    expect(result.current.gestureState.isLongPressing).toBe(false);
    expect(result.current.gestureState.direction).toBeNull();
    expect(result.current.gestureState.distance).toBe(0);
  });

  it('should return touch handlers', () => {
    const { result } = renderHook(() => useTouch({}));
    
    expect(typeof result.current.startTouch).toBe('function');
    expect(typeof result.current.endTouch).toBe('function');
  });

  it('should call onTap for small movement', () => {
    const onTap = vi.fn();
    
    const { result } = renderHook(() => useTouch({ onTap }));
    
    act(() => {
      result.current.startTouch({
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      result.current.endTouch({
        changedTouches: [{ clientX: 102, clientY: 102 }]
      });
    });

    expect(onTap).toHaveBeenCalled();
  });

  it('should call onSwipeRight for right swipe', () => {
    const onSwipeRight = vi.fn();
    
    const { result } = renderHook(() => useTouch({ 
      onSwipeRight,
      threshold: 50 
    }));
    
    act(() => {
      result.current.startTouch({
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      result.current.endTouch({
        changedTouches: [{ clientX: 200, clientY: 100 }]
      });
    });

    expect(onSwipeRight).toHaveBeenCalled();
  });

  it('should call onSwipeLeft for left swipe', () => {
    const onSwipeLeft = vi.fn();
    
    const { result } = renderHook(() => useTouch({ 
      onSwipeLeft,
      threshold: 50 
    }));
    
    act(() => {
      result.current.startTouch({
        touches: [{ clientX: 200, clientY: 100 }]
      });
      
      result.current.endTouch({
        changedTouches: [{ clientX: 100, clientY: 100 }]
      });
    });

    expect(onSwipeLeft).toHaveBeenCalled();
  });

  it('should call onSwipeUp for upward swipe', () => {
    const onSwipeUp = vi.fn();
    
    const { result } = renderHook(() => useTouch({ 
      onSwipeUp,
      threshold: 50 
    }));
    
    act(() => {
      result.current.startTouch({
        touches: [{ clientX: 100, clientY: 200 }]
      });
      
      result.current.endTouch({
        changedTouches: [{ clientX: 100, clientY: 100 }]
      });
    });

    expect(onSwipeUp).toHaveBeenCalled();
  });

  it('should call onSwipeDown for downward swipe', () => {
    const onSwipeDown = vi.fn();
    
    const { result } = renderHook(() => useTouch({ 
      onSwipeDown,
      threshold: 50 
    }));
    
    act(() => {
      result.current.startTouch({
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      result.current.endTouch({
        changedTouches: [{ clientX: 100, clientY: 200 }]
      });
    });

    expect(onSwipeDown).toHaveBeenCalled();
  });

  it('should not trigger callbacks when disabled', () => {
    const onTap = vi.fn();
    const onSwipeRight = vi.fn();
    
    const { result } = renderHook(() => useTouch({ 
      onTap,
      onSwipeRight,
      disabled: true 
    }));
    
    act(() => {
      result.current.startTouch({
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      result.current.endTouch({
        changedTouches: [{ clientX: 200, clientY: 100 }]
      });
    });

    expect(onTap).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('should not trigger on movement below threshold', () => {
    const onSwipeRight = vi.fn();
    const onTap = vi.fn();
    
    const { result } = renderHook(() => useTouch({ 
      onSwipeRight,
      onTap,
      threshold: 100 
    }));
    
    act(() => {
      result.current.startTouch({
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      // Move 30px - above tap threshold but below swipe threshold
      result.current.endTouch({
        changedTouches: [{ clientX: 130, clientY: 100 }]
      });
    });

    expect(onSwipeRight).not.toHaveBeenCalled();
    // Should not be a tap either since movement > 10px
    expect(onTap).not.toHaveBeenCalled();
  });

  it('should handle mouse events without touches property', () => {
    const onTap = vi.fn();
    
    const { result } = renderHook(() => useTouch({ onTap }));
    
    act(() => {
      result.current.startTouch({
        clientX: 100,
        clientY: 100
      });
      
      result.current.endTouch({
        clientX: 102,
        clientY: 102
      });
    });

    expect(onTap).toHaveBeenCalled();
  });

  it('should not call callbacks if startTouch was not called', () => {
    const onTap = vi.fn();
    const onSwipeRight = vi.fn();
    
    const { result } = renderHook(() => useTouch({ 
      onTap,
      onSwipeRight 
    }));
    
    act(() => {
      result.current.endTouch({
        changedTouches: [{ clientX: 200, clientY: 100 }]
      });
    });

    expect(onTap).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('should prefer horizontal swipe when movement is more horizontal', () => {
    const onSwipeRight = vi.fn();
    const onSwipeDown = vi.fn();
    
    const { result } = renderHook(() => useTouch({ 
      onSwipeRight,
      onSwipeDown,
      threshold: 50 
    }));
    
    act(() => {
      result.current.startTouch({
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      // Move more horizontally than vertically
      result.current.endTouch({
        changedTouches: [{ clientX: 200, clientY: 130 }]
      });
    });

    expect(onSwipeRight).toHaveBeenCalled();
    expect(onSwipeDown).not.toHaveBeenCalled();
  });

  it('should prefer vertical swipe when movement is more vertical', () => {
    const onSwipeRight = vi.fn();
    const onSwipeDown = vi.fn();
    
    const { result } = renderHook(() => useTouch({ 
      onSwipeRight,
      onSwipeDown,
      threshold: 50 
    }));
    
    act(() => {
      result.current.startTouch({
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      // Move more vertically than horizontally
      result.current.endTouch({
        changedTouches: [{ clientX: 130, clientY: 200 }]
      });
    });

    expect(onSwipeDown).toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });
});

describe('useTouchGestures', () => {
  it('should be an alias for useTouch', () => {
    expect(useTouchGestures).toBe(useTouch);
  });
});
