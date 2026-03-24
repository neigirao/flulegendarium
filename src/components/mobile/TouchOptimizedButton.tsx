
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TouchOptimizedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const TouchOptimizedButton = forwardRef<HTMLButtonElement, TouchOptimizedButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, children, ...props }, ref) => {
    const baseStyles = [
      // Minimum touch target size (44px)
      'min-h-[44px] min-w-[44px]',
      // Touch optimizations
      'touch-manipulation select-none',
      // Prevent double-tap zoom
      'user-select-none',
      // Rounded corners for better visual feedback
      'rounded-lg',
      // Transition for better UX
      'transition-all duration-200 ease-out',
      // Focus states for accessibility
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      // Active states for touch feedback
      'active:scale-95 active:transition-none',
      // Flex for content alignment
      'flex items-center justify-center gap-2',
      // Font weight for readability
      'font-medium'
    ];

    const variants = {
      primary: [
        'bg-primary text-white',
        'hover:bg-primary/90',
        'active:bg-primary/80',
        'disabled:bg-muted disabled:text-muted-foreground'
      ],
      secondary: [
        'bg-secondary text-white',
        'hover:bg-secondary/90',
        'active:bg-secondary/80',
        'disabled:bg-muted disabled:text-muted-foreground'
      ],
      outline: [
        'border-2 border-primary text-primary bg-transparent',
        'hover:bg-primary hover:text-white',
        'active:bg-primary/90',
        'disabled:border-border disabled:text-muted-foreground'
      ],
      ghost: [
        'text-primary bg-transparent',
        'hover:bg-primary/10',
        'active:bg-primary/20',
        'disabled:text-muted-foreground'
      ]
    };

    const sizes = {
      sm: ['px-3 py-2 text-sm', 'min-h-[44px]'],
      md: ['px-4 py-3 text-base', 'min-h-[48px]'],
      lg: ['px-6 py-4 text-lg', 'min-h-[52px]']
    };

    const widthStyles = fullWidth ? 'w-full' : 'w-auto';

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          widthStyles,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TouchOptimizedButton.displayName = 'TouchOptimizedButton';
