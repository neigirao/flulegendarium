import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDevToolsDetection } from '../use-devtools-detection';

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('useDevToolsDetection', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let documentAddEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let documentRemoveEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let setIntervalSpy: ReturnType<typeof vi.spyOn>;
  let clearIntervalSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    documentAddEventListenerSpy = vi.spyOn(document, 'addEventListener');
    documentRemoveEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    setIntervalSpy = vi.spyOn(global, 'setInterval');
    clearIntervalSpy = vi.spyOn(global, 'clearInterval');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should set up event listeners when enabled', () => {
    const onDevToolsOpen = vi.fn();
    
    renderHook(() => useDevToolsDetection(onDevToolsOpen, true));
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(documentAddEventListenerSpy).toHaveBeenCalledWith('contextmenu', expect.any(Function));
    expect(setIntervalSpy).toHaveBeenCalled();
  });

  it('should not set up event listeners when disabled', () => {
    const onDevToolsOpen = vi.fn();
    
    renderHook(() => useDevToolsDetection(onDevToolsOpen, false));
    
    expect(addEventListenerSpy).not.toHaveBeenCalled();
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it('should clean up event listeners on unmount', () => {
    const onDevToolsOpen = vi.fn();
    
    const { unmount } = renderHook(() => useDevToolsDetection(onDevToolsOpen, true));
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(documentRemoveEventListenerSpy).toHaveBeenCalledWith('contextmenu', expect.any(Function));
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('should call callback when F12 is pressed', () => {
    const onDevToolsOpen = vi.fn();
    
    renderHook(() => useDevToolsDetection(onDevToolsOpen, true));
    
    // Get the keydown handler
    const keydownHandler = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'keydown'
    )?.[1] as EventListener;

    const event = new KeyboardEvent('keydown', { key: 'F12' });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    
    keydownHandler(event);
    
    expect(onDevToolsOpen).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should call callback when Ctrl+Shift+I is pressed', () => {
    const onDevToolsOpen = vi.fn();
    
    renderHook(() => useDevToolsDetection(onDevToolsOpen, true));
    
    const keydownHandler = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'keydown'
    )?.[1] as EventListener;

    const event = new KeyboardEvent('keydown', { 
      key: 'I', 
      ctrlKey: true, 
      shiftKey: true 
    });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    
    keydownHandler(event);
    
    expect(onDevToolsOpen).toHaveBeenCalled();
  });

  it('should call callback when Ctrl+Shift+J is pressed', () => {
    const onDevToolsOpen = vi.fn();
    
    renderHook(() => useDevToolsDetection(onDevToolsOpen, true));
    
    const keydownHandler = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'keydown'
    )?.[1] as EventListener;

    const event = new KeyboardEvent('keydown', { 
      key: 'J', 
      ctrlKey: true, 
      shiftKey: true 
    });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    
    keydownHandler(event);
    
    expect(onDevToolsOpen).toHaveBeenCalled();
  });

  it('should call callback when Ctrl+U is pressed', () => {
    const onDevToolsOpen = vi.fn();
    
    renderHook(() => useDevToolsDetection(onDevToolsOpen, true));
    
    const keydownHandler = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'keydown'
    )?.[1] as EventListener;

    const event = new KeyboardEvent('keydown', { 
      key: 'u', 
      ctrlKey: true 
    });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    
    keydownHandler(event);
    
    expect(onDevToolsOpen).toHaveBeenCalled();
  });

  it('should block context menu', () => {
    const onDevToolsOpen = vi.fn();
    
    renderHook(() => useDevToolsDetection(onDevToolsOpen, true));
    
    const contextMenuHandler = documentAddEventListenerSpy.mock.calls.find(
      call => call[0] === 'contextmenu'
    )?.[1] as EventListener;

    const event = new Event('contextmenu');
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    
    contextMenuHandler(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not call callback for normal key presses', () => {
    const onDevToolsOpen = vi.fn();
    
    renderHook(() => useDevToolsDetection(onDevToolsOpen, true));
    
    const keydownHandler = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'keydown'
    )?.[1] as EventListener;

    const event = new KeyboardEvent('keydown', { key: 'A' });
    
    keydownHandler(event);
    
    expect(onDevToolsOpen).not.toHaveBeenCalled();
  });

  it('should return isDetected property', () => {
    const onDevToolsOpen = vi.fn();
    
    const { result } = renderHook(() => useDevToolsDetection(onDevToolsOpen, true));
    
    expect(result.current.isDetected).toBe(false);
  });

  it('should run periodic check every second', () => {
    const onDevToolsOpen = vi.fn();
    
    renderHook(() => useDevToolsDetection(onDevToolsOpen, true));
    
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
  });
});
