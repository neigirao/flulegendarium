import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDeviceDetection } from '../use-device-detection';

describe('useDeviceDetection', () => {
  const originalNavigator = global.navigator;
  const originalWindow = global.window;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should detect desktop browser by default', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        maxTouchPoints: 0,
      },
      writable: true,
    });

    const { result } = renderHook(() => useDeviceDetection());
    
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
  });

  it('should detect mobile device', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
        maxTouchPoints: 5,
      },
      writable: true,
    });

    const { result } = renderHook(() => useDeviceDetection());
    
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isIOS).toBe(true);
  });

  it('should detect Android device', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
        maxTouchPoints: 5,
      },
      writable: true,
    });

    const { result } = renderHook(() => useDeviceDetection());
    
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isAndroid).toBe(true);
  });

  it('should detect iPad as tablet', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/604.1',
        maxTouchPoints: 5,
      },
      writable: true,
    });

    const { result } = renderHook(() => useDeviceDetection());
    
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isIOS).toBe(true);
  });

  it('should detect Chrome browser', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        maxTouchPoints: 0,
      },
      writable: true,
    });

    const { result } = renderHook(() => useDeviceDetection());
    
    expect(result.current.isChrome).toBe(true);
    expect(result.current.isSafari).toBe(false);
    expect(result.current.isFirefox).toBe(false);
    expect(result.current.isEdge).toBe(false);
  });

  it('should detect Safari browser', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        maxTouchPoints: 0,
      },
      writable: true,
    });

    const { result } = renderHook(() => useDeviceDetection());
    
    expect(result.current.isSafari).toBe(true);
    expect(result.current.isChrome).toBe(false);
  });

  it('should detect Firefox browser', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        maxTouchPoints: 0,
      },
      writable: true,
    });

    const { result } = renderHook(() => useDeviceDetection());
    
    expect(result.current.isFirefox).toBe(true);
  });

  it('should detect Edge browser', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
        maxTouchPoints: 0,
      },
      writable: true,
    });

    const { result } = renderHook(() => useDeviceDetection());
    
    expect(result.current.isEdge).toBe(true);
    expect(result.current.isChrome).toBe(false);
  });

  it('should detect touch support', () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        maxTouchPoints: 10,
      },
      writable: true,
    });

    Object.defineProperty(global, 'window', {
      value: {
        ...originalWindow,
        ontouchstart: null,
      },
      writable: true,
    });

    const { result } = renderHook(() => useDeviceDetection());
    
    expect(result.current.supportsTouch).toBe(true);
  });

  it('should return device pixel ratio', () => {
    Object.defineProperty(global, 'window', {
      value: {
        ...originalWindow,
        devicePixelRatio: 2,
        innerWidth: 1920,
        outerWidth: 1920,
        innerHeight: 1080,
        outerHeight: 1080,
      },
      writable: true,
    });

    const { result } = renderHook(() => useDeviceDetection());
    
    expect(result.current.devicePixelRatio).toBe(2);
  });

  it('should return default values when window is undefined', () => {
    // This tests SSR scenario
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    const { result } = renderHook(() => useDeviceDetection());
    
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.supportsTouch).toBe(false);
    expect(result.current.devicePixelRatio).toBe(1);

    global.window = originalWindow;
  });
});
