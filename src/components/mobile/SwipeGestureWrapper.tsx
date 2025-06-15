
import { ReactNode } from 'react';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { cn } from '@/lib/utils';

interface SwipeGestureWrapperProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  disabled?: boolean;
}

export const SwipeGestureWrapper = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className,
  disabled = false
}: SwipeGestureWrapperProps) => {
  const gestures = useTouchGestures({
    onSwipeLeft: disabled ? undefined : onSwipeLeft,
    onSwipeRight: disabled ? undefined : onSwipeRight,
    onSwipeUp: disabled ? undefined : onSwipeUp,
    onSwipeDown: disabled ? undefined : onSwipeDown,
    minSwipeDistance: 80, // Maior distância para evitar gestos acidentais
    maxTapDuration: 200
  });

  return (
    <div
      className={cn('touch-manipulation', className)}
      {...(disabled ? {} : gestures)}
    >
      {children}
    </div>
  );
};
