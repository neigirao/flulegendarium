
import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Home } from 'lucide-react';
import { SwipeGestureWrapper } from './SwipeGestureWrapper';
import { UniversalTouchTarget } from './UniversalTouchTarget';
import { cn } from '@/lib/utils';

interface MobileGameNavigationProps {
  children: ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  onReset?: () => void;
  onHome?: () => void;
  showNavigation?: boolean;
  className?: string;
}

export const MobileGameNavigation = ({
  children,
  onNext,
  onPrevious,
  onReset,
  onHome,
  showNavigation = true,
  className
}: MobileGameNavigationProps) => {
  return (
    <div className={cn('relative w-full', className)}>
      {/* Main content with swipe gestures */}
      <SwipeGestureWrapper
        onSwipeLeft={onNext}
        onSwipeRight={onPrevious}
        className="w-full"
      >
        {children}
      </SwipeGestureWrapper>

      {/* Mobile navigation bar */}
      {showNavigation && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
          <div className="flex items-center gap-2 bg-card/90 backdrop-blur-md rounded-full p-2 shadow-lg border border-border">
            {onHome && (
              <UniversalTouchTarget
                size="sm"
                onClick={onHome}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Home className="w-5 h-5" />
              </UniversalTouchTarget>
            )}
            
            {onPrevious && (
              <UniversalTouchTarget
                size="sm"
                onClick={onPrevious}
                className="hover:bg-muted"
              >
                <ChevronLeft className="w-5 h-5" />
              </UniversalTouchTarget>
            )}
            
            {onReset && (
              <UniversalTouchTarget
                size="sm"
                onClick={onReset}
                className="hover:bg-muted"
              >
                <RotateCcw className="w-5 h-5" />
              </UniversalTouchTarget>
            )}
            
            {onNext && (
              <UniversalTouchTarget
                size="sm"
                onClick={onNext}
                className="hover:bg-muted"
              >
                <ChevronRight className="w-5 h-5" />
              </UniversalTouchTarget>
            )}
          </div>
          
          {/* Swipe indicator */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="text-xs text-muted-foreground text-center whitespace-nowrap">
              👈 Deslize para navegar 👉
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
