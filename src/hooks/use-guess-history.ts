import { useState, useCallback } from 'react';

export interface GuessHistoryEntry {
  id: string;
  playerName: string;
  playerImageUrl?: string;
  guess: string;
  isCorrect: boolean;
  timestamp: number;
  difficulty?: string;
  pointsEarned?: number;
  timeRemaining?: number;
}

export interface UseGuessHistoryReturn {
  history: GuessHistoryEntry[];
  addEntry: (entry: Omit<GuessHistoryEntry, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  getStats: () => {
    totalGuesses: number;
    correctGuesses: number;
    incorrectGuesses: number;
    accuracy: number;
  };
}

/**
 * Hook para gerenciar histórico de tentativas durante uma sessão de jogo.
 */
export const useGuessHistory = (): UseGuessHistoryReturn => {
  const [history, setHistory] = useState<GuessHistoryEntry[]>([]);

  const addEntry = useCallback((entry: Omit<GuessHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: GuessHistoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    setHistory(prev => [...prev, newEntry]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getStats = useCallback(() => {
    const totalGuesses = history.length;
    const correctGuesses = history.filter(h => h.isCorrect).length;
    const incorrectGuesses = totalGuesses - correctGuesses;
    const accuracy = totalGuesses > 0 ? (correctGuesses / totalGuesses) * 100 : 0;
    
    return {
      totalGuesses,
      correctGuesses,
      incorrectGuesses,
      accuracy,
    };
  }, [history]);

  return {
    history,
    addEntry,
    clearHistory,
    getStats,
  };
};
