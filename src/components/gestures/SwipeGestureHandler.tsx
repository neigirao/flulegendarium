import React, { useRef, useEffect, useState } from 'react';
import { useTouch } from '@/hooks/mobile';

interface SwipeGestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export const SwipeGestureHandler: React.FC<SwipeGestureHandlerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onDoubleTap,
  onLongPress,
  threshold = 50,
  className = '',
  disabled = false
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isPressed, setIsPressed] = useState(false);

  const {
    startTouch,
    endTouch,
    gestureState
  } = useTouch({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    onLongPress,
    threshold,
    disabled
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element || disabled) return;

    // Touch Events
    const handleTouchStart = (e: TouchEvent) => {
      setIsPressed(true);
      startTouch(e);
      
      // Haptic feedback para iOS
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      setIsPressed(false);
      endTouch(e);
    };

    // Mouse Events (para desktop)
    const handleMouseDown = (e: MouseEvent) => {
      setIsPressed(true);
      const syntheticTouch = {
        touches: [{ clientX: e.clientX, clientY: e.clientY }],
        preventDefault: e.preventDefault.bind(e)
      } as unknown as TouchEvent;
      startTouch(syntheticTouch);
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsPressed(false);
      const syntheticTouch = {
        changedTouches: [{ clientX: e.clientX, clientY: e.clientY }],
        preventDefault: e.preventDefault.bind(e)
      } as unknown as TouchEvent;
      endTouch(syntheticTouch);
    };

    // Adicionar event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
    };
  }, [startTouch, endTouch, disabled]);

  return (
    <div
      ref={elementRef}
      className={`
        touch-manipulation select-none cursor-pointer
        transition-transform duration-150 ease-out
        ${isPressed ? 'scale-[0.98] opacity-90' : 'scale-100 opacity-100'}
        ${gestureState.isLongPressing ? 'scale-95' : ''}
        ${className}
      `}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {children}
      
      {/* Visual feedback overlay */}
      {isPressed && (
        <div className="absolute inset-0 bg-primary/10 rounded-lg pointer-events-none animate-pulse" />
      )}
      
      {/* Swipe direction indicator */}
      {gestureState.direction && gestureState.distance > threshold / 2 && (
        <div className={`
          absolute inset-0 flex items-center justify-center
          pointer-events-none transition-opacity duration-200
          ${gestureState.distance > threshold ? 'opacity-80' : 'opacity-40'}
        `}>
          <div className={`
            text-2xl transform transition-transform duration-200
            ${gestureState.direction === 'left' ? 'translate-x-2' : ''}
            ${gestureState.direction === 'right' ? '-translate-x-2' : ''}
            ${gestureState.direction === 'up' ? 'translate-y-2' : ''}
            ${gestureState.direction === 'down' ? '-translate-y-2' : ''}
          `}>
            {gestureState.direction === 'left' && '👈'}
            {gestureState.direction === 'right' && '👉'}
            {gestureState.direction === 'up' && '👆'}
            {gestureState.direction === 'down' && '👇'}
          </div>
        </div>
      )}
    </div>
  );
};

// Hook personalizado para gestos touch
interface UseSwipeGesturesProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSwipeGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50
}: UseSwipeGesturesProps) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) < threshold) {
      setTouchStart(null);
      return;
    }

    if (absX > absY) {
      // Horizontal swipe
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    setTouchStart(null);
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  };
};