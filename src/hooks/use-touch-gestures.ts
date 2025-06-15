
import { useCallback, useRef } from 'react';

export interface TouchGestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  minSwipeDistance?: number;
  maxTapDuration?: number;
}

export function useTouchGestures(handlers: TouchGestureHandlers) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    minSwipeDistance = 50,
    maxTapDuration = 300,
  } = handlers;

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTap = useRef<number>(0);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    },
    []
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;
      const deltaTime = Date.now() - touchStart.current.time;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Handle tap gestures
      if (distance < minSwipeDistance && deltaTime < maxTapDuration) {
        const now = Date.now();
        const timeSinceLastTap = now - lastTap.current;
        
        if (timeSinceLastTap < 300 && onDoubleTap) {
          onDoubleTap();
          lastTap.current = 0; // Reset to prevent triple tap
        } else {
          lastTap.current = now;
          // Delay single tap to check for double tap
          setTimeout(() => {
            if (lastTap.current === now && onTap) {
              onTap();
            }
          }, 300);
        }
        return;
      }

      // Handle swipe gestures
      if (distance >= minSwipeDistance) {
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }

      touchStart.current = null;
    },
    [
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      onTap,
      onDoubleTap,
      minSwipeDistance,
      maxTapDuration,
    ]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}
