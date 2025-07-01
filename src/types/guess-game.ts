export interface Player {
  id: string;
  name: string;
  position: string;
  image_url: string;
  year_highlight: string;
  fun_fact: string;
  achievements: string[];
  nicknames?: string[];
  statistics: {
    gols: number;
    jogos: number;
  };
  // Campos de dificuldade
  difficulty_level?: 'muito_facil' | 'facil' | 'medio' | 'dificil' | 'muito_dificil';
  difficulty_score?: number;
  difficulty_confidence?: number;
  total_attempts?: number;
  correct_attempts?: number;
  average_guess_time?: number;
  // Campo de década
  decade?: string;
}

export interface NameProcessingResult {
  processedName: string | null;
  confidence: number;
  matchType?: string;
}

export type DifficultyLevel = 'muito_facil' | 'facil' | 'medio' | 'dificil' | 'muito_dificil';

export interface DifficultyLevelInfo {
  level: DifficultyLevel;
  label: string;
  color: string;
  icon: string;
  multiplier: number;
}

export interface DifficultyChangeInfo {
  direction: 'up' | 'down';
  newLevel: DifficultyLevel;
  oldLevel: DifficultyLevel;
  reason: string;
}

export interface GameProgressInfo {
  currentRound: number;
  currentStreak: number;
  allowedDifficulties: string[];
  nextDifficultyThreshold: number;
}
