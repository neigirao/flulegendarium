import { useState, useEffect, useCallback, useRef } from "react";
import { useJerseySelection } from "./use-jersey-selection";
import { useCleanTimer } from "./use-clean-timer";
import { useToast } from "@/components/ui/use-toast";
import { useTabVisibility } from "./use-tab-visibility";
import { logger } from "@/utils/logger";
import { DIFFICULTY_LEVELS, type DifficultyLevelConfig } from "@/config/difficulty-levels";
import { jerseyService } from "@/services/jerseyService";
import { clearJerseyImageCache } from "@/utils/jersey-image/preloadUtils";
import type { Jersey, JerseyGuessHistoryEntry, JerseyYearOption } from "@/types/jersey-game";

/**
 * Informações sobre mudança de dificuldade
 */
interface DifficultyChangeInfo {
  oldLevel: string;
  newLevel: string;
  reason: string;
  timestamp: number;
}

/**
 * Hook principal do Quiz das Camisas com múltipla escolha.
 * 
 * Gerencia todo o fluxo do jogo incluindo:
 * - Seleção de camisas baseada em dificuldade
 * - Geração de opções de ano (1 correta, 3 incorretas)
 * - Ajuste automático de dificuldade
 * - Controle de pontuação, streaks e timer
 * - Validação de seleção de opção
 * - Histórico de tentativas
 */
export const useJerseyGuessGame = (jerseys: Jersey[]) => {
  // Game state
  const [currentJersey, setCurrentJersey] = useState<Jersey | null>(null);
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
  const [guessHistory, setGuessHistory] = useState<JerseyGuessHistoryEntry[]>([]);

  // Multiple choice state
  const [currentOptions, setCurrentOptions] = useState<JerseyYearOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Adaptive difficulty state
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevelConfig>(DIFFICULTY_LEVELS[0]);
  const [difficultyProgress, setDifficultyProgress] = useState(0);
  const [correctSequence, setCorrectSequence] = useState(0);
  const [incorrectSequence, setIncorrectSequence] = useState(0);

  const { toast } = useToast();
  const { isVisible: isTabVisible } = useTabVisibility();
  const lastGuessTimeRef = useRef<number>(0);
  const usedJerseyIds = useRef<Set<string>>(new Set());

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (!currentJersey || gameOver) return;

    logger.timer('Time up - jersey quiz mode');
    
    setGameOver(true);
    setHasLost(true);
    setShowResult(true);
    stopTimer();
    
    // Record stat
    const guessTime = Date.now() - lastGuessTimeRef.current;
    jerseyService.recordDifficultyStat(
      currentJersey.id,
      guessTime,
      99,
      false
    );

    adjustDifficulty(false);

    const yearsDisplay = currentJersey.years.join(' ou ');
    toast({
      variant: "destructive",
      title: "Tempo Esgotado!",
      description: `Era ${yearsDisplay}. Sua pontuação final: ${score}`,
    });
  }, [currentJersey, gameOver, score]);

  // Hooks
  const { selectJerseyByDifficulty, selectRandomJersey } = useJerseySelection();
  const { timeRemaining, startTimer, stopTimer, isRunning } = useCleanTimer(gameOver, handleTimeUp);

  // Tab visibility handler
  useEffect(() => {
    if (!isTabVisible && isRunning && !gameOver) {
      logger.warn('Tab not visible, ending jersey game', 'TAB_VISIBILITY');
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

    // Increase after 3 consecutive correct
    if (newCorrectSequence >= 3 && currentIndex < DIFFICULTY_LEVELS.length - 1) {
      newDifficultyIndex = currentIndex + 1;
      changeReason = `${newCorrectSequence} acertos consecutivos`;
    }
    // Decrease after 2 consecutive wrong
    else if (newIncorrectSequence >= 2 && currentIndex > 0) {
      newDifficultyIndex = currentIndex - 1;
      changeReason = `${newIncorrectSequence} erros consecutivos`;
    }

    if (newDifficultyIndex !== currentIndex) {
      const oldDifficulty = currentDifficulty;
      const newDifficulty = DIFFICULTY_LEVELS[newDifficultyIndex];
      
      setCurrentDifficulty(newDifficulty);
      setDifficultyProgress(0);
      
      setDifficultyChangeInfo({
        oldLevel: oldDifficulty.label,
        newLevel: newDifficulty.label,
        reason: changeReason,
        timestamp: Date.now()
      });

      logger.debug(`Difficulty changed: ${oldDifficulty.label} → ${newDifficulty.label}`, 'JERSEY_DIFFICULTY');
      
      setCorrectSequence(0);
      setIncorrectSequence(0);
    } else {
      const progress = wasCorrect ? 
        Math.min(100, (newCorrectSequence / 3) * 100) : 
        Math.max(0, 100 - (newIncorrectSequence / 2) * 100);
      setDifficultyProgress(progress);
    }
  }, [currentDifficulty, correctSequence, incorrectSequence]);

  const selectNextJersey = useCallback(() => {
    if (!jerseys || jerseys.length === 0) return;

    if (usedJerseyIds.current.size >= jerseys.length) {
      logger.warn('All jerseys used - no more available', 'JERSEY_SELECTION');
      return;
    }

    logger.info(
      `🎯 Selecionando camisa com dificuldade: ${currentDifficulty.label}`,
      'JERSEY_GAME',
      {
        currentDifficultyLevel: currentDifficulty.level,
        usedJerseys: usedJerseyIds.current.size,
        totalJerseys: jerseys.length
      }
    );
    
    // Try difficulty-based selection first
    let selectedJersey = selectJerseyByDifficulty(
      jerseys, 
      currentDifficulty.level as any,
      usedJerseyIds.current
    );
    
    // Fallback to random if no jersey at difficulty
    if (!selectedJersey) {
      selectedJersey = selectRandomJersey(jerseys, usedJerseyIds.current);
    }
    
    if (selectedJersey) {
      usedJerseyIds.current.add(selectedJersey.id);
      setCurrentJersey(selectedJersey);
      setGameKey(prev => prev + 1);
      
      // Generate options for multiple choice
      const options = jerseyService.generateOptions(
        selectedJersey.years,
        currentDifficulty.level as any
      );
      setCurrentOptions(options);
      setSelectedOption(null);
      setShowResult(false);
      
      logger.info(
        `✅ Camisa selecionada: ${selectedJersey.years.join(', ')}`,
        'JERSEY_GAME',
        { 
          jerseyYears: selectedJersey.years,
          jerseyDifficulty: selectedJersey.difficulty_level,
          gameDifficulty: currentDifficulty.label,
          options: options.map(o => o.year)
        }
      );
    }
  }, [jerseys, currentDifficulty, selectJerseyByDifficulty, selectRandomJersey]);

  const startGameForJersey = useCallback(() => {
    if (!currentJersey) return;
    
    logger.gameAction('Starting jersey quiz game', currentJersey.years.join(', '));
    setAttempts(0);
    setGameOver(false);
    setHasLost(false);
    setIsProcessingGuess(false);
    setSelectedOption(null);
    setShowResult(false);
    lastGuessTimeRef.current = Date.now();
    startTimer();
  }, [currentJersey, startTimer]);

  /**
   * Handler para seleção de opção (múltipla escolha)
   */
  const handleOptionSelect = useCallback(async (selectedYear: number) => {
    if (!currentJersey || gameOver || isProcessingGuess || showResult) return;

    setIsProcessingGuess(true);
    setSelectedOption(selectedYear);
    setShowResult(true);
    
    const guessTime = Date.now() - lastGuessTimeRef.current;
    
    try {
      logger.debug(`Processing jersey option: ${selectedYear}`, 'JERSEY_GUESS', { 
        correctYears: currentJersey.years 
      });
      
      const isCorrect = jerseyService.checkOptionSelection(selectedYear, currentJersey.years);
      const yearDifference = isCorrect ? 0 : Math.min(
        ...currentJersey.years.map(y => Math.abs(selectedYear - y))
      );
      
      // Calculate points
      const { points: pointsEarned, bonus } = jerseyService.calculatePoints(
        isCorrect,
        currentDifficulty.multiplier,
        timeRemaining,
        30 // default timer
      );
      
      // Record difficulty stat
      await jerseyService.recordDifficultyStat(
        currentJersey.id,
        guessTime,
        yearDifference,
        isCorrect
      );

      // Add to history
      const historyEntry: JerseyGuessHistoryEntry = {
        jerseyId: currentJersey.id,
        jerseyYears: currentJersey.years,
        matchedYear: isCorrect ? selectedYear : undefined,
        jerseyImageUrl: currentJersey.image_url,
        userGuess: selectedYear,
        isCorrect,
        yearDifference,
        pointsEarned: pointsEarned + bonus,
        difficulty: currentDifficulty.level as any,
        timeRemaining,
        options: currentOptions,
        selectedOption: selectedYear
      };
      setGuessHistory(prev => [...prev, historyEntry]);
      
      const yearsDisplay = currentJersey.years.join(' ou ');
      
      if (isCorrect) {
        const totalPoints = pointsEarned + bonus;
        const newScore = score + totalPoints;
        const newStreak = currentStreak + 1;
        
        setScore(newScore);
        setCurrentStreak(newStreak);
        setMaxStreak(prev => Math.max(prev, newStreak));
        setAttempts(prev => prev + 1);
        setGamesPlayed(prev => prev + 1);
        
        adjustDifficulty(true);
        
        logger.debug(`Correct! +${totalPoints} points`, 'JERSEY_GUESS');
        
        toast({
          title: "Correto! 🎉",
          description: `+${totalPoints} pontos!`,
        });
        
        stopTimer();
        
        // Continue to next jersey after showing result
        setTimeout(() => {
          selectNextJersey();
          setTimeout(() => {
            lastGuessTimeRef.current = Date.now();
            startTimer();
          }, 100);
          setIsProcessingGuess(false);
        }, 1500);
        
      } else {
        // Game over on any wrong answer
        setGameOver(true);
        setHasLost(true);
        setCurrentStreak(0);
        stopTimer();
        
        adjustDifficulty(false);
        
        toast({
          variant: "destructive",
          title: "Incorreto!",
          description: `Era ${yearsDisplay}. Pontuação final: ${score}`,
        });

        setIsProcessingGuess(false);
      }
    } catch (error) {
      logger.error('Error processing jersey option', 'JERSEY_GUESS', error);
      setIsProcessingGuess(false);
    }
  }, [
    currentJersey, 
    gameOver, 
    isProcessingGuess,
    showResult,
    score, 
    currentStreak, 
    currentDifficulty,
    currentOptions,
    timeRemaining,
    adjustDifficulty,
    stopTimer,
    selectNextJersey,
    startTimer,
    toast
  ]);

  /**
   * @deprecated Use handleOptionSelect for multiple choice
   */
  const handleGuess = useCallback(async (guessYear: number) => {
    return handleOptionSelect(guessYear);
  }, [handleOptionSelect]);

  const handleJerseyImageLoaded = useCallback(() => {
    lastGuessTimeRef.current = Date.now();
  }, []);

  const resetGame = useCallback(() => {
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
    setCurrentJersey(null);
    setGuessHistory([]);
    setCurrentOptions([]);
    setSelectedOption(null);
    setShowResult(false);
    
    // Clear image cache on reset
    clearJerseyImageCache();
    
    usedJerseyIds.current.clear();
    setGameKey(Date.now());
    
    setTimeout(() => {
      selectNextJersey();
    }, 100);
  }, [selectNextJersey]);

  const saveToRanking = useCallback(async (playerName: string) => {
    return jerseyService.saveRanking({
      playerName,
      score,
      correctGuesses: gamesPlayed,
      totalAttempts: attempts,
      maxStreak,
      difficultyLevel: currentDifficulty.level,
      gameMode: 'adaptive'
    });
  }, [score, gamesPlayed, attempts, maxStreak, currentDifficulty]);

  const clearDifficultyChange = useCallback(() => {
    setDifficultyChangeInfo(null);
  }, []);

  // Initialize game
  useEffect(() => {
    if (jerseys && jerseys.length > 0 && !currentJersey) {
      selectNextJersey();
    }
  }, [jerseys, currentJersey, selectNextJersey]);

  return {
    // Game state
    currentJersey,
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
    guessHistory,
    
    // Multiple choice state
    currentOptions,
    selectedOption,
    showResult,
    
    // Adaptive difficulty
    currentDifficulty,
    difficultyProgress,
    difficultyChangeInfo,
    
    // Actions
    handleGuess, // deprecated, kept for compatibility
    handleOptionSelect, // new handler for multiple choice
    selectNextJersey,
    handleJerseyImageLoaded,
    startGameForJersey,
    resetGame,
    clearDifficultyChange,
    saveToRanking
  };
};
