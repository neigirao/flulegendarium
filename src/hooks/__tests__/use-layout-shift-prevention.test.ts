import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLayoutShiftPrevention } from '../use-layout-shift-prevention';

describe('useLayoutShiftPrevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a container ref', () => {
    const { result } = renderHook(() => useLayoutShiftPrevention());
    
    expect(result.current.containerRef).toBeDefined();
    expect(result.current.containerRef.current).toBeNull();
  });

  it('should accept reserveSpace option', () => {
    const { result } = renderHook(() => useLayoutShiftPrevention({
      reserveSpace: true,
    }));
    
    expect(result.current.containerRef).toBeDefined();
  });

  it('should accept aspectRatio option', () => {
    const { result } = renderHook(() => useLayoutShiftPrevention({
      aspectRatio: 16 / 9,
    }));
    
    expect(result.current.containerRef).toBeDefined();
  });

  it('should accept minHeight option', () => {
    const { result } = renderHook(() => useLayoutShiftPrevention({
      minHeight: 200,
    }));
    
    expect(result.current.containerRef).toBeDefined();
  });

  it('should use default values', () => {
    const { result } = renderHook(() => useLayoutShiftPrevention());
    
    // The hook should work with defaults
    expect(result.current.containerRef).toBeDefined();
  });

  it('should not set minHeight when reserveSpace is false', () => {
    const mockElement = {
      offsetWidth: 300,
      style: { minHeight: '' },
    };

    const { result } = renderHook(() => useLayoutShiftPrevention({
      reserveSpace: false,
    }));

    // Manually set ref to mock element
    Object.defineProperty(result.current.containerRef, 'current', {
      value: mockElement,
      writable: true,
    });

    // Element style should not be modified
    expect(mockElement.style.minHeight).toBe('');
  });

  it('should calculate minHeight based on aspect ratio', () => {
    const mockElement = {
      offsetWidth: 400,
      style: { minHeight: '' },
    };

    const { result, rerender } = renderHook(() => useLayoutShiftPrevention({
      reserveSpace: true,
      aspectRatio: 2, // width is 2x height
      minHeight: 100,
    }));

    // Simulate the element being attached
    Object.defineProperty(result.current.containerRef, 'current', {
      value: mockElement,
      writable: true,
    });

    // Force re-run of effect
    rerender();

    // With width 400 and aspect ratio 2, height should be 200
    // Which is greater than minHeight 100
    expect(mockElement.style.minHeight).toBe('200px');
  });

  it('should use minHeight when calculated height is smaller', () => {
    const mockElement = {
      offsetWidth: 100,
      style: { minHeight: '' },
    };

    const { result, rerender } = renderHook(() => useLayoutShiftPrevention({
      reserveSpace: true,
      aspectRatio: 1,
      minHeight: 200,
    }));

    Object.defineProperty(result.current.containerRef, 'current', {
      value: mockElement,
      writable: true,
    });

    rerender();

    // With width 100 and aspect ratio 1, calculated height is 100
    // But minHeight is 200, so it should use 200
    expect(mockElement.style.minHeight).toBe('200px');
  });

  it('should handle zero width container', () => {
    const mockElement = {
      offsetWidth: 0,
      style: { minHeight: '' },
    };

    const { result, rerender } = renderHook(() => useLayoutShiftPrevention({
      reserveSpace: true,
      aspectRatio: 1,
      minHeight: 100,
    }));

    Object.defineProperty(result.current.containerRef, 'current', {
      value: mockElement,
      writable: true,
    });

    rerender();

    // Should not set minHeight when width is 0
    expect(mockElement.style.minHeight).toBe('');
  });

  it('should handle null ref', () => {
    const { result } = renderHook(() => useLayoutShiftPrevention({
      reserveSpace: true,
    }));

    // Should not throw when ref is null
    expect(result.current.containerRef.current).toBeNull();
  });

  it('should update minHeight when options change', () => {
    const mockElement = {
      offsetWidth: 300,
      style: { minHeight: '' },
    };

    const { result, rerender } = renderHook(
      ({ aspectRatio }) => useLayoutShiftPrevention({
        reserveSpace: true,
        aspectRatio,
        minHeight: 100,
      }),
      { initialProps: { aspectRatio: 1 } }
    );

    Object.defineProperty(result.current.containerRef, 'current', {
      value: mockElement,
      writable: true,
    });

    rerender({ aspectRatio: 1 });
    expect(mockElement.style.minHeight).toBe('300px');

    rerender({ aspectRatio: 2 });
    expect(mockElement.style.minHeight).toBe('150px');
  });
});
