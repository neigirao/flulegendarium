import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTouch, useTouchGestures, TouchEventLike } from '../use-touch-gestures';

// Helper to create mock touch event data with proper TouchEventLike typing
const createMockTouchEvent = (
  touches: { clientX: number; clientY: number }[], 
  isEnd = false
): TouchEventLike => {
  const touchData = touches.map((t, i) => ({
    ...t,
    identifier: i,
    target: document.body as EventTarget,
    screenX: t.clientX,
    screenY: t.clientY,
    pageX: t.clientX,
    pageY: t.clientY,
    radiusX: 0,
    radiusY: 0,
    rotationAngle: 0,
    force: 0
  }));
  
  // Create a TouchList-like array with item method
  const createTouchList = (items: typeof touchData) => {
    const list = items as unknown as TouchList;
    (list as unknown as { item: (index: number) => Touch | null }).item = (index: number) => items[index] as unknown as Touch || null;
    (list as unknown as { length: number }).length = items.length;
    return list;
  };
  
  if (isEnd) {
    return { changedTouches: createTouchList(touchData) };
  }
  return { touches: createTouchList(touchData) };
};

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
      result.current.startTouch(createMockTouchEvent([{ clientX: 100, clientY: 100 }]));
      result.current.endTouch(createMockTouchEvent([{ clientX: 102, clientY: 102 }], true));
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
      result.current.startTouch(createMockTouchEvent([{ clientX: 100, clientY: 100 }]));
      result.current.endTouch(createMockTouchEvent([{ clientX: 200, clientY: 100 }], true));
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
      result.current.startTouch(createMockTouchEvent([{ clientX: 200, clientY: 100 }]));
      result.current.endTouch(createMockTouchEvent([{ clientX: 100, clientY: 100 }], true));
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
      result.current.startTouch(createMockTouchEvent([{ clientX: 100, clientY: 200 }]));
      result.current.endTouch(createMockTouchEvent([{ clientX: 100, clientY: 100 }], true));
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
      result.current.startTouch(createMockTouchEvent([{ clientX: 100, clientY: 100 }]));
      result.current.endTouch(createMockTouchEvent([{ clientX: 100, clientY: 200 }], true));
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
      result.current.startTouch(createMockTouchEvent([{ clientX: 100, clientY: 100 }]));
      result.current.endTouch(createMockTouchEvent([{ clientX: 200, clientY: 100 }], true));
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
      result.current.startTouch(createMockTouchEvent([{ clientX: 100, clientY: 100 }]));
      // Move 30px - above tap threshold but below swipe threshold
      result.current.endTouch(createMockTouchEvent([{ clientX: 130, clientY: 100 }], true));
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
      result.current.endTouch(createMockTouchEvent([{ clientX: 200, clientY: 100 }], true));
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
      result.current.startTouch(createMockTouchEvent([{ clientX: 100, clientY: 100 }]));
      // Move more horizontally than vertically
      result.current.endTouch(createMockTouchEvent([{ clientX: 200, clientY: 130 }], true));
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
      result.current.startTouch(createMockTouchEvent([{ clientX: 100, clientY: 100 }]));
      // Move more vertically than horizontally
      result.current.endTouch(createMockTouchEvent([{ clientX: 130, clientY: 200 }], true));
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
