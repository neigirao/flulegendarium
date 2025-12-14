import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsMobile } from '../use-mobile';

// Mock useResponsive
vi.mock('../use-responsive', () => ({
  useResponsive: vi.fn(() => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isXs: false,
    isSm: false,
    isMd: false,
    isLg: true,
    isXl: false,
  })),
}));

describe('useIsMobile', () => {
  it('should return isMobile from useResponsive', async () => {
    const { useResponsive } = await import('../use-responsive');
    
    (useResponsive as any).mockReturnValue({
      isMobile: false,
      isDesktop: true,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should return true when device is mobile', async () => {
    const { useResponsive } = await import('../use-responsive');
    
    (useResponsive as any).mockReturnValue({
      isMobile: true,
      isDesktop: false,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });
});
