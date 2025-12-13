import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';

const STORAGE_KEY = 'lendas-flu-game-settings';

export type TimerDuration = 20 | 30 | 45;

export interface GameSettings {
  timerDuration: TimerDuration;
}

const DEFAULT_SETTINGS: GameSettings = {
  timerDuration: 30,
};

export const TIMER_OPTIONS: { value: TimerDuration; label: string; description: string }[] = [
  { value: 20, label: '20s', description: 'Desafiador' },
  { value: 30, label: '30s', description: 'Padrão' },
  { value: 45, label: '45s', description: 'Relaxado' },
];

/**
 * Hook para gerenciar configurações do jogo com persistência em localStorage.
 */
export const useGameSettings = () => {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar configurações do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<GameSettings>;
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
        });
        logger.debug('Game settings loaded', 'SETTINGS', parsed);
      }
    } catch (error) {
      logger.error('Failed to load game settings', 'SETTINGS', error);
    }
    setIsLoaded(true);
  }, []);

  // Salvar configurações no localStorage
  const saveSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        logger.debug('Game settings saved', 'SETTINGS', updated);
      } catch (error) {
        logger.error('Failed to save game settings', 'SETTINGS', error);
      }
      return updated;
    });
  }, []);

  const setTimerDuration = useCallback((duration: TimerDuration) => {
    saveSettings({ timerDuration: duration });
  }, [saveSettings]);

  return {
    settings,
    isLoaded,
    setTimerDuration,
    saveSettings,
  };
};

/**
 * Função utilitária para obter duração do timer do localStorage (sem hook).
 */
export const getStoredTimerDuration = (): TimerDuration => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<GameSettings>;
      if (parsed.timerDuration && [20, 30, 45].includes(parsed.timerDuration)) {
        return parsed.timerDuration;
      }
    }
  } catch {
    // Ignorar erros de parse
  }
  return DEFAULT_SETTINGS.timerDuration;
};
