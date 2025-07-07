
import { useState, useCallback } from "react";

interface DifficultyLevel {
  level: string;
  label: string;
  multiplier: number;
  description: string;
  minPlayers: number;
}

const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { level: 'muito_facil', label: 'Muito Fácil', multiplier: 0.5, description: 'Jogadores muito conhecidos', minPlayers: 3 },
  { level: 'facil', label: 'Fácil', multiplier: 0.75, description: 'Jogadores conhecidos', minPlayers: 5 },
  { level: 'medio', label: 'Médio', multiplier: 1.0, description: 'Jogadores moderadamente conhecidos', minPlayers: 8 },
  { level: 'dificil', label: 'Difícil', multiplier: 1.5, description: 'Jogadores menos conhecidos', minPlayers: 5 },
  { level: 'muito_dificil', label: 'Muito Difícil', multiplier: 2.0, description: 'Jogadores históricos/obscuros', minPlayers: 3 }
];

export const useDecadeGameState = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  
  // Adaptive difficulty state - Start with "muito_facil"
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(DIFFICULTY_LEVELS[0]);
  const [difficultyProgress, setDifficultyProgress] = useState(0);
  const [correctSequence, setCorrectSequence] = useState(0);
  const [incorrectSequence, setIncorrectSequence] = useState(0);
  
  const MAX_ATTEMPTS = 1; // Only one attempt like adaptive game

  const adjustDifficulty = useCallback((wasCorrect: boolean) => {
    let newCorrectSequence = correctSequence;
    let newIncorrectSequence = incorrectSequence;
    
    if (wasCorrect) {
      newCorrectSequence = correctSequence + 1;
      newIncorrectSequence = 0;
    } else {
      newCorrectSequence = 0;
      newIncorrectSequence = incorrectSequence + 1;
    }

    setCorrectSequence(newCorrectSequence);
    setIncorrectSequence(newIncorrectSequence);

    const currentIndex = DIFFICULTY_LEVELS.findIndex(d => d.level === currentDifficulty.level);
    let newDifficultyIndex = currentIndex;

    // Increase difficulty after 3 consecutive correct answers
    if (newCorrectSequence >= 3 && currentIndex < DIFFICULTY_LEVELS.length - 1) {
      newDifficultyIndex = currentIndex + 1;
    }
    // Decrease difficulty after 2 consecutive wrong answers
    else if (newIncorrectSequence >= 2 && currentIndex > 0) {
      newDifficultyIndex = currentIndex - 1;
    }

    if (newDifficultyIndex !== currentIndex) {
      const newDifficulty = DIFFICULTY_LEVELS[newDifficultyIndex];
      setCurrentDifficulty(newDifficulty);
      setDifficultyProgress(0);
      
      console.log(`🎯 Dificuldade alterada: ${currentDifficulty.label} → ${newDifficulty.label}`);
      
      // Reset sequences after difficulty change
      setCorrectSequence(0);
      setIncorrectSequence(0);
    } else {
      // Update progress within current difficulty
      const progress = wasCorrect ? 
        Math.min(100, (newCorrectSequence / 3) * 100) : 
        Math.max(0, 100 - (newIncorrectSequence / 2) * 100);
      setDifficultyProgress(progress);
    }
  }, [currentDifficulty, correctSequence, incorrectSequence]);

  const addScore = useCallback((points: number) => {
    const adjustedPoints = Math.round(points * currentDifficulty.multiplier);
    setScore(prev => prev + adjustedPoints);
    setCurrentStreak(prev => {
      const newStreak = prev + 1;
      setMaxStreak(current => Math.max(current, newStreak));
      return newStreak;
    });
    adjustDifficulty(true);
  }, [currentDifficulty.multiplier, adjustDifficulty]);

  const endGame = useCallback(() => {
    setGameOver(true);
    setGamesPlayed(prev => prev + 1);
  }, []);

  const resetGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setAttempts(0);
    setCurrentStreak(0);
    setCurrentDifficulty(DIFFICULTY_LEVELS[0]); // Reset to muito_facil
    setDifficultyProgress(0);
    setCorrectSequence(0);
    setIncorrectSequence(0);
    // Don't reset maxStreak and gamesPlayed as they persist across games
  }, []);

  const incrementAttempts = useCallback(() => {
    setAttempts(prev => {
      const newAttempts = prev + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        endGame();
      }
      return newAttempts;
    });
  }, [endGame]);

  const resetStreak = useCallback(() => {
    setCurrentStreak(0);
    adjustDifficulty(false);
  }, [adjustDifficulty]);

  return {
    score,
    addScore,
    gameOver,
    endGame,
    resetGame,
    attempts,
    incrementAttempts,
    MAX_ATTEMPTS,
    currentStreak,
    maxStreak,
    resetStreak,
    gamesPlayed,
    // Adaptive difficulty
    currentDifficulty,
    difficultyProgress,
    adjustDifficulty,
    DIFFICULTY_LEVELS
  };
};
