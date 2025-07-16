import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface GameStats {
  totalGames: number;
  totalAttempts: number;
  totalPlayers: number;
  averageAccuracy: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
}

interface GameSession {
  isActive: boolean;
  currentPlayer?: any;
  score: number;
  attempts: number;
  correctGuesses: number;
  startTime?: number;
  difficulty: string;
  mode: string;
}

interface GameStore {
  // Game State
  session: GameSession;
  stats: GameStats;
  
  // Loading States
  isLoading: boolean;
  
  // Actions
  startGame: (mode: string, difficulty?: string) => void;
  endGame: () => void;
  updateScore: (points: number) => void;
  recordAttempt: (isCorrect: boolean) => void;
  updateStats: (newStats: Partial<GameStats>) => void;
  setLoading: (loading: boolean) => void;
  resetSession: () => void;
}

const initialSession: GameSession = {
  isActive: false,
  score: 0,
  attempts: 0,
  correctGuesses: 0,
  difficulty: 'medium',
  mode: 'adaptive'
};

const initialStats: GameStats = {
  totalGames: 0,
  totalAttempts: 0,
  totalPlayers: 0,
  averageAccuracy: 0,
  bestScore: 0,
  currentStreak: 0,
  longestStreak: 0
};

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        session: initialSession,
        stats: initialStats,
        isLoading: false,

        startGame: (mode: string, difficulty = 'medium') => {
          set((state) => ({
            session: {
              ...initialSession,
              isActive: true,
              startTime: Date.now(),
              mode,
              difficulty
            }
          }), false, 'startGame');
        },

        endGame: () => {
          const { session, stats } = get();
          const accuracy = session.attempts > 0 ? (session.correctGuesses / session.attempts) * 100 : 0;
          
          set((state) => ({
            session: {
              ...state.session,
              isActive: false
            },
            stats: {
              ...state.stats,
              totalGames: state.stats.totalGames + 1,
              totalAttempts: state.stats.totalAttempts + session.attempts,
              averageAccuracy: ((state.stats.averageAccuracy * state.stats.totalGames) + accuracy) / (state.stats.totalGames + 1),
              bestScore: Math.max(state.stats.bestScore, session.score),
              currentStreak: session.correctGuesses === session.attempts ? state.stats.currentStreak + 1 : 0,
              longestStreak: Math.max(state.stats.longestStreak, state.stats.currentStreak)
            }
          }), false, 'endGame');
        },

        updateScore: (points: number) => {
          set((state) => ({
            session: {
              ...state.session,
              score: state.session.score + points
            }
          }), false, 'updateScore');
        },

        recordAttempt: (isCorrect: boolean) => {
          set((state) => ({
            session: {
              ...state.session,
              attempts: state.session.attempts + 1,
              correctGuesses: state.session.correctGuesses + (isCorrect ? 1 : 0)
            }
          }), false, 'recordAttempt');
        },

        updateStats: (newStats: Partial<GameStats>) => {
          set((state) => ({
            stats: { ...state.stats, ...newStats }
          }), false, 'updateStats');
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading }, false, 'setLoading');
        },

        resetSession: () => {
          set({ session: initialSession }, false, 'resetSession');
        }
      }),
      {
        name: 'game-store',
        partialize: (state) => ({ 
          stats: state.stats,
          session: { ...state.session, isActive: false } // Don't persist active sessions
        })
      }
    ),
    { name: 'GameStore' }
  )
);