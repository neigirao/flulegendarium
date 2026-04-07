import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGameSettings } from '../use-game-settings';

describe('useGameSettings', () => {
  it('should return default settings', () => {
    const { result } = renderHook(() => useGameSettings());
    expect(result.current.settings).toBeDefined();
    expect(result.current.isLoaded).toBe(true);
  });

  it('should expose saveSettings', () => {
    const { result } = renderHook(() => useGameSettings());
    expect(typeof result.current.saveSettings).toBe('function');
  });
});
