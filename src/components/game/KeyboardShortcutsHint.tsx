import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShortcutInfo {
  key: string;
  action: string;
  available: boolean;
}

interface KeyboardShortcutsHintProps {
  shortcuts: ShortcutInfo[];
  show?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Componente visual para exibir atalhos de teclado disponíveis.
 * Mostra uma barra discreta com as teclas e suas ações.
 */
export const KeyboardShortcutsHint: React.FC<KeyboardShortcutsHintProps> = ({
  shortcuts,
  show = true,
  compact = true,
  className,
}) => {
  const availableShortcuts = shortcuts.filter(s => s.available);

  if (!show || availableShortcuts.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={cn(
          'flex items-center justify-center gap-3 text-xs text-muted-foreground',
          compact && 'gap-2',
          className
        )}
      >
        <Keyboard className="w-3 h-3 opacity-50" />
        
        {availableShortcuts.map((shortcut, index) => (
          <React.Fragment key={shortcut.key}>
            <span className="flex items-center gap-1">
              <kbd className={cn(
                'px-1.5 py-0.5 rounded font-mono text-[10px]',
                'bg-muted border border-border',
                'shadow-sm'
              )}>
                {shortcut.key}
              </kbd>
              <span className="hidden sm:inline">{shortcut.action}</span>
            </span>
            {index < availableShortcuts.length - 1 && (
              <span className="text-border">•</span>
            )}
          </React.Fragment>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
