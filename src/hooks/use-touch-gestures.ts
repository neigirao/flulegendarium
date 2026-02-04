import { useState, useCallback, useRef } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

interface GestureState {
  isLongPressing: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
}

interface UseTouchProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  threshold?: number;
  minSwipeDistance?: number;
  longPressThreshold?: number;
  doubleTapThreshold?: number;
  maxTapDuration?: number;
  disabled?: boolean;
}

interface TouchEventLike {
  touches?: TouchList;
  changedTouches?: TouchList;
  clientX?: number;
  clientY?: number;
}

export const useTouch = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  threshold = 50,
  disabled = false
}: UseTouchProps) => {
  const [gestureState, setGestureState] = useState<GestureState>({
    isLongPressing: false,
    direction: null,
    distance: 0
  });

  const touchStart = useRef<TouchPoint | null>(null);

  const startTouch = useCallback((e: TouchEventLike) => {
    if (disabled) return;
    const touch = e.touches?.[0] || e;
    touchStart.current = {
      x: touch.clientX || 0,
      y: touch.clientY || 0,
      time: Date.now()
    };
  }, [disabled]);

  const endTouch = useCallback((e: TouchEventLike) => {
    if (disabled || !touchStart.current) return;
    const touch = e.changedTouches?.[0] || e;
    const deltaX = (touch.clientX || 0) - touchStart.current.x;
    const deltaY = (touch.clientY || 0) - touchStart.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < 10) {
      onTap?.();
    } else if (distance >= threshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }
    touchStart.current = null;
  }, [disabled, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap]);

  return { startTouch, endTouch, gestureState };
};

export const useTouchGestures = useTouch;