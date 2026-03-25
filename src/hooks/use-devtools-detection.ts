import { useEffect, useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';

export type DevToolsDetectionReason = 'f12' | 'context_inspect' | 'background_detected';

/**
 * Hook para detectar abertura de ferramentas de desenvolvedor (DevTools).
 *
 * Regra anti-trapaça: qualquer DevTools detectado encerra o jogo.
 * A mensagem específica de inspeção deve ser exibida apenas para tentativas explícitas.
 */
export const useDevToolsDetection = (
  onDevToolsOpen: (reason: DevToolsDetectionReason) => void,
  enabled: boolean = true
) => {
  const isDevToolsOpen = useRef(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inspectIntentDeadlineRef = useRef<number | null>(null);

  const detectDevTools = useCallback((): boolean => {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;

    let devtoolsDetected = false;
    const element = new Image();

    Object.defineProperty(element, 'id', {
      get: () => {
        devtoolsDetected = true;
        return '';
      },
    });

    console.log('%c', element);
    console.clear();

    return widthThreshold || heightThreshold || devtoolsDetected;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    checkIntervalRef.current = setInterval(() => {
      if (isDevToolsOpen.current || !detectDevTools()) return;

      const hasInspectIntent =
        inspectIntentDeadlineRef.current !== null &&
        Date.now() <= inspectIntentDeadlineRef.current;

      isDevToolsOpen.current = true;
      inspectIntentDeadlineRef.current = null;

      if (hasInspectIntent) {
        logger.warn('DevTools detected after explicit inspect intent - ending game', 'ANTI_CHEAT');
        onDevToolsOpen('context_inspect');
        return;
      }

      logger.warn('DevTools detected in background - ending game', 'ANTI_CHEAT');
      onDevToolsOpen('background_detected');
    }, 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'F12') {
        return;
      }

      e.preventDefault();
      inspectIntentDeadlineRef.current = Date.now() + 5000;
      isDevToolsOpen.current = true;
      logger.warn('F12 key detected - ending game', 'ANTI_CHEAT');
      onDevToolsOpen('f12');
    };

    const handleContextMenu = () => {
      inspectIntentDeadlineRef.current = Date.now() + 5000;
      logger.info('Context menu opened - waiting for inspect action', 'ANTI_CHEAT');
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

  useEffect(() => {
    if (!enabled) {
      isDevToolsOpen.current = false;
      inspectIntentDeadlineRef.current = null;
    }
  }, [enabled]);

  return {
    isDetected: isDevToolsOpen.current,
  };
};
