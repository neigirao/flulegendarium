
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
  // Novos campos de dificuldade
  difficulty_level?: 'muito_facil' | 'facil' | 'medio' | 'dificil' | 'muito_dificil';
  difficulty_score?: number;
  difficulty_confidence?: number;
  total_attempts?: number;
  correct_attempts?: number;
  average_guess_time?: number;
}

export interface NameProcessingResult {
  processedName: string | null;
  confidence: number;
  matchType?: string;
}

export interface DifficultyLevel {
  level: 'muito_facil' | 'facil' | 'medio' | 'dificil' | 'muito_dificil';
  label: string;
  color: string;
  icon: string;
  multiplier: number;
}

export interface GameProgressInfo {
  currentRound: number;
  currentStreak: number;
  allowedDifficulties: string[];
  nextDifficultyThreshold: number;
}
