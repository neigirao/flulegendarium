
import { useState, useEffect, useCallback, useRef } from "react";
import { useAdaptivePlayerSelection } from "./use-adaptive-player-selection";
import { useCleanTimer } from "./use-clean-timer";
import { useAdaptiveGameMetrics } from "./use-adaptive-game-metrics";
import { useToast } from "@/components/ui/use-toast";
import { useTabVisibility } from "./use-tab-visibility";
import { processPlayerName } from "@/utils/name-processor";
import { logger } from "@/utils/logger";
import type { Player } from "@/types/guess-game";

interface DifficultyLevel {
  level: string;
  label: string;
  multiplier: number;
  description: string;
  minPlayers: number;
}

interface DifficultyChangeInfo {
  oldLevel: string;
  newLevel: string;
  reason: string;
  timestamp: number;
}

const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { level: 'muito_facil', label: 'Muito Fácil', multiplier: 0.5, description: 'Jogadores muito conhecidos', minPlayers: 3 },
  { level: 'facil', label: 'Fácil', multiplier: 0.75, description: 'Jogadores conhecidos', minPlayers: 5 },
  { level: 'medio', label: 'Médio', multiplier: 1.0, description: 'Jogadores moderadamente conhecidos', minPlayers: 8 },
  { level: 'dificil', label: 'Difícil', multiplier: 1.5, description: 'Jogadores menos conhecidos', minPlayers: 5 },
  { level: 'muito_dificil', label: 'Muito Difícil', multiplier: 2.0, description: 'Jogadores históricos/obscuros', minPlayers: 3 }
];

export const useAdaptiveGuessGame = (players: Player[]) => {
  // Game state
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isProcessingGuess, setIsProcessingGuess] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [difficultyChangeInfo, setDifficultyChangeInfo] = useState<DifficultyChangeInfo | null>(null);

  // Adaptive difficulty state
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(DIFFICULTY_LEVELS[0]);
  const [difficultyProgress, setDifficultyProgress] = useState(0);
  const [correctSequence, setCorrectSequence] = useState(0);
  const [incorrectSequence, setIncorrectSequence] = useState(0);

  const { toast } = useToast();
  const { isVisible: isTabVisible } = useTabVisibility();
  const lastGuessTimeRef = useRef<number>(0);
  
  // Rastrear jogadores já usados nesta partida
  const usedPlayerIds = useRef<Set<string>>(new Set());

  // Define handleTimeUp before using it
  const handleTimeUp = useCallback(() => {
    if (!currentPlayer || gameOver) return;

    logger.timer('Time up - adaptive mode');
    
    setGameOver(true);
    setHasLost(true);
    stopTimer();
    
    const guessTime = Date.now() - lastGuessTimeRef.current;
    recordIncorrectGuess(currentPlayer.id, currentPlayer.name, currentDifficulty.level, guessTime);
    adjustDifficulty(false);

    toast({
      variant: "destructive",
      title: "Tempo Esgotado!",
      description: `Era ${currentPlayer.name}. Sua pontuação final: ${score}`,
    });

    // Save game data
    saveGameData(score, currentDifficulty.level, currentDifficulty.multiplier);
  }, [currentPlayer, gameOver, score, currentDifficulty]);

  // Hooks
  const { selectPlayerByDifficulty } = useAdaptivePlayerSelection();

  const {
    startMetricsTracking,
    recordCorrectGuess,
    recordIncorrectGuess,
    saveGameData,
    saveToRanking,
    resetMetrics,
    getCurrentStats
  } = useAdaptiveGameMetrics();

  const { timeRemaining, startTimer, stopTimer, isRunning } = useCleanTimer(gameOver, handleTimeUp);

  // Tab visibility handler
  useEffect(() => {
    if (!isTabVisible && isRunning && !gameOver) {
      logger.warn('Tab not visible, ending game', 'TAB_VISIBILITY');
      handleTimeUp();
    }
  }, [isTabVisible, isRunning, gameOver, handleTimeUp]);

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
    let changeReason = '';

    // Increase difficulty after 3 consecutive correct answers
    if (newCorrectSequence >= 3 && currentIndex < DIFFICULTY_LEVELS.length - 1) {
      newDifficultyIndex = currentIndex + 1;
      changeReason = `${newCorrectSequence} acertos consecutivos`;
    }
    // Decrease difficulty after 2 consecutive wrong answers
    else if (newIncorrectSequence >= 2 && currentIndex > 0) {
      newDifficultyIndex = currentIndex - 1;
      changeReason = `${newIncorrectSequence} erros consecutivos`;
    }

    if (newDifficultyIndex !== currentIndex) {
      const oldDifficulty = currentDifficulty;
      const newDifficulty = DIFFICULTY_LEVELS[newDifficultyIndex];
      
      setCurrentDifficulty(newDifficulty);
      setDifficultyProgress(0);
      
      // Show difficulty change notification
      setDifficultyChangeInfo({
        oldLevel: oldDifficulty.label,
        newLevel: newDifficulty.label,
        reason: changeReason,
        timestamp: Date.now()
      });

      logger.debug(`Difficulty changed: ${oldDifficulty.label} → ${newDifficulty.label} (${changeReason})`, 'DIFFICULTY');
      
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

  const selectRandomPlayer = useCallback(() => {
    if (!players || players.length === 0) return;

    // Verificar se todos os jogadores já foram usados
    if (usedPlayerIds.current.size >= players.length) {
      logger.warn('All players used in this game - no more players available', 'PLAYER_SELECTION');
      return;
    }

    logger.debug(`Selecting player with difficulty: ${currentDifficulty.label}`, 'PLAYER_SELECTION');
    
    const selectedPlayer = selectPlayerByDifficulty(
      players, 
      currentDifficulty.level as any,
      usedPlayerIds.current
    );
    
    if (selectedPlayer) {
      // Adicionar ao set de jogadores usados
      usedPlayerIds.current.add(selectedPlayer.id);
      setCurrentPlayer(selectedPlayer);
      setGameKey(prev => prev + 1);
      logger.debug(`Player selected: ${selectedPlayer.name}`, 'PLAYER_SELECTION', { 
        difficulty: currentDifficulty.label,
        usedCount: usedPlayerIds.current.size,
        totalPlayers: players.length
      });
    } else {
      logger.warn('No available player found', 'PLAYER_SELECTION');
    }
  }, [players, currentDifficulty, selectPlayerByDifficulty]);

  const startGameForPlayer = useCallback(() => {
    if (!currentPlayer) return;
    
    logger.gameAction('Starting adaptive game', currentPlayer.name);
    setAttempts(0);
    setGameOver(false);
    setHasLost(false);
    setIsProcessingGuess(false);
    startTimer();
    
    if (gamesPlayed === 0) {
      startMetricsTracking();
    }
  }, [currentPlayer, gamesPlayed, startTimer, startMetricsTracking]);

  const handleGuess = useCallback(async (guess: string) => {
    if (!currentPlayer || gameOver || isProcessingGuess) return;

    setIsProcessingGuess(true);
    const guessTime = Date.now() - lastGuessTimeRef.current;
    
    try {
      logger.debug(`Processing guess: "${guess}"`, 'GUESS', { playerName: currentPlayer.name });
      
      const result = await processPlayerName(guess, currentPlayer.name, currentPlayer.id);
      const isCorrect = result.processedName !== null && result.confidence > 0.7;
      
      if (isCorrect) {
        const pointsEarned = Math.round(5 * currentDifficulty.multiplier);
        const newScore = score + pointsEarned;
        const newStreak = currentStreak + 1;
        
        setScore(newScore);
        setCurrentStreak(newStreak);
        setMaxStreak(prev => Math.max(prev, newStreak));
        setAttempts(1);
        setGamesPlayed(prev => prev + 1);
        
        recordCorrectGuess(currentPlayer.id, currentPlayer.name, currentDifficulty.level, guessTime);
        adjustDifficulty(true);
        
        logger.debug(`Correct answer! +${pointsEarned} points`, 'GUESS', { 
          multiplier: currentDifficulty.multiplier,
          playerName: currentPlayer.name 
        });
        
        toast({
          title: "Correto!",
          description: `+${pointsEarned} pontos! (${currentDifficulty.label})`,
        });
        
        // Continue to next player
        setTimeout(() => {
          selectRandomPlayer();
          setIsProcessingGuess(false);
        }, 1500);
        
      } else {
        logger.debug(`Incorrect answer`, 'GUESS', { correctAnswer: currentPlayer.name });
        
        setGameOver(true);
        setHasLost(true);
        setCurrentStreak(0);
        stopTimer();
        
        recordIncorrectGuess(currentPlayer.id, currentPlayer.name, currentDifficulty.level, guessTime);
        adjustDifficulty(false);
        
        toast({
          variant: "destructive",
          title: "Incorreto!",
          description: `Era ${currentPlayer.name}. Sua pontuação final: ${score}`,
        });

        // Save game data
        saveGameData(score, currentDifficulty.level, currentDifficulty.multiplier);
        setIsProcessingGuess(false);
      }
    } catch (error) {
      logger.error('Error processing adaptive guess', 'GUESS', error);
      setIsProcessingGuess(false);
    }
  }, [
    currentPlayer, 
    gameOver, 
    isProcessingGuess, 
    score, 
    currentStreak, 
    currentDifficulty,
    recordCorrectGuess,
    recordIncorrectGuess,
    adjustDifficulty,
    saveGameData,
    stopTimer,
    selectRandomPlayer,
    toast
  ]);

  const handlePlayerImageFixed = useCallback(() => {
    if (currentPlayer && !gameOver) {
      lastGuessTimeRef.current = Date.now();
      startTimer();
    }
  }, [currentPlayer, gameOver, startTimer]);

  const forceRefresh = useCallback(() => {
    selectRandomPlayer();
  }, [selectRandomPlayer]);

  const resetScore = useCallback(() => {
    setScore(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setGamesPlayed(0);
    setGameOver(false);
    setHasLost(false);
    setAttempts(0);
    setCurrentDifficulty(DIFFICULTY_LEVELS[0]);
    setDifficultyProgress(0);
    setCorrectSequence(0);
    setIncorrectSequence(0);
    setDifficultyChangeInfo(null);
    
    // Limpar histórico de jogadores usados ao resetar o jogo
    usedPlayerIds.current.clear();
    
    resetMetrics();
    selectRandomPlayer();
  }, [selectRandomPlayer, resetMetrics]);

  const clearDifficultyChange = useCallback(() => {
    setDifficultyChangeInfo(null);
  }, []);

  // Initialize game
  useEffect(() => {
    if (players && players.length > 0 && !currentPlayer) {
      selectRandomPlayer();
    }
  }, [players, currentPlayer, selectRandomPlayer]);

  return {
    // Game state
    currentPlayer,
    gameKey,
    attempts,
    score,
    gameOver,
    timeRemaining,
    isProcessingGuess,
    hasLost,
    isTimerRunning: isRunning,
    gamesPlayed,
    currentStreak,
    maxStreak,
    
    // Adaptive difficulty
    currentDifficulty,
    difficultyProgress,
    difficultyChangeInfo,
    
    // Actions
    handleGuess,
    selectRandomPlayer,
    forceRefresh,
    handlePlayerImageFixed,
    startGameForPlayer,
    resetScore,
    clearDifficultyChange,
    saveToRanking
  };
};
