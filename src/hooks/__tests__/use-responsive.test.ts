import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResponsive } from '../use-responsive';

describe('useResponsive', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      value: width,
      writable: true,
    });
  };

  it('should detect extra small screens (< 480px)', () => {
    setWindowWidth(320);

    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isXs).toBe(true);
    expect(result.current.isSm).toBe(false);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should detect small screens (480px - 768px)', () => {
    setWindowWidth(600);

    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isXs).toBe(false);
    expect(result.current.isSm).toBe(true);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
  });

  it('should detect medium screens / tablet (768px - 1024px)', () => {
    setWindowWidth(900);

    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isSm).toBe(false);
    expect(result.current.isMd).toBe(true);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should detect large screens (1024px - 1280px)', () => {
    setWindowWidth(1100);

    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isMd).toBe(false);
    expect(result.current.isLg).toBe(true);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTablet).toBe(false);
  });

  it('should detect extra large screens (>= 1280px)', () => {
    setWindowWidth(1920);

    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isLg).toBe(false);
    expect(result.current.isXl).toBe(true);
    expect(result.current.isDesktop).toBe(true);
  });

  it('should set up resize listener', () => {
    setWindowWidth(1024);

    renderHook(() => useResponsive());
    
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
      { passive: true }
    );
  });

  it('should clean up resize listener on unmount', () => {
    setWindowWidth(1024);

    const { unmount } = renderHook(() => useResponsive());
    
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
  });

  it('should debounce resize events', async () => {
    setWindowWidth(1024);

    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isDesktop).toBe(true);

    // Get the resize handler
    const resizeHandler = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'resize'
    )?.[1] as EventListener;

    // Change width and trigger resize
    setWindowWidth(320);
    
    act(() => {
      resizeHandler(new Event('resize'));
    });

    // Should not have updated yet (debounced)
    expect(result.current.isDesktop).toBe(true);

    // Advance past debounce time
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Now should be updated
    expect(result.current.isXs).toBe(true);
    expect(result.current.isMobile).toBe(true);
  });

  it('should return default values when window is undefined', () => {
    const originalWindow = global.window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = undefined;

    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isXs).toBe(false);
    expect(result.current.isSm).toBe(false);
    expect(result.current.isMd).toBe(false);
    expect(result.current.isLg).toBe(false);
    expect(result.current.isXl).toBe(false);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);

    global.window = originalWindow;
  });

  it('should correctly identify boundary values', () => {
    // Test boundary at 480px
    setWindowWidth(480);
    let { result } = renderHook(() => useResponsive());
    expect(result.current.isSm).toBe(true);
    expect(result.current.isXs).toBe(false);

    // Test boundary at 768px
    setWindowWidth(768);
    ({ result } = renderHook(() => useResponsive()));
    expect(result.current.isMd).toBe(true);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);

    // Test boundary at 1024px
    setWindowWidth(1024);
    ({ result } = renderHook(() => useResponsive()));
    expect(result.current.isLg).toBe(true);
    expect(result.current.isDesktop).toBe(true);

    // Test boundary at 1280px
    setWindowWidth(1280);
    ({ result } = renderHook(() => useResponsive()));
    expect(result.current.isXl).toBe(true);
  });
});
