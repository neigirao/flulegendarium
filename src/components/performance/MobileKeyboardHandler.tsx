import { useEffect } from 'react';
import { useMobileOptimization } from '@/hooks/mobile';

interface MobileKeyboardHandlerProps {
  children: React.ReactNode;
}

export const MobileKeyboardHandler = ({ children }: MobileKeyboardHandlerProps) => {
  const { isKeyboardOpen, viewportInfo } = useMobileOptimization();

  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    
    if (viewportInfo.isMobile) {
      if (isKeyboardOpen) {
        // When keyboard opens, prevent zooming and adjust viewport
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
        
        // Add class to body for CSS adjustments
        document.body.classList.add('keyboard-open');
        
        // Scroll active input into view
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          setTimeout(() => {
            activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      } else {
        // When keyboard closes, restore normal viewport
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }
        
        document.body.classList.remove('keyboard-open');
      }
    }
  }, [isKeyboardOpen, viewportInfo.isMobile]);

  return <>{children}</>;
};