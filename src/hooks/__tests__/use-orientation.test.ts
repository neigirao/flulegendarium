import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOrientation } from '../use-orientation';

describe('useOrientation', () => {
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

  it('should return portrait orientation by default', () => {
    Object.defineProperty(window, 'screen', {
      value: {
        orientation: { angle: 0 },
      },
      writable: true,
    });

    const { result } = renderHook(() => useOrientation());
    
    expect(result.current.orientation).toBe('portrait');
    expect(result.current.isPortrait).toBe(true);
    expect(result.current.isLandscape).toBe(false);
    expect(result.current.angle).toBe(0);
  });

  it('should detect landscape orientation at 90 degrees', () => {
    Object.defineProperty(window, 'screen', {
      value: {
        orientation: { angle: 90 },
      },
      writable: true,
    });

    const { result } = renderHook(() => useOrientation());
    
    expect(result.current.orientation).toBe('landscape');
    expect(result.current.isPortrait).toBe(false);
    expect(result.current.isLandscape).toBe(true);
    expect(result.current.angle).toBe(90);
  });

  it('should detect landscape orientation at -90 degrees', () => {
    Object.defineProperty(window, 'screen', {
      value: {
        orientation: { angle: -90 },
      },
      writable: true,
    });

    const { result } = renderHook(() => useOrientation());
    
    expect(result.current.orientation).toBe('landscape');
    expect(result.current.isLandscape).toBe(true);
  });

  it('should set up orientation change listeners', () => {
    Object.defineProperty(window, 'screen', {
      value: {
        orientation: { 
          angle: 0,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
      },
      writable: true,
    });

    const { unmount } = renderHook(() => useOrientation());
    
    expect(window.screen.orientation?.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'orientationchange',
      expect.any(Function)
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );

    unmount();

    expect(window.screen.orientation?.removeEventListener).toHaveBeenCalled();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'orientationchange',
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
  });

  it('should update on orientation change event', async () => {
    Object.defineProperty(window, 'screen', {
      value: {
        orientation: { 
          angle: 0,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
      },
      writable: true,
    });

    const { result } = renderHook(() => useOrientation());
    
    expect(result.current.isPortrait).toBe(true);

    // Get the resize handler
    const resizeHandler = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'resize'
    )?.[1] as EventListener;

    // Simulate orientation change
    Object.defineProperty(window, 'screen', {
      value: {
        orientation: { angle: 90 },
      },
      writable: true,
    });

    act(() => {
      resizeHandler(new Event('resize'));
      vi.advanceTimersByTime(100);
    });

    expect(result.current.orientation).toBe('landscape');
    expect(result.current.isLandscape).toBe(true);
  });

  it('should return default values when window is undefined', () => {
    const originalWindow = global.window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = undefined;

    const { result } = renderHook(() => useOrientation());
    
    expect(result.current.orientation).toBe('portrait');
    expect(result.current.isPortrait).toBe(true);
    expect(result.current.angle).toBe(0);

    global.window = originalWindow;
  });

  it('should use legacy window.orientation when screen.orientation is unavailable', () => {
    Object.defineProperty(window, 'screen', {
      value: {},
      writable: true,
    });

    Object.defineProperty(window, 'orientation', {
      value: 90,
      writable: true,
    });

    const { result } = renderHook(() => useOrientation());
    
    expect(result.current.orientation).toBe('landscape');
    expect(result.current.angle).toBe(90);
  });
});
