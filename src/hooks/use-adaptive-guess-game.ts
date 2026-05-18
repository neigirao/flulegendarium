
import { useState, useEffect, useCallback, useRef } from "react";
import { useAdaptivePlayerSelection } from "./use-adaptive-player-selection";
import { usePlayerSessionHistory } from "./use-player-session-history";
import { useCleanTimer } from "./use-clean-timer";
import { useAdaptiveGameMetrics } from "./use-adaptive-game-metrics";
import { useToast } from "@/components/ui/use-toast";
import { useTabVisibility } from "./use-tab-visibility";
import { processPlayerName } from "@/utils/name-processor";
import { logger } from "@/utils/logger";
import { DIFFICULTY_LEVELS, type DifficultyLevelConfig } from "@/config/difficulty-levels";
import type { Player } from "@/types/guess-game";
import type { AdaptiveGame, DifficultyChangeInfo } from "@/types/adaptive-game";


/**
 * Hook principal do jogo com progressão fixa de dificuldade.
 *
 * Progressão linear igual para todos os jogadores:
 * - Acertos 0-2:  Fácil
 * - Acertos 3-5:  Médio
 * - Acertos 6-8:  Difícil
 * - Acertos 9+:   Muito Difícil
 *
 * A dificuldade nunca retroage — apenas avança conforme acertos acumulados.
 *
 * @param {Player[]} players - Lista completa de jogadores disponíveis
 */
export const useAdaptiveGuessGame = (players: Player[]): AdaptiveGame => {
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

  // Fixed progression difficulty state (based on total correct answers)
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevelConfig>(DIFFICULTY_LEVELS[0]); // starts at muito_facil
  const [difficultyProgress, setDifficultyProgress] = useState(0);

  const { toast } = useToast();
  const { isVisible: isTabVisible } = useTabVisibility();
  const lastGuessTimeRef = useRef<number>(0);
  
  // Rastrear jogadores já usados nesta partida
  const usedPlayerIds = useRef<Set<string>>(new Set());

  // Refs to hold latest values for handleTimeUp without causing re-renders
  const scoreRef = useRef(score);
  const currentDifficultyRef = useRef(currentDifficulty);
  const currentPlayerRef = useRef(currentPlayer);
  const gameOverRef = useRef(gameOver);
  scoreRef.current = score;
  currentDifficultyRef.current = currentDifficulty;
  currentPlayerRef.current = currentPlayer;
  gameOverRef.current = gameOver;

  // Handle time up - uses refs to avoid exhaustive-deps issues
  const handleTimeUp = useCallback(() => {
    const player = currentPlayerRef.current;
    if (!player || gameOverRef.current) return;

    logger.timer('Time up - adaptive mode');
    
    setGameOver(true);
    setHasLost(true);

    toast({
      variant: "destructive",
      title: "Tempo Esgotado!",
      description: `Era ${player.name}. Sua pontuação final: ${scoreRef.current}`,
    });
  }, [toast]);

  // Hooks
  const { selectPlayerByDifficulty } = useAdaptivePlayerSelection();
  const { getRecentIds, recordPlayer, clearHistory } = usePlayerSessionHistory();

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

  // Returns the difficulty config for a given number of total correct answers.
  // Thresholds = floor(pool_size / 10), proportional to each level's pool:
  // 0-7   → muito_facil (8 rounds, pool=84)
  // 8-16  → facil       (9 rounds, pool=96)
  // 17    → medio       (1 round,  pool=5)
  // 18-19 → dificil     (2 rounds, pool=23)
  // 20+   → muito_dificil (pool=11)
  const getDifficultyForRound = useCallback((round: number): DifficultyLevelConfig => {
    if (round < 8)  return DIFFICULTY_LEVELS[0]; // muito_facil
    if (round < 17) return DIFFICULTY_LEVELS[1]; // facil
    if (round < 18) return DIFFICULTY_LEVELS[2]; // medio
    if (round < 20) return DIFFICULTY_LEVELS[3]; // dificil
    return DIFFICULTY_LEVELS[4];                 // muito_dificil
  }, []);

  const advanceDifficulty = useCallback((newGamesPlayed: number) => {
    const newDifficulty = getDifficultyForRound(newGamesPlayed);
    const tierStart = newGamesPlayed < 8 ? 0 : newGamesPlayed < 17 ? 8 : newGamesPlayed < 18 ? 17 : newGamesPlayed < 20 ? 18 : 20;
    const tierSize  = newGamesPlayed < 8 ? 8 : newGamesPlayed < 17 ? 9 : newGamesPlayed < 18 ? 1  : newGamesPlayed < 20 ? 2  : 1;
    const progress  = newGamesPlayed >= 20 ? 100 : Math.min(100, ((newGamesPlayed - tierStart) / tierSize) * 100);

    if (newDifficulty.level !== currentDifficulty.level) {
      setDifficultyChangeInfo({
        oldLevel: currentDifficulty.label,
        newLevel: newDifficulty.label,
        reason: `${newGamesPlayed} acertos`,
        timestamp: Date.now()
      });
      logger.debug(`Difficulty advanced: ${currentDifficulty.label} → ${newDifficulty.label}`, 'DIFFICULTY');
    }

    setCurrentDifficulty(newDifficulty);
    setDifficultyProgress(progress);
  }, [currentDifficulty, getDifficultyForRound]);

  const selectRandomPlayer = useCallback(() => {
    if (!players || players.length === 0) return;

    // Verificar se todos os jogadores já foram usados
    if (usedPlayerIds.current.size >= players.length) {
      logger.warn('All players used in this game - no more players available', 'PLAYER_SELECTION');
      return;
    }

    logger.info(
      `🎯 Selecionando jogador com dificuldade: ${currentDifficulty.label} (${currentDifficulty.level})`,
      'ADAPTIVE_GAME',
      {
        currentDifficultyLevel: currentDifficulty.level,
        multiplier: currentDifficulty.multiplier,
        usedPlayers: usedPlayerIds.current.size,
        totalPlayers: players.length
      }
    );
    
    // Estratégia de seleção em duas etapas:
    // 1ª tentativa: exclui jogadores usados NESTA sessão + histórico cross-sessão (evita repetição entre partidas)
    // 2ª tentativa (fallback): exclui apenas jogadores usados nesta sessão (comportamento original)
    const recentIds = getRecentIds();
    const usedPlusRecent = new Set([...usedPlayerIds.current, ...recentIds]);

    const selectedPlayer =
      selectPlayerByDifficulty(players, currentDifficulty.level as Player['difficulty_level'], usedPlusRecent) ??
      selectPlayerByDifficulty(players, currentDifficulty.level as Player['difficulty_level'], usedPlayerIds.current);

    if (selectedPlayer) {
      // Adicionar ao set de jogadores usados nesta sessão e ao histórico persistido
      usedPlayerIds.current.add(selectedPlayer.id);
      recordPlayer(selectedPlayer.id);
      setCurrentPlayer(selectedPlayer);
      setGameKey(prev => prev + 1);
      
      logger.info(
        `✅ Jogador selecionado: ${selectedPlayer.name}`,
        'ADAPTIVE_GAME',
        { 
          playerName: selectedPlayer.name,
          playerDifficulty: selectedPlayer.difficulty_level,
          playerDifficultyScore: selectedPlayer.difficulty_score,
          gameDifficulty: currentDifficulty.label,
          usedCount: usedPlayerIds.current.size,
          totalPlayers: players.length
        }
      );
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
        
        const newGamesPlayed = gamesPlayed + 1;
        setScore(newScore);
        setCurrentStreak(newStreak);
        setMaxStreak(prev => Math.max(prev, newStreak));
        setAttempts(1);
        setGamesPlayed(newGamesPlayed);

        recordCorrectGuess(currentPlayer.id, currentPlayer.name, currentDifficulty.level, guessTime);
        advanceDifficulty(newGamesPlayed);

        logger.debug(`Correct answer! +${pointsEarned} points`, 'GUESS', {
          multiplier: currentDifficulty.multiplier,
          playerName: currentPlayer.name
        });

        toast({
          title: "Correto!",
          description: `+${pointsEarned} pontos! (${currentDifficulty.label})`,
        });

        stopTimer();

        // Continue to next player and restart timer
        setTimeout(() => {
          selectRandomPlayer();
          setTimeout(() => {
            startTimer();
          }, 100);
          setIsProcessingGuess(false);
        }, 1500);

      } else {
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
    gamesPlayed,
    currentDifficulty,
    recordCorrectGuess,
    recordIncorrectGuess,
    advanceDifficulty,
    saveGameData,
    stopTimer,
    startTimer,
    selectRandomPlayer,
    toast
  ]);

  const handlePlayerImageFixed = useCallback(() => {
    // Apenas resetar timestamp - não iniciar timer aqui
    // O container controlará quando iniciar através de startGameForPlayer
    lastGuessTimeRef.current = Date.now();
  }, []);

  const forceRefresh = useCallback(() => {
    selectRandomPlayer();
  }, [selectRandomPlayer]);

  // Trata pulos explícitos: quebra o streak e ajusta dificuldade como um erro,
  // depois avança para o próximo jogador sem encerrar o jogo.
  const handleSkipPlayer = useCallback(() => {
    if (gameOver || isProcessingGuess) return;
    setCurrentStreak(0);
    selectRandomPlayer();
  }, [gameOver, isProcessingGuess, selectRandomPlayer]);

  const resetScore = useCallback(() => {
    setScore(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setGamesPlayed(0);
    setGameOver(false);
    setHasLost(false);
    setAttempts(0);
    setCurrentDifficulty(DIFFICULTY_LEVELS[0]); // starts at muito_facil
    setDifficultyProgress(0);
    setCorrectSequence(0);
    setIncorrectSequence(0);
    setDifficultyChangeInfo(null);
    setCurrentPlayer(null);
    
    // Limpar histórico da sessão e cross-sessão ao resetar o jogo
    usedPlayerIds.current.clear();
    clearHistory();
    
    // Forçar nova chave para re-render completo
    setGameKey(Date.now());
    
    resetMetrics();
    
    // Selecionar novo jogador após um pequeno delay para garantir reset completo
    setTimeout(() => {
      selectRandomPlayer();
    }, 100);
  }, [selectRandomPlayer, resetMetrics, clearHistory]);

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
    handleSkipPlayer,
    forceRefresh,
    handlePlayerImageFixed,
    startGameForPlayer,
    resetScore,
    clearDifficultyChange,
    saveToRanking
  };
};
