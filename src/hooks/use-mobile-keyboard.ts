
import { useEffect, useCallback } from 'react';

interface UseMobileKeyboardOptions {
  onKeyboardShow?: () => void;
  onKeyboardHide?: () => void;
  adjustViewport?: boolean;
}

export const useMobileKeyboard = (options: UseMobileKeyboardOptions = {}) => {
  const { onKeyboardShow, onKeyboardHide, adjustViewport = true } = options;

  const handleResize = useCallback(() => {
    // Detectar se o teclado está aberto comparando alturas
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.clientHeight;
    const heightDifference = documentHeight - windowHeight;
    
    const isKeyboardOpen = heightDifference > 150; // Threshold para detectar teclado

    if (isKeyboardOpen) {
      document.body.classList.add('keyboard-open');
      
      if (adjustViewport) {
        // Ajustar viewport quando teclado aparecer
        document.documentElement.style.setProperty('--viewport-height', `${windowHeight}px`);
      }
      
      onKeyboardShow?.();
    } else {
      document.body.classList.remove('keyboard-open');
      
      if (adjustViewport) {
        document.documentElement.style.removeProperty('--viewport-height');
      }
      
      onKeyboardHide?.();
    }
  }, [onKeyboardShow, onKeyboardHide, adjustViewport]);

  useEffect(() => {
    // Detectar mudanças de viewport que indicam teclado
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Para iOS, também escutar mudanças de visual viewport
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', handleResize);
    }

    // CSS customizado para quando teclado está aberto
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-open {
        --safe-area-inset-bottom: 0px;
      }
      
      .keyboard-open .fixed-bottom {
        transform: translateY(-50px);
        transition: transform 0.3s ease;
      }
      
      @supports (height: 100dvh) {
        .full-height-mobile {
          height: var(--viewport-height, 100dvh);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('resize', handleResize);
      if ('visualViewport' in window) {
        window.visualViewport?.removeEventListener('resize', handleResize);
      }
      document.head.removeChild(style);
      document.body.classList.remove('keyboard-open');
    };
  }, [handleResize]);

  return {
    isKeyboardOpen: document.body.classList.contains('keyboard-open')
  };
};
