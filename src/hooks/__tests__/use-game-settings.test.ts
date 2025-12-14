import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameSettings, getStoredTimerDuration, TIMER_OPTIONS } from '../use-game-settings';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('useGameSettings', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should initialize with default settings', () => {
    const { result } = renderHook(() => useGameSettings());
    
    expect(result.current.settings.timerDuration).toBe(30);
  });

  it('should mark as loaded after initialization', async () => {
    const { result } = renderHook(() => useGameSettings());
    
    // Wait for effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoaded).toBe(true);
  });

  it('should load settings from localStorage', async () => {
    localStorageMock.setItem('lendas-flu-game-settings', JSON.stringify({ timerDuration: 45 }));
    
    const { result } = renderHook(() => useGameSettings());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.settings.timerDuration).toBe(45);
  });

  it('should set timer duration', () => {
    const { result } = renderHook(() => useGameSettings());
    
    act(() => {
      result.current.setTimerDuration(20);
    });

    expect(result.current.settings.timerDuration).toBe(20);
  });

  it('should persist timer duration to localStorage', () => {
    const { result } = renderHook(() => useGameSettings());
    
    act(() => {
      result.current.setTimerDuration(45);
    });

    expect(localStorageMock.setItem).toHaveBeenCalled();
    const savedValue = JSON.parse(localStorageMock.setItem.mock.calls.slice(-1)[0][1]);
    expect(savedValue.timerDuration).toBe(45);
  });

  it('should save partial settings', () => {
    const { result } = renderHook(() => useGameSettings());
    
    act(() => {
      result.current.saveSettings({ timerDuration: 20 });
    });

    expect(result.current.settings.timerDuration).toBe(20);
  });

  it('should handle localStorage errors gracefully', async () => {
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useGameSettings());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.settings.timerDuration).toBe(30); // Default value
    expect(result.current.isLoaded).toBe(true);
  });

  it('should handle invalid JSON in localStorage', async () => {
    localStorageMock.setItem('lendas-flu-game-settings', 'invalid-json');
    localStorageMock.getItem.mockReturnValueOnce('invalid-json');

    const { result } = renderHook(() => useGameSettings());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should fall back to defaults on parse error
    expect(result.current.isLoaded).toBe(true);
  });
});

describe('getStoredTimerDuration', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    // Reset the mock to default behavior
    localStorageMock.getItem.mockImplementation((key: string) => {
      return key === 'lendas-flu-game-settings' ? localStorageMock.setItem.mock.calls
        .filter(call => call[0] === key)
        .slice(-1)[0]?.[1] || null : null;
    });
  });

  it('should return default duration when no stored value', () => {
    localStorageMock.getItem.mockReturnValueOnce(null);
    
    const duration = getStoredTimerDuration();
    expect(duration).toBe(30);
  });

  it('should return stored duration', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ timerDuration: 45 }));
    
    const duration = getStoredTimerDuration();
    expect(duration).toBe(45);
  });

  it('should return default for invalid stored value', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ timerDuration: 60 }));
    
    const duration = getStoredTimerDuration();
    expect(duration).toBe(30); // Invalid value, returns default
  });

  it('should return default for invalid JSON', () => {
    localStorageMock.getItem.mockReturnValueOnce('not-json');
    
    const duration = getStoredTimerDuration();
    expect(duration).toBe(30);
  });

  it('should accept all valid timer durations', () => {
    [20, 30, 45].forEach(validDuration => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ timerDuration: validDuration }));
      const duration = getStoredTimerDuration();
      expect(duration).toBe(validDuration);
    });
  });
});

describe('TIMER_OPTIONS', () => {
  it('should have three options', () => {
    expect(TIMER_OPTIONS).toHaveLength(3);
  });

  it('should have correct values', () => {
    expect(TIMER_OPTIONS.map(o => o.value)).toEqual([20, 30, 45]);
  });

  it('should have labels and descriptions', () => {
    TIMER_OPTIONS.forEach(option => {
      expect(option.label).toBeDefined();
      expect(option.description).toBeDefined();
      expect(option.label.length).toBeGreaterThan(0);
      expect(option.description.length).toBeGreaterThan(0);
    });
  });
});
