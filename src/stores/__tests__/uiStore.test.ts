import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetModules();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useUIStore', () => {
  it('should initialize with default values', async () => {
    const { useUIStore } = await import('../uiStore');
    const state = useUIStore.getState();
    
    expect(state.currentRoute).toBe('/');
    expect(state.activeModal).toBeNull();
    expect(state.loadingStates).toEqual({});
    expect(state.isMobile).toBe(false);
    expect(state.sidebarOpen).toBe(false);
    expect(state.theme).toBe('system');
    expect(state.reducedMotion).toBe(false);
    expect(state.notifications).toEqual([]);
  });

  it('should set current route', async () => {
    const { useUIStore } = await import('../uiStore');
    
    act(() => {
      useUIStore.getState().setCurrentRoute('/quiz-adaptativo');
    });

    expect(useUIStore.getState().currentRoute).toBe('/quiz-adaptativo');
  });

  it('should open modal', async () => {
    const { useUIStore } = await import('../uiStore');
    
    act(() => {
      useUIStore.getState().openModal('game-over');
    });

    expect(useUIStore.getState().activeModal).toBe('game-over');
  });

  it('should close modal', async () => {
    const { useUIStore } = await import('../uiStore');
    
    act(() => {
      useUIStore.getState().openModal('settings');
      useUIStore.getState().closeModal();
    });

    expect(useUIStore.getState().activeModal).toBeNull();
  });

  it('should set loading state for specific key', async () => {
    const { useUIStore } = await import('../uiStore');
    
    act(() => {
      useUIStore.getState().setLoading('players', true);
    });

    expect(useUIStore.getState().loadingStates.players).toBe(true);

    act(() => {
      useUIStore.getState().setLoading('players', false);
    });

    expect(useUIStore.getState().loadingStates.players).toBe(false);
  });

  it('should handle multiple loading states independently', async () => {
    const { useUIStore } = await import('../uiStore');
    
    act(() => {
      useUIStore.getState().setLoading('players', true);
      useUIStore.getState().setLoading('rankings', true);
    });

    expect(useUIStore.getState().loadingStates.players).toBe(true);
    expect(useUIStore.getState().loadingStates.rankings).toBe(true);

    act(() => {
      useUIStore.getState().setLoading('players', false);
    });

    expect(useUIStore.getState().loadingStates.players).toBe(false);
    expect(useUIStore.getState().loadingStates.rankings).toBe(true);
  });

  it('should set mobile state', async () => {
    const { useUIStore } = await import('../uiStore');
    
    act(() => {
      useUIStore.getState().setMobile(true);
    });

    expect(useUIStore.getState().isMobile).toBe(true);
  });

  it('should toggle sidebar', async () => {
    const { useUIStore } = await import('../uiStore');
    
    expect(useUIStore.getState().sidebarOpen).toBe(false);

    act(() => {
      useUIStore.getState().toggleSidebar();
    });

    expect(useUIStore.getState().sidebarOpen).toBe(true);

    act(() => {
      useUIStore.getState().toggleSidebar();
    });

    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });

  it('should set theme', async () => {
    const { useUIStore } = await import('../uiStore');
    
    act(() => {
      useUIStore.getState().setTheme('dark');
    });

    expect(useUIStore.getState().theme).toBe('dark');

    act(() => {
      useUIStore.getState().setTheme('light');
    });

    expect(useUIStore.getState().theme).toBe('light');
  });

  it('should set reduced motion preference', async () => {
    const { useUIStore } = await import('../uiStore');
    
    act(() => {
      useUIStore.getState().setReducedMotion(true);
    });

    expect(useUIStore.getState().reducedMotion).toBe(true);
  });

  it('should add notification with auto-generated id and timestamp', async () => {
    const { useUIStore } = await import('../uiStore');
    
    act(() => {
      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Game saved successfully!',
      });
    });

    const notifications = useUIStore.getState().notifications;
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('success');
    expect(notifications[0].message).toBe('Game saved successfully!');
    expect(notifications[0].id).toBeDefined();
    expect(notifications[0].timestamp).toBeDefined();
  });

  it('should add multiple notifications', async () => {
    const { useUIStore } = await import('../uiStore');
    
    act(() => {
      useUIStore.getState().addNotification({
        type: 'success',
        message: 'First notification',
      });
      useUIStore.getState().addNotification({
        type: 'error',
        message: 'Second notification',
      });
    });

    expect(useUIStore.getState().notifications).toHaveLength(2);
  });

  it('should remove notification by id', async () => {
    const { useUIStore } = await import('../uiStore');
    
    act(() => {
      useUIStore.getState().addNotification({
        type: 'info',
        message: 'Test notification',
      });
    });

    const notificationId = useUIStore.getState().notifications[0].id;

    act(() => {
      useUIStore.getState().removeNotification(notificationId);
    });

    expect(useUIStore.getState().notifications).toHaveLength(0);
  });

  it('should auto-remove notification after 5 seconds', async () => {
    const { useUIStore } = await import('../uiStore');
    
    act(() => {
      useUIStore.getState().addNotification({
        type: 'warning',
        message: 'Auto-remove test',
      });
    });

    expect(useUIStore.getState().notifications).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(useUIStore.getState().notifications).toHaveLength(0);
  });

  it('should clear all notifications', async () => {
    const { useUIStore } = await import('../uiStore');
    
    act(() => {
      useUIStore.getState().addNotification({ type: 'success', message: 'One' });
      useUIStore.getState().addNotification({ type: 'error', message: 'Two' });
      useUIStore.getState().addNotification({ type: 'info', message: 'Three' });
    });

    expect(useUIStore.getState().notifications).toHaveLength(3);

    act(() => {
      useUIStore.getState().clearNotifications();
    });

    expect(useUIStore.getState().notifications).toHaveLength(0);
  });

  it('should handle all notification types', async () => {
    const { useUIStore } = await import('../uiStore');
    const types: Array<'success' | 'error' | 'warning' | 'info'> = ['success', 'error', 'warning', 'info'];
    
    types.forEach(type => {
      act(() => {
        useUIStore.getState().addNotification({
          type,
          message: `${type} message`,
        });
      });
    });

    const notifications = useUIStore.getState().notifications;
    expect(notifications).toHaveLength(4);
    
    types.forEach((type, index) => {
      expect(notifications[index].type).toBe(type);
    });
  });

  it('should not fail when removing non-existent notification', async () => {
    const { useUIStore } = await import('../uiStore');
    
    act(() => {
      useUIStore.getState().removeNotification('non-existent-id');
    });

    expect(useUIStore.getState().notifications).toHaveLength(0);
  });
});
