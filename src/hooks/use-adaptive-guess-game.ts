
import { useState, useEffect, useCallback, useRef } from "react";
import { useAdaptivePlayerSelection } from "./use-adaptive-player-selection";
import { useSimpleGameTimer } from "./use-simple-game-timer";
import { useAdaptiveGameMetrics } from "./use-adaptive-game-metrics";
import { useToast } from "@/components/ui/use-toast";
import { useTabVisibility } from "./use-tab-visibility";
import { processPlayerName } from "@/utils/name-processor";
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
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(DIFFICULTY_LEVELS[2]); // Start with medium
  const [difficultyProgress, setDifficultyProgress] = useState(0);
  const [correctSequence, setCorrectSequence] = useState(0);
  const [incorrectSequence, setIncorrectSequence] = useState(0);

  const { toast } = useToast();
  const { isVisible: isTabVisible } = useTabVisibility();
  const lastGuessTimeRef = useRef<number>(0);

  // Hooks
  const { selectPlayerByDifficulty } = useAdaptivePlayerSelection();
  const { timeRemaining, startTimer, stopTimer, isRunning } = useSimpleGameTimer(30);

  const {
    startMetricsTracking,
    recordCorrectGuess,
    recordIncorrectGuess,
    saveGameData,
    saveToRanking,
    resetMetrics,
    getCurrentStats
  } = useAdaptiveGameMetrics();

  // Tab visibility handler
  useEffect(() => {
    if (!isTabVisible && isRunning && !gameOver) {
      console.log('🚫 Tab não está visível, terminando jogo');
      handleTimeUp();
    }
  }, [isTabVisible, isRunning, gameOver]);

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

      console.log(`🎯 Dificuldade alterada: ${oldDifficulty.label} → ${newDifficulty.label} (${changeReason})`);
      
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

    console.log(`🎯 Selecionando jogador com dificuldade: ${currentDifficulty.label}`);
    
    const selectedPlayer = selectPlayerByDifficulty(players, currentDifficulty.level as any);
    
    if (selectedPlayer) {
      setCurrentPlayer(selectedPlayer);
      setGameKey(prev => prev + 1);
      console.log(`✅ Jogador selecionado: ${selectedPlayer.name} (Dificuldade: ${currentDifficulty.label})`);
    } else {
      console.warn(`⚠️ Nenhum jogador encontrado para dificuldade: ${currentDifficulty.label}`);
      // Fallback to medium difficulty
      const fallbackPlayer = selectPlayerByDifficulty(players, 'medio');
      if (fallbackPlayer) {
        setCurrentPlayer(fallbackPlayer);
        setGameKey(prev => prev + 1);
      }
    }
  }, [players, currentDifficulty, selectPlayerByDifficulty]);

  const startGameForPlayer = useCallback(() => {
    if (!currentPlayer) return;
    
    console.log('🎮 Iniciando jogo adaptativo para:', currentPlayer.name);
    setAttempts(0);
    setGameOver(false);
    setHasLost(false);
    setIsProcessingGuess(false);
    startTimer();
    
    if (gamesPlayed === 0) {
      startMetricsTracking();
    }
  }, [currentPlayer, gamesPlayed, startTimer, startMetricsTracking]);

  const handleTimeUp = useCallback(() => {
    if (!currentPlayer || gameOver) return;

    console.log('⏰ Tempo esgotado no modo adaptativo');
    
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
  }, [currentPlayer, gameOver, score, currentDifficulty, stopTimer, recordIncorrectGuess, adjustDifficulty, saveGameData, toast]);

  const handleGuess = useCallback(async (guess: string) => {
    if (!currentPlayer || gameOver || isProcessingGuess) return;

    setIsProcessingGuess(true);
    const guessTime = Date.now() - lastGuessTimeRef.current;
    
    try {
      console.log(`🤔 Processando palpite adaptativo: "${guess}" para ${currentPlayer.name}`);
      
      const isCorrect = processPlayerName(guess, currentPlayer.name, currentPlayer.nicknames || []);
      
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
        
        console.log(`✅ Resposta correta! +${pointsEarned} pontos (Multiplicador: ${currentDifficulty.multiplier}x)`);
        
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
        console.log(`❌ Resposta incorreta. Era: ${currentPlayer.name}`);
        
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
      console.error('❌ Erro ao processar palpite adaptativo:', error);
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
    setCurrentDifficulty(DIFFICULTY_LEVELS[2]); // Reset to medium
    setDifficultyProgress(0);
    setCorrectSequence(0);
    setIncorrectSequence(0);
    setDifficultyChangeInfo(null);
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
