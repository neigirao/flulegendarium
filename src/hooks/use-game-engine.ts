
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types/guess-game";
import { isCorrectGuess } from "@/utils/name-processor";
import { debugLogger } from "@/utils/debugLogger";

interface GameState {
  currentPlayer: Player | null;
  score: number;
  gameOver: boolean;
  timeRemaining: number;
  isProcessingGuess: boolean;
  gameActive: boolean;
  gamesPlayed: number;
  currentStreak: number;
  maxStreak: number;
  attempts: string[];
  error: string | null;
}

const INITIAL_STATE: GameState = {
  currentPlayer: null,
  score: 0,
  gameOver: false,
  timeRemaining: 60,
  isProcessingGuess: false,
  gameActive: false,
  gamesPlayed: 0,
  currentStreak: 0,
  maxStreak: 0,
  attempts: [],
  error: null
};

export const useGameEngine = (players: Player[] | undefined) => {
  debugLogger.info('GameEngine', 'Hook inicializado', { playersCount: players?.length });

  const { toast } = useToast();
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const timerRef = useRef<NodeJS.Timeout>();
  const isUnmountedRef = useRef(false);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Safe state update que não executa se componente foi desmontado
  const safeSetState = useCallback((updater: (prev: GameState) => GameState) => {
    if (!isUnmountedRef.current) {
      setState(updater);
    }
  }, []);

  // Timer do jogo
  useEffect(() => {
    debugLogger.debug('GameEngine', 'Timer effect', { 
      gameActive: state.gameActive, 
      gameOver: state.gameOver, 
      timeRemaining: state.timeRemaining 
    });

    if (!state.gameActive || state.gameOver || state.timeRemaining <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = undefined;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      safeSetState(prev => {
        const newTime = prev.timeRemaining - 1;
        debugLogger.debug('GameEngine', 'Timer tick', { newTime });

        if (newTime <= 0) {
          debugLogger.warn('GameEngine', 'Tempo esgotado');
          toast({
            variant: "destructive",
            title: "Tempo esgotado!",
            description: prev.currentPlayer ? `O jogador era ${prev.currentPlayer.name}` : "Tempo esgotado",
          });

          return {
            ...prev,
            timeRemaining: 0,
            gameOver: true,
            gameActive: false,
            currentStreak: 0
          };
        }

        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [state.gameActive, state.gameOver, state.timeRemaining, toast, safeSetState]);

  // Selecionar jogador aleatório
  const selectRandomPlayer = useCallback(() => {
    try {
      debugLogger.info('GameEngine', 'Selecionando jogador aleatório', { playersAvailable: players?.length });

      if (!players || players.length === 0) {
        debugLogger.error('GameEngine', 'Nenhum jogador disponível');
        safeSetState(prev => ({ ...prev, error: 'Nenhum jogador disponível' }));
        return;
      }

      const randomIndex = Math.floor(Math.random() * players.length);
      const newPlayer = players[randomIndex];

      if (!newPlayer) {
        debugLogger.error('GameEngine', 'Jogador selecionado é inválido', { randomIndex });
        safeSetState(prev => ({ ...prev, error: 'Erro ao selecionar jogador' }));
        return;
      }

      debugLogger.info('GameEngine', 'Novo jogador selecionado', { 
        player: newPlayer.name, 
        id: newPlayer.id 
      });

      safeSetState(prev => ({
        ...prev,
        currentPlayer: newPlayer,
        gameOver: false,
        gameActive: true,
        timeRemaining: 60,
        attempts: [],
        error: null
      }));

    } catch (error) {
      debugLogger.error('GameEngine', 'Erro ao selecionar jogador', error);
      safeSetState(prev => ({ ...prev, error: 'Erro interno ao selecionar jogador' }));
    }
  }, [players, safeSetState]);

  // Processar palpite
  const handleGuess = useCallback(async (guess: string) => {
    try {
      debugLogger.info('GameEngine', 'Processando palpite', { guess });

      if (!state.currentPlayer || !guess || state.gameOver || state.isProcessingGuess) {
        debugLogger.warn('GameEngine', 'Condições não atendidas para processar palpite', {
          hasPlayer: !!state.currentPlayer,
          hasGuess: !!guess,
          gameOver: state.gameOver,
          isProcessing: state.isProcessingGuess
        });
        return;
      }

      safeSetState(prev => ({ ...prev, isProcessingGuess: true }));

      const isCorrect = isCorrectGuess(guess, state.currentPlayer.name);
      debugLogger.info('GameEngine', 'Resultado do palpite', { guess, correct: isCorrect });

      if (isCorrect) {
        const points = 5;
        debugLogger.info('GameEngine', 'Acertou!', { points });

        toast({
          title: "Parabéns!",
          description: `Você acertou! +${points} pontos`,
        });

        safeSetState(prev => {
          const newStreak = prev.currentStreak + 1;
          return {
            ...prev,
            score: prev.score + points,
            gamesPlayed: prev.gamesPlayed + 1,
            currentStreak: newStreak,
            maxStreak: Math.max(prev.maxStreak, newStreak),
            isProcessingGuess: false
          };
        });

        // Selecionar próximo jogador após delay
        setTimeout(() => {
          selectRandomPlayer();
        }, 1500);

      } else {
        debugLogger.info('GameEngine', 'Errou!');

        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `O jogador era ${state.currentPlayer.name}. Pontuação final: ${state.score}`,
        });

        safeSetState(prev => ({
          ...prev,
          gameOver: true,
          gameActive: false,
          currentStreak: 0,
          isProcessingGuess: false,
          attempts: [...prev.attempts, guess]
        }));
      }
    } catch (error) {
      debugLogger.error('GameEngine', 'Erro ao processar palpite', error);
      safeSetState(prev => ({ 
        ...prev, 
        isProcessingGuess: false,
        error: 'Erro ao processar palpite'
      }));
    }
  }, [state.currentPlayer, state.gameOver, state.isProcessingGuess, state.score, toast, safeSetState, selectRandomPlayer]);

  // Reset do jogo
  const resetGame = useCallback(() => {
    debugLogger.info('GameEngine', 'Resetando jogo');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }

    safeSetState(() => ({
      ...INITIAL_STATE,
      maxStreak: state.maxStreak // Manter record
    }));
  }, [safeSetState, state.maxStreak]);

  // Auto-selecionar primeiro jogador
  useEffect(() => {
    if (players && players.length > 0 && !state.currentPlayer && !state.gameOver && !state.error) {
      debugLogger.info('GameEngine', 'Auto-selecionando primeiro jogador');
      selectRandomPlayer();
    }
  }, [players, state.currentPlayer, state.gameOver, state.error, selectRandomPlayer]);

  const gameData = {
    // Estado básico
    currentPlayer: state.currentPlayer,
    score: state.score,
    gameOver: state.gameOver,
    timeRemaining: state.timeRemaining,
    isProcessingGuess: state.isProcessingGuess,
    gameActive: state.gameActive,
    gamesPlayed: state.gamesPlayed,
    currentStreak: state.currentStreak,
    maxStreak: state.maxStreak,
    attempts: state.attempts,
    error: state.error,

    // Propriedades calculadas (para compatibilidade)
    gameKey: state.currentPlayer?.id || 'no-player',
    hasLost: state.gameOver,
    isTimerRunning: state.gameActive,
    playerChangeCount: state.gamesPlayed,

    // Constantes
    MAX_ATTEMPTS: 1,
    TIME_LIMIT_SECONDS: 60,

    // Funções
    handleGuess,
    selectRandomPlayer,
    resetGame,
    resetScore: () => safeSetState(prev => ({ ...prev, score: 0 })),
    handlePlayerImageFixed: () => debugLogger.info('GameEngine', 'Imagem do jogador corrigida'),
    startGameForPlayer: selectRandomPlayer,
    forceRefresh: selectRandomPlayer,
  };

  debugLogger.debug('GameEngine', 'Estado atual', gameData);
  return gameData;
};
