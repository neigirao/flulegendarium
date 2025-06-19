
import { useState, useCallback, useMemo } from "react";
import { Player, DifficultyLevel, DifficultyLevelInfo } from "@/types/guess-game";

const DIFFICULTY_LEVELS: Record<DifficultyLevel, DifficultyLevelInfo> = {
  muito_facil: {
    level: 'muito_facil',
    label: 'Muito Fácil',
    color: 'text-green-600 bg-green-50',
    icon: '⭐',
    multiplier: 1
  },
  facil: {
    level: 'facil',
    label: 'Fácil',
    color: 'text-blue-600 bg-blue-50',
    icon: '⭐⭐',
    multiplier: 1.2
  },
  medio: {
    level: 'medio',
    label: 'Médio',
    color: 'text-yellow-600 bg-yellow-50',
    icon: '⭐⭐⭐',
    multiplier: 1.5
  },
  dificil: {
    level: 'dificil',
    label: 'Difícil',
    color: 'text-orange-600 bg-orange-50',
    icon: '⭐⭐⭐⭐',
    multiplier: 2
  },
  muito_dificil: {
    level: 'muito_dificil',
    label: 'Muito Difícil',
    color: 'text-red-600 bg-red-50',
    icon: '⭐⭐⭐⭐⭐',
    multiplier: 3
  }
};

export const useAdaptivePlayerSelection = (players: Player[] | undefined) => {
  const [currentDifficultyLevel, setCurrentDifficultyLevel] = useState<DifficultyLevel>('muito_facil');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(0);

  const currentDifficulty = DIFFICULTY_LEVELS[currentDifficultyLevel];

  // Filtrar jogadores por nível de dificuldade atual
  const availablePlayers = useMemo(() => {
    if (!players) return [];
    
    return players.filter(player => {
      const playerDifficulty = player.difficulty_level || 'medio';
      return playerDifficulty === currentDifficultyLevel;
    });
  }, [players, currentDifficultyLevel]);

  // Se não há jogadores no nível atual, usar todos como fallback
  const playersPool = availablePlayers.length > 0 ? availablePlayers : (players || []);

  const currentPlayer = playersPool.length > 0 ? playersPool[selectedPlayerIndex] : null;

  // Determinar threshold para próximo nível
  const getNextDifficultyThreshold = useCallback(() => {
    switch (currentDifficultyLevel) {
      case 'muito_facil': return 3;
      case 'facil': return 3;
      case 'medio': return 2;
      case 'dificil': return 2;
      case 'muito_dificil': return 999; // Não há próximo nível
      default: return 3;
    }
  }, [currentDifficultyLevel]);

  const selectRandomPlayer = useCallback(() => {
    if (playersPool.length === 0) return;
    
    const newIndex = Math.floor(Math.random() * playersPool.length);
    setSelectedPlayerIndex(newIndex);
    setCurrentRound(prev => prev + 1);
  }, [playersPool.length]);

  const handleCorrectGuess = useCallback(() => {
    const newStreak = currentStreak + 1;
    setCurrentStreak(newStreak);
    
    const threshold = getNextDifficultyThreshold();
    
    // Verificar se deve subir de nível
    if (newStreak >= threshold && currentDifficultyLevel !== 'muito_dificil') {
      const levels: DifficultyLevel[] = ['muito_facil', 'facil', 'medio', 'dificil', 'muito_dificil'];
      const currentIndex = levels.indexOf(currentDifficultyLevel);
      const nextLevel = levels[currentIndex + 1];
      
      if (nextLevel) {
        setCurrentDifficultyLevel(nextLevel);
        setCurrentStreak(0); // Reset streak no novo nível
      }
    }
  }, [currentStreak, currentDifficultyLevel, getNextDifficultyThreshold]);

  const handleIncorrectGuess = useCallback(() => {
    // Reset para nível anterior em caso de erro (exceto no primeiro nível)
    if (currentDifficultyLevel !== 'muito_facil') {
      const levels: DifficultyLevel[] = ['muito_facil', 'facil', 'medio', 'dificil', 'muito_dificil'];
      const currentIndex = levels.indexOf(currentDifficultyLevel);
      const prevLevel = levels[currentIndex - 1];
      
      if (prevLevel) {
        setCurrentDifficultyLevel(prevLevel);
      }
    }
    setCurrentStreak(0);
  }, [currentDifficultyLevel]);

  const resetDifficulty = useCallback(() => {
    setCurrentDifficultyLevel('muito_facil');
    setCurrentStreak(0);
    setCurrentRound(1);
    setSelectedPlayerIndex(0);
  }, []);

  const gameProgress = {
    currentRound,
    currentStreak,
    allowedDifficulties: [currentDifficultyLevel],
    nextDifficultyThreshold: getNextDifficultyThreshold()
  };

  return {
    currentPlayer,
    currentDifficulty,
    gameProgress,
    selectRandomPlayer,
    handleCorrectGuess,
    handleIncorrectGuess,
    resetDifficulty,
    availablePlayersCount: playersPool.length
  };
};
