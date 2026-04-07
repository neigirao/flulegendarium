/**
 * Configurações do jogo.
 * 
 * Nota: O timer foi fixado em 60 segundos por rodada para todos os modos.
 * Este hook é mantido para futuras configurações do jogo.
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';

const STORAGE_KEY = 'lendas-flu-game-settings';

export interface GameSettings {
  // Futuras configurações podem ser adicionadas aqui
}

const DEFAULT_SETTINGS: GameSettings = {};

export const useGameSettings = () => {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<GameSettings>;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        logger.debug('Game settings loaded', 'SETTINGS', parsed);
      }
    } catch (error) {
      logger.error('Failed to load game settings', 'SETTINGS', error);
    }
    setIsLoaded(true);
  }, []);

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

  return {
    settings,
    isLoaded,
    saveSettings,
  };
};
