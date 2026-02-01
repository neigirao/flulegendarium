import { useEffect, useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';

interface GameKeyboardShortcutsOptions {
  /** Handler para Esc (pular) */
  onSkip?: () => void;
  /** Handler para R (reiniciar) */
  onRestart?: () => void;
  /** Handler para teclas numéricas (1-4) - recebe índice 0-3 */
  onSelectOption?: (index: number) => void;
  /** Handler para Enter (confirmar) */
  onConfirm?: () => void;
  /** Handler para ? (ajuda) */
  onHelp?: () => void;
  /** Número máximo de opções (default: 4) */
  maxOptions?: number;
  /** Se os atalhos estão desabilitados */
  disabled?: boolean;
  /** Se o jogo acabou */
  gameOver?: boolean;
  /** Se está processando uma ação */
  isProcessing?: boolean;
}

/**
 * Hook para gerenciar atalhos de teclado no jogo.
 * 
 * Atalhos suportados:
 * - Esc: Pular jogador/camisa
 * - R: Reiniciar jogo (apenas quando game over)
 * - 1-4: Selecionar opções (múltipla escolha)
 * - Enter: Confirmar ação
 * - ?: Mostrar ajuda
 * 
 * @example
 * ```tsx
 * useGameKeyboardShortcuts({
 *   onSkip: handleSkipPlayer,
 *   onRestart: resetGame,
 *   onSelectOption: (index) => handleSelectOption(options[index]),
 *   disabled: gameOver || isProcessing,
 *   gameOver,
 * });
 * ```
 */
export const useGameKeyboardShortcuts = (options: GameKeyboardShortcutsOptions) => {
  const {
    onSkip,
    onRestart,
    onSelectOption,
    onConfirm,
    onHelp,
    maxOptions = 4,
    disabled = false,
    gameOver = false,
    isProcessing = false,
  } = options;

  // Track if a key is currently being processed to prevent double-triggers
  const processingKeyRef = useRef<string | null>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    // Ignore repeated keys
    if (event.repeat || processingKeyRef.current === event.key) {
      return;
    }

    const key = event.key.toLowerCase();
    processingKeyRef.current = event.key;

    // Reset processing after a short delay
    setTimeout(() => {
      processingKeyRef.current = null;
    }, 100);

    // Escape - Skip (only when game is active)
    if (key === 'escape' && onSkip && !gameOver && !disabled && !isProcessing) {
      event.preventDefault();
      logger.debug('Keyboard shortcut: Escape (skip)', 'KEYBOARD');
      onSkip();
      return;
    }

    // R - Restart (only when game is over OR always available)
    if (key === 'r' && onRestart && gameOver) {
      event.preventDefault();
      logger.debug('Keyboard shortcut: R (restart)', 'KEYBOARD');
      onRestart();
      return;
    }

    // 1-4 - Select option (only when game is active)
    if (/^[1-4]$/.test(key) && onSelectOption && !gameOver && !disabled && !isProcessing) {
      const optionIndex = parseInt(key) - 1;
      if (optionIndex < maxOptions) {
        event.preventDefault();
        logger.debug(`Keyboard shortcut: ${key} (select option ${optionIndex})`, 'KEYBOARD');
        onSelectOption(optionIndex);
        return;
      }
    }

    // Enter - Confirm
    if (key === 'enter' && onConfirm && !isProcessing) {
      event.preventDefault();
      logger.debug('Keyboard shortcut: Enter (confirm)', 'KEYBOARD');
      onConfirm();
      return;
    }

    // ? - Help
    if ((key === '?' || (event.shiftKey && key === '/')) && onHelp) {
      event.preventDefault();
      logger.debug('Keyboard shortcut: ? (help)', 'KEYBOARD');
      onHelp();
      return;
    }
  }, [onSkip, onRestart, onSelectOption, onConfirm, onHelp, maxOptions, disabled, gameOver, isProcessing]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Return shortcut info for display
  return {
    shortcuts: [
      { key: 'Esc', action: 'Pular', available: !gameOver && !disabled && !!onSkip },
      { key: 'R', action: 'Reiniciar', available: gameOver && !!onRestart },
      { key: '1-4', action: 'Selecionar opção', available: !gameOver && !disabled && !!onSelectOption },
      { key: 'Enter', action: 'Confirmar', available: !!onConfirm },
      { key: '?', action: 'Ajuda', available: !!onHelp },
    ].filter(s => s.available),
  };
};
