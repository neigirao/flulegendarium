import { useEffect, useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';

/**
 * Hook para detectar abertura de ferramentas de desenvolvedor (DevTools).
 * 
 * Usado como medida anti-trapaça nos jogos, encerrando a partida
 * quando o usuário tenta inspecionar a página.
 * 
 * @param onDevToolsOpen - Callback executado quando DevTools é detectado
 * @param enabled - Se a detecção está ativa (default: true)
 */
export const useDevToolsDetection = (
  onDevToolsOpen: () => void,
  enabled: boolean = true
) => {
  const isDevToolsOpen = useRef(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const detectDevTools = useCallback((): boolean => {
    // Método 1: Diferença de tamanho da janela (funciona bem no Chrome/Firefox)
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    
    // Método 2: Firebug detection via console
    let devtoolsDetected = false;
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: function() {
        devtoolsDetected = true;
        return '';
      }
    });
    
    // Tentar acionar o getter
    console.log('%c', element);
    console.clear();
    
    return widthThreshold || heightThreshold || devtoolsDetected;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Verificação periódica
    checkIntervalRef.current = setInterval(() => {
      if (detectDevTools() && !isDevToolsOpen.current) {
        isDevToolsOpen.current = true;
        logger.warn('DevTools detected - ending game', 'ANTI_CHEAT');
        onDevToolsOpen();
      }
    }, 1000);

    // Listener para teclas de DevTools
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        logger.warn('F12 key blocked', 'ANTI_CHEAT');
        onDevToolsOpen();
        return;
      }
      
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools shortcuts)
      if (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        logger.warn('DevTools shortcut blocked', 'ANTI_CHEAT');
        onDevToolsOpen();
        return;
      }
      
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        logger.warn('View source blocked', 'ANTI_CHEAT');
        onDevToolsOpen();
        return;
      }
    };

    // Bloquear clique direito
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      logger.info('Context menu blocked', 'ANTI_CHEAT');
      return false;
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [enabled, detectDevTools, onDevToolsOpen]);

  // Reset quando desabilitado
  useEffect(() => {
    if (!enabled) {
      isDevToolsOpen.current = false;
    }
  }, [enabled]);

  return {
    isDetected: isDevToolsOpen.current
  };
};
