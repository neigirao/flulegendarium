
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
 * Hook principal do jogo adaptativo.
 * 
 * Gerencia todo o fluxo do jogo adaptativo, incluindo:
 * - Seleção de jogadores baseada em dificuldade
 * - Ajuste automático de dificuldade conforme desempenho
 * - Controle de pontuação, streaks e timer
 * - Validação de palpites com processamento de nomes
 * - Métricas e análise de jogo
 * 
 * ### Sistema de Dificuldade Adaptativa
 * - Aumenta após 3 acertos consecutivos
 * - Diminui após 2 erros consecutivos
 * - Afeta multiplicador de pontos
 * - Influencia seleção de jogadores
 * 
 * ### Controle de Jogadores
 * - Não repete jogadores na mesma partida
 * - Seleciona baseado em dificuldade atual
 * - Reinicia pool apenas ao resetar o jogo
 * 
 * @param {Player[]} players - Lista completa de jogadores disponíveis
 * 
 * @returns {Object} Estado e ações do jogo adaptativo
 * @returns {Player | null} currentPlayer - Jogador atual a ser adivinhado
 * @returns {number} gameKey - Chave para forçar re-render do componente
 * @returns {number} score - Pontuação total acumulada
 * @returns {boolean} gameOver - Se o jogo terminou
 * @returns {number} timeRemaining - Segundos restantes no timer
 * @returns {number} currentStreak - Sequência atual de acertos
 * @returns {DifficultyLevelConfig} currentDifficulty - Configuração da dificuldade atual
 * @returns {Function} handleGuess - Processa um palpite do usuário
 * @returns {Function} startGameForPlayer - Inicia o jogo para o jogador atual
 * @returns {Function} resetScore - Reseta todo o estado do jogo
 * 
 * @example
 * ```tsx
 * const {
 *   currentPlayer,
 *   score,
 *   handleGuess,
 *   currentDifficulty
 * } = useAdaptiveGuessGame(players);
 * 
 * // Processar palpite do usuário
 * await handleGuess("Fred");
 * 
 * // Verificar dificuldade atual
 * console.log(currentDifficulty.label); // "Médio"
 * ```
 * 
 * @see {@link useAdaptivePlayerSelection} Seleção de jogadores por dificuldade
 * @see {@link useAdaptiveGameMetrics} Sistema de métricas do jogo
 * @see {@link useCleanTimer} Gerenciamento do timer
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

  // Adaptive difficulty state
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevelConfig>(DIFFICULTY_LEVELS[0]);
  const [difficultyProgress, setDifficultyProgress] = useState(0);
  const [correctSequence, setCorrectSequence] = useState(0);
  const [incorrectSequence, setIncorrectSequence] = useState(0);

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
    adjustDifficulty(false);
    selectRandomPlayer();
  }, [gameOver, isProcessingGuess, adjustDifficulty, selectRandomPlayer]);

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
