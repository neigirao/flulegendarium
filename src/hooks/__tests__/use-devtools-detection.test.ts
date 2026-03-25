import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDevToolsDetection } from '../use-devtools-detection';

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

  const setWindowSizes = (outer: number, inner: number) => {
    Object.defineProperty(window, 'outerWidth', { value: outer, configurable: true });
    Object.defineProperty(window, 'innerWidth', { value: inner, configurable: true });
    Object.defineProperty(window, 'outerHeight', { value: outer, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: inner, configurable: true });
  };

  const getIntervalHandler = () => setIntervalSpy.mock.calls[0]?.[0] as () => void;

  beforeEach(() => {
    vi.useFakeTimers();
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    documentAddEventListenerSpy = vi.spyOn(document, 'addEventListener');
    documentRemoveEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    setIntervalSpy = vi.spyOn(global, 'setInterval');
    clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    setWindowSizes(1024, 1024);
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

  it('should call callback with f12 reason when F12 is pressed', () => {
    const onDevToolsOpen = vi.fn();

    renderHook(() => useDevToolsDetection(onDevToolsOpen, true));

    const keydownHandler = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'keydown'
    )?.[1] as EventListener;

    const event = new KeyboardEvent('keydown', { key: 'F12' });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });

    keydownHandler(event);

    expect(onDevToolsOpen).toHaveBeenCalledWith('f12');
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not call callback for other shortcuts', () => {
    const onDevToolsOpen = vi.fn();

    renderHook(() => useDevToolsDetection(onDevToolsOpen, true));

    const keydownHandler = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'keydown'
    )?.[1] as EventListener;

    const event = new KeyboardEvent('keydown', {
      key: 'I',
      ctrlKey: true,
      shiftKey: true,
    });

    keydownHandler(event);

    expect(onDevToolsOpen).not.toHaveBeenCalled();
  });

  it('should not block context menu', () => {
    const onDevToolsOpen = vi.fn();

    renderHook(() => useDevToolsDetection(onDevToolsOpen, true));

    const contextMenuHandler = documentAddEventListenerSpy.mock.calls.find(
      call => call[0] === 'contextmenu'
    )?.[1] as EventListener;

    const event = new Event('contextmenu');
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });

    contextMenuHandler(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(onDevToolsOpen).not.toHaveBeenCalled();
  });

  it('should end game on devtools detection without explicit inspect intent', () => {
    const onDevToolsOpen = vi.fn();

    renderHook(() => useDevToolsDetection(onDevToolsOpen, true));

    setWindowSizes(1500, 1000);
    const intervalHandler = getIntervalHandler();
    intervalHandler();

    expect(onDevToolsOpen).toHaveBeenCalledWith('background_detected');
  });

  it('should identify context inspect when devtools is detected after right click', () => {
    const onDevToolsOpen = vi.fn();

    renderHook(() => useDevToolsDetection(onDevToolsOpen, true));

    const contextMenuHandler = documentAddEventListenerSpy.mock.calls.find(
      call => call[0] === 'contextmenu'
    )?.[1] as EventListener;

    contextMenuHandler(new Event('contextmenu'));

    setWindowSizes(1500, 1000);
    const intervalHandler = getIntervalHandler();
    intervalHandler();

    expect(onDevToolsOpen).toHaveBeenCalledWith('context_inspect');
  });

  it('should run periodic check every second', () => {
    const onDevToolsOpen = vi.fn();

    renderHook(() => useDevToolsDetection(onDevToolsOpen, true));

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
  });

  it('should return isDetected property', () => {
    const onDevToolsOpen = vi.fn();

    const { result } = renderHook(() => useDevToolsDetection(onDevToolsOpen, true));

    expect(result.current.isDetected).toBe(false);
  });
});
