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

export const useTouch = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onDoubleTap,
  onLongPress,
  threshold = 50,
  longPressThreshold = 500,
  doubleTapThreshold = 300,
  disabled = false
}: UseTouchProps) => {
  const [gestureState, setGestureState] = useState<GestureState>({
    isLongPressing: false,
    direction: null,
    distance: 0
  });

  const touchStart = useRef<TouchPoint | null>(null);
  const lastTap = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const startTouch = useCallback((e: any) => {
    if (disabled) return;
    const touch = e.touches?.[0] || e;
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, [disabled]);

  const endTouch = useCallback((e: any) => {
    if (disabled || !touchStart.current) return;
    const touch = e.changedTouches?.[0] || e;
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < 10) {
      onTap?.();
    } else if (distance >= threshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        deltaX > 0 ? onSwipeRight?.() : onSwipeLeft?.();
      } else {
        deltaY > 0 ? onSwipeDown?.() : onSwipeUp?.();
      }
    }
    touchStart.current = null;
  }, [disabled, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap]);

  return { startTouch, endTouch, gestureState };
};

export const useTouchGestures = useTouch;