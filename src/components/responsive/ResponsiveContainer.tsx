
import { ReactNode } from 'react';
import { useResponsive, useOrientation, useDeviceDetection } from '@/hooks/mobile';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
  portraitClassName?: string;
  landscapeClassName?: string;
}

export function ResponsiveContainer({
  children,
  className,
  mobileClassName,
  tabletClassName,
  desktopClassName,
  portraitClassName,
  landscapeClassName,
}: ResponsiveContainerProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { isPortrait, isLandscape } = useOrientation();
  const { supportsTouch } = useDeviceDetection();

  return (
    <div
      className={cn(
        'responsive-container',
        // Base responsive classes
        'min-h-screen w-full',
        // Touch device optimizations
        supportsTouch && 'touch-manipulation',
        // Device-specific classes
        isMobile && 'mobile-container',
        isTablet && 'tablet-container', 
        isDesktop && 'desktop-container',
        // Orientation-specific classes
        isPortrait && 'portrait-container',
        isLandscape && 'landscape-container',
        // Custom classes
        className,
        isMobile && mobileClassName,
        isTablet && tabletClassName,
        isDesktop && desktopClassName,
        isPortrait && portraitClassName,
        isLandscape && landscapeClassName
      )}
    >
      {children}
    </div>
  );
}
