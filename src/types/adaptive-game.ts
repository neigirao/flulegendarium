import type { Player, DifficultyLevel } from './guess-game';
import type { DifficultyLevelConfig } from '@/config/difficulty-levels';

export interface DifficultyChangeInfo {
  oldLevel: string;
  newLevel: string;
  reason: string;
  timestamp: number;
}

export interface AdaptiveGameState {
  currentPlayer: Player | null;
  gameKey: number;
  attempts: number;
  score: number;
  gameOver: boolean;
  timeRemaining: number;
  isProcessingGuess: boolean;
  hasLost: boolean;
  isTimerRunning: boolean;
  gamesPlayed: number;
  currentStreak: number;
  maxStreak: number;
  currentDifficulty: DifficultyLevelConfig;
  difficultyProgress: number;
  difficultyChangeInfo: DifficultyChangeInfo | null;
}

export interface AdaptiveGameActions {
  handleGuess: (guess: string) => Promise<void>;
  selectRandomPlayer: () => void;
  handleSkipPlayer: () => void;
  forceRefresh: () => void;
  handlePlayerImageFixed: () => void;
  startGameForPlayer: () => void;
  resetScore: () => void;
  clearDifficultyChange: () => void;
  saveToRanking: () => void;
}

export type AdaptiveGame = AdaptiveGameState & AdaptiveGameActions;
