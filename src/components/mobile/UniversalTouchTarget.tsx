
import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface UniversalTouchTargetProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const UniversalTouchTarget = forwardRef<HTMLDivElement, UniversalTouchTargetProps>(
  ({ children, className, size = 'md', interactive = true, ...props }, ref) => {
    const sizeClasses = {
      sm: 'min-h-[44px] min-w-[44px] p-2',
      md: 'min-h-[48px] min-w-[48px] p-3',
      lg: 'min-h-[52px] min-w-[52px] p-4'
    };

    const interactiveClasses = interactive ? [
      'touch-manipulation',
      'select-none',
      'cursor-pointer',
      'transition-all duration-200',
      'active:scale-95',
      'hover:bg-gray-50',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flu-grena'
    ] : [];

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center rounded-lg',
          sizeClasses[size],
          interactiveClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

UniversalTouchTarget.displayName = 'UniversalTouchTarget';
