
import { useState, useCallback, useEffect } from 'react';
import { Player } from '@/types/guess-game';
import { useIntelligentPlayerSelection } from './use-intelligent-player-selection';
import { useObservability } from './use-observability';

export const useEnhancedPlayerSelection = (players: Player[] | undefined) => {
  const { log } = useObservability();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [previousPlayer, setPreviousPlayer] = useState<Player | null>(null);

  const {
    selectNextPlayer,
    recordGuessResult,
    resetSession,
    getSessionStats,
    playersWithDifficulty
  } = useIntelligentPlayerSelection(players || []);

  // Selecionar um novo jogador aleatório com lógica inteligente
  const selectRandomPlayer = useCallback(() => {
    if (!players || players.length === 0) {
      log('warn', 'No players available for selection');
      return;
    }

    const newPlayer = selectNextPlayer();
    
    if (newPlayer && newPlayer.id !== currentPlayer?.id) {
      setPreviousPlayer(currentPlayer);
      setCurrentPlayer(newPlayer);
      
      log('info', 'Enhanced player selected', {
        playerId: newPlayer.id,
        playerName: newPlayer.name,
        difficulty: (newPlayer as any).difficulty_level || 'medio',
        sessionStats: getSessionStats()
      });
    } else if (newPlayer) {
      // Se o mesmo jogador foi selecionado, tentar novamente
      setTimeout(() => selectRandomPlayer(), 100);
    }
  }, [players, currentPlayer, selectNextPlayer, getSessionStats, log]);

  // Manipular correção da imagem do jogador
  const handlePlayerImageFixed = useCallback(() => {
    log('info', 'Player image loaded successfully', {
      playerId: currentPlayer?.id,
      playerName: currentPlayer?.name
    });
  }, [currentPlayer, log]);

  // Registrar resultado e selecionar próximo jogador
  const handleGuessResult = useCallback(async (isCorrect: boolean, guessTime: number) => {
    if (!currentPlayer) return;

    await recordGuessResult(currentPlayer, isCorrect, guessTime);
    
    log('info', 'Guess result recorded', {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      isCorrect,
      guessTime,
      sessionStats: getSessionStats()
    });
  }, [currentPlayer, recordGuessResult, getSessionStats, log]);

  // Resetar seleção e sessão
  const resetPlayerSelection = useCallback(() => {
    setCurrentPlayer(null);
    setPreviousPlayer(null);
    resetSession();
    log('info', 'Player selection and session reset');
  }, [resetSession, log]);

  // Selecionar jogador inicial quando players carregam
  useEffect(() => {
    if (players && players.length > 0 && !currentPlayer) {
      selectRandomPlayer();
    }
  }, [players, currentPlayer, selectRandomPlayer]);

  return {
    currentPlayer,
    previousPlayer,
    selectRandomPlayer,
    handlePlayerImageFixed,
    handleGuessResult,
    resetPlayerSelection,
    getSessionStats,
    playersWithDifficulty
  };
};
