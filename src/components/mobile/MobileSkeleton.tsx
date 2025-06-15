
import { cn } from '@/lib/utils';

interface MobileSkeletonProps {
  variant?: 'player-card' | 'menu-item' | 'button' | 'text' | 'circle';
  className?: string;
  count?: number;
}

export const MobileSkeleton = ({ 
  variant = 'text', 
  className,
  count = 1 
}: MobileSkeletonProps) => {
  const variants = {
    'player-card': 'h-[280px] sm:h-[320px] md:h-[380px] rounded-lg',
    'menu-item': 'h-12 rounded-md',
    'button': 'h-11 rounded-lg',
    'text': 'h-4 rounded',
    'circle': 'w-12 h-12 rounded-full'
  };

  const baseClasses = [
    'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200',
    'animate-pulse',
    'bg-[length:200%_100%]'
  ];

  if (count === 1) {
    return (
      <div
        className={cn(
          baseClasses,
          variants[variant],
          className
        )}
      />
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            baseClasses,
            variants[variant],
            className
          )}
        />
      ))}
    </div>
  );
};
