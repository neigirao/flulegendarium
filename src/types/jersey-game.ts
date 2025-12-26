import type { DifficultyLevel } from '@/types/guess-game';

/**
 * Tipo de camisa
 */
export type JerseyType = 'home' | 'away' | 'third' | 'special';

/**
 * Opção de ano para múltipla escolha
 */
export interface JerseyYearOption {
  year: number;
  isCorrect: boolean;
  position: number;
}

/**
 * Interface principal da camisa
 */
export interface Jersey {
  id: string;
  years: number[];
  image_url: string;
  type: JerseyType;
  manufacturer?: string | null;
  season?: string | null;
  title?: string | null;
  fun_fact?: string | null;
  nicknames?: string[] | null;
  difficulty_level?: DifficultyLevel | null;
  difficulty_score?: number | null;
  difficulty_confidence?: number | null;
  total_attempts?: number | null;
  correct_attempts?: number | null;
  average_guess_time?: number | null;
  decades?: string[] | null;
  created_at?: string;
}

/**
 * Resultado de um palpite no Quiz das Camisas
 */
export interface JerseyGuessResult {
  isCorrect: boolean;
  yearDifference: number;
  hint?: 'higher' | 'lower';
  pointsEarned: number;
  bonusPoints?: number;
  correctYears: number[];
  matchedYear?: number;
  userGuess: number;
}

/**
 * Estado do jogo de camisas
 */
export interface JerseyGameState {
  currentJersey: Jersey | null;
  score: number;
  attempts: number;
  correctGuesses: number;
  currentStreak: number;
  maxStreak: number;
  gameOver: boolean;
  gameActive: boolean;
  timeRemaining: number;
  difficulty: DifficultyLevel;
  usedJerseyIds: Set<string>;
  currentOptions: JerseyYearOption[];
  selectedOption: number | null;
  showResult: boolean;
}

/**
 * Sessão do jogo de camisas
 */
export interface JerseyGameSession {
  id: string;
  userId?: string | null;
  gameMode: 'adaptive' | 'decade' | 'classic';
  finalScore: number;
  correctGuesses: number;
  totalAttempts: number;
  maxStreak: number;
  difficultyLevel?: string | null;
  startedAt: string;
  endedAt?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Entrada no ranking do Quiz das Camisas
 */
export interface JerseyRankingEntry {
  id: string;
  userId?: string | null;
  playerName: string;
  score: number;
  correctGuesses: number;
  totalAttempts: number;
  maxStreak: number;
  difficultyLevel?: string | null;
  gameMode?: string | null;
  gameDuration?: number | null;
  createdAt: string;
}

/**
 * Estatísticas de dificuldade para uma camisa
 */
export interface JerseyDifficultyStat {
  id: string;
  jerseyId: string;
  userId?: string | null;
  sessionId?: string | null;
  guessTime: number;
  yearDifference: number;
  isCorrect: boolean;
  deviceType?: string;
  createdAt: string;
}

/**
 * Histórico de tentativa na sessão atual
 */
export interface JerseyGuessHistoryEntry {
  jerseyId: string;
  jerseyYears: number[];
  matchedYear?: number;
  jerseyImageUrl: string;
  userGuess: number;
  isCorrect: boolean;
  yearDifference: number;
  pointsEarned: number;
  difficulty: DifficultyLevel;
  timeRemaining: number;
  options?: JerseyYearOption[];
  selectedOption?: number;
}
