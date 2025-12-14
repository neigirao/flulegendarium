import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUXFeedback } from '../use-ux-feedback';

// Mock useToast
vi.mock('../use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useUXFeedback', () => {
  it('should initialize with null feedback', () => {
    const { result } = renderHook(() => useUXFeedback());
    expect(result.current.feedback).toBeNull();
  });

  it('should show success feedback', () => {
    const { result } = renderHook(() => useUXFeedback());
    
    act(() => {
      result.current.showSuccess(100, 3, 'Fred');
    });

    expect(result.current.feedback?.type).toBe('success');
    expect(result.current.feedback?.points).toBe(100);
    expect(result.current.feedback?.streak).toBe(3);
  });

  it('should show error feedback', () => {
    const { result } = renderHook(() => useUXFeedback());
    
    act(() => {
      result.current.showError('Fred');
    });

    expect(result.current.feedback?.type).toBe('error');
    expect(result.current.feedback?.message).toContain('Fred');
  });

  it('should show timeout feedback', () => {
    const { result } = renderHook(() => useUXFeedback());
    
    act(() => {
      result.current.showTimeout('Romário');
    });

    expect(result.current.feedback?.type).toBe('timeout');
  });

  it('should show achievement feedback', () => {
    const { result } = renderHook(() => useUXFeedback());
    
    act(() => {
      result.current.showAchievement('Campeão', 'Você venceu!', 5);
    });

    expect(result.current.feedback?.type).toBe('achievement');
    expect(result.current.feedback?.title).toContain('Campeão');
  });

  it('should show hint feedback', () => {
    const { result } = renderHook(() => useUXFeedback());
    
    act(() => {
      result.current.showHint('Jogou nos anos 90');
    });

    expect(result.current.feedback?.type).toBe('hint');
    expect(result.current.feedback?.message).toBe('Jogou nos anos 90');
  });

  it('should close feedback', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useUXFeedback());
    
    act(() => {
      result.current.showSuccess(100);
    });

    expect(result.current.feedback?.show).toBe(true);

    act(() => {
      result.current.closeFeedback();
    });

    expect(result.current.feedback?.show).toBe(false);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.feedback).toBeNull();
    vi.useRealTimers();
  });

  it('should trigger haptic feedback for success', () => {
    const vibrateMock = vi.fn();
    Object.defineProperty(navigator, 'vibrate', { value: vibrateMock, writable: true });

    const { result } = renderHook(() => useUXFeedback());
    
    act(() => {
      result.current.triggerHapticFeedback('success');
    });

    expect(vibrateMock).toHaveBeenCalledWith([50, 50, 50]);
  });

  it('should trigger haptic feedback for error', () => {
    const vibrateMock = vi.fn();
    Object.defineProperty(navigator, 'vibrate', { value: vibrateMock, writable: true });

    const { result } = renderHook(() => useUXFeedback());
    
    act(() => {
      result.current.triggerHapticFeedback('error');
    });

    expect(vibrateMock).toHaveBeenCalledWith([100, 50, 100]);
  });

  it('should show contextual feedback for correct answer', () => {
    const { result } = renderHook(() => useUXFeedback());
    
    act(() => {
      result.current.showContextualFeedback(true, 100, 2, 50, 'Fred');
    });

    expect(result.current.feedback?.type).toBe('success');
  });

  it('should show contextual feedback for incorrect answer', () => {
    const { result } = renderHook(() => useUXFeedback());
    
    act(() => {
      result.current.showContextualFeedback(false, 0, 0, 0, 'Fred');
    });

    expect(result.current.feedback?.type).toBe('error');
  });

  it('should show achievement for streak >= 5', () => {
    const { result } = renderHook(() => useUXFeedback());
    
    act(() => {
      result.current.showContextualFeedback(true, 100, 5, 50, 'Fred');
    });

    expect(result.current.feedback?.type).toBe('achievement');
  });

  it('should show achievement for streak >= 10', () => {
    const { result } = renderHook(() => useUXFeedback());
    
    act(() => {
      result.current.showContextualFeedback(true, 200, 10, 50, 'Fred');
    });

    expect(result.current.feedback?.type).toBe('achievement');
    expect(result.current.feedback?.message).toContain('10');
  });
});
