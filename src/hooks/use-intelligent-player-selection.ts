
import { useState, useEffect, useCallback } from 'react';
import { Player } from '@/types/guess-game';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useObservability } from './use-observability';

interface PlayerDifficultyProfile extends Player {
  difficulty_level: 'muito_facil' | 'facil' | 'medio' | 'dificil' | 'muito_dificil';
  difficulty_score: number;
  difficulty_confidence: number;
  total_attempts: number;
  correct_attempts: number;
  average_guess_time: number;
}

interface GameProgressionState {
  currentSessionCorrectAnswers: number;
  totalSessionAttempts: number;
  difficultyLevel: 'muito_facil' | 'facil' | 'medio' | 'dificil' | 'muito_dificil';
  lastPlayerWasCorrect: boolean;
  consecutiveCorrectAnswers: number;
  consecutiveWrongAnswers: number;
}

export const useIntelligentPlayerSelection = (players: Player[] = []) => {
  const { user } = useAuth();
  const { log } = useObservability();
  
  const [playersWithDifficulty, setPlayersWithDifficulty] = useState<PlayerDifficultyProfile[]>([]);
  const [gameProgression, setGameProgression] = useState<GameProgressionState>({
    currentSessionCorrectAnswers: 0,
    totalSessionAttempts: 0,
    difficultyLevel: 'muito_facil',
    lastPlayerWasCorrect: false,
    consecutiveCorrectAnswers: 0,
    consecutiveWrongAnswers: 0
  });

  // Carregar dados de dificuldade dos jogadores
  useEffect(() => {
    if (players.length > 0) {
      const enrichedPlayers = players.map(player => ({
        ...player,
        difficulty_level: (player as any).difficulty_level || 'medio',
        difficulty_score: (player as any).difficulty_score || 50,
        difficulty_confidence: (player as any).difficulty_confidence || 0,
        total_attempts: (player as any).total_attempts || 0,
        correct_attempts: (player as any).correct_attempts || 0,
        average_guess_time: (player as any).average_guess_time || 30000
      })) as PlayerDifficultyProfile[];
      
      setPlayersWithDifficulty(enrichedPlayers);
    }
  }, [players]);

  // Algoritmo de progressão inteligente de dificuldade
  const calculateTargetDifficulty = useCallback(() => {
    const { 
      currentSessionCorrectAnswers, 
      totalSessionAttempts, 
      consecutiveCorrectAnswers, 
      consecutiveWrongAnswers 
    } = gameProgression;

    // Começa sempre com muito fácil
    if (totalSessionAttempts === 0) {
      return 'muito_facil';
    }

    const sessionAccuracy = totalSessionAttempts > 0 ? 
      currentSessionCorrectAnswers / totalSessionAttempts : 0;

    // Lógica de progressão baseada em performance
    if (consecutiveCorrectAnswers >= 3 && sessionAccuracy > 0.8) {
      // Usuário está indo muito bem, aumentar dificuldade
      switch (gameProgression.difficultyLevel) {
        case 'muito_facil': return 'facil';
        case 'facil': return 'medio';
        case 'medio': return 'dificil';
        case 'dificil': return 'muito_dificil';
        default: return 'muito_dificil';
      }
    } else if (consecutiveWrongAnswers >= 2 && sessionAccuracy < 0.4) {
      // Usuário está com dificuldade, diminuir dificuldade
      switch (gameProgression.difficultyLevel) {
        case 'muito_dificil': return 'dificil';
        case 'dificil': return 'medio';
        case 'medio': return 'facil';
        case 'facil': return 'muito_facil';
        default: return 'muito_facil';
      }
    }

    // Manter nível atual
    return gameProgression.difficultyLevel;
  }, [gameProgression]);

  // Selecionar jogador baseado na dificuldade alvo
  const selectPlayerByDifficulty = useCallback((targetDifficulty: string) => {
    if (playersWithDifficulty.length === 0) return null;

    // Filtrar jogadores pela dificuldade alvo
    let candidatePlayers = playersWithDifficulty.filter(
      player => player.difficulty_level === targetDifficulty
    );

    // Se não houver jogadores da dificuldade alvo, usar nível próximo
    if (candidatePlayers.length === 0) {
      const difficultyOrder = ['muito_facil', 'facil', 'medio', 'dificil', 'muito_dificil'];
      const targetIndex = difficultyOrder.indexOf(targetDifficulty);
      
      // Tentar níveis próximos
      for (let offset = 1; offset < difficultyOrder.length; offset++) {
        const lowerIndex = targetIndex - offset;
        const higherIndex = targetIndex + offset;
        
        if (lowerIndex >= 0) {
          candidatePlayers = playersWithDifficulty.filter(
            player => player.difficulty_level === difficultyOrder[lowerIndex]
          );
          if (candidatePlayers.length > 0) break;
        }
        
        if (higherIndex < difficultyOrder.length) {
          candidatePlayers = playersWithDifficulty.filter(
            player => player.difficulty_level === difficultyOrder[higherIndex]
          );
          if (candidatePlayers.length > 0) break;
        }
      }
    }

    // Se ainda não há candidatos, usar todos os jogadores
    if (candidatePlayers.length === 0) {
      candidatePlayers = playersWithDifficulty;
    }

    // Adicionar elemento de aleatoriedade ponderada
    // Jogadores com menos tentativas têm prioridade (para balanceamento)
    const weightedPlayers = candidatePlayers.map(player => ({
      ...player,
      weight: Math.max(1, 10 - player.total_attempts) // Mais peso para jogadores menos testados
    }));

    const totalWeight = weightedPlayers.reduce((sum, player) => sum + player.weight, 0);
    let randomWeight = Math.random() * totalWeight;

    for (const player of weightedPlayers) {
      randomWeight -= player.weight;
      if (randomWeight <= 0) {
        return player;
      }
    }

    // Fallback
    return candidatePlayers[Math.floor(Math.random() * candidatePlayers.length)];
  }, [playersWithDifficulty]);

  // Selecionar próximo jogador com lógica inteligente
  const selectNextPlayer = useCallback(() => {
    const targetDifficulty = calculateTargetDifficulty();
    const selectedPlayer = selectPlayerByDifficulty(targetDifficulty);
    
    // Atualizar nível de dificuldade atual
    setGameProgression(prev => ({
      ...prev,
      difficultyLevel: targetDifficulty as any
    }));

    log('info', 'Intelligent player selection', {
      targetDifficulty,
      selectedPlayer: selectedPlayer?.name,
      gameProgression
    });

    return selectedPlayer;
  }, [calculateTargetDifficulty, selectPlayerByDifficulty, gameProgression, log]);

  // Registrar resultado da tentativa
  const recordGuessResult = useCallback(async (
    player: Player, 
    isCorrect: boolean, 
    guessTime: number
  ) => {
    // Atualizar progressão da sessão
    setGameProgression(prev => ({
      ...prev,
      currentSessionCorrectAnswers: prev.currentSessionCorrectAnswers + (isCorrect ? 1 : 0),
      totalSessionAttempts: prev.totalSessionAttempts + 1,
      lastPlayerWasCorrect: isCorrect,
      consecutiveCorrectAnswers: isCorrect ? prev.consecutiveCorrectAnswers + 1 : 0,
      consecutiveWrongAnswers: isCorrect ? 0 : prev.consecutiveWrongAnswers + 1
    }));

    // Salvar estatísticas no banco de dados
    if (user) {
      try {
        const { error } = await supabase
          .from('player_difficulty_stats')
          .insert({
            player_id: player.id,
            user_id: user.id,
            guess_time: guessTime,
            is_correct: isCorrect,
            session_id: `session_${user.id}_${Date.now()}`,
            device_type: window.innerWidth < 768 ? 'mobile' : 'desktop'
          });

        if (error) {
          console.error('Erro ao salvar estatísticas de dificuldade:', error);
        } else {
          log('info', 'Player difficulty stats saved', {
            playerId: player.id,
            playerName: player.name,
            isCorrect,
            guessTime
          });
        }
      } catch (error) {
        console.error('Erro ao conectar com banco de dados:', error);
      }
    }
  }, [user, log]);

  // Resetar progressão da sessão
  const resetSession = useCallback(() => {
    setGameProgression({
      currentSessionCorrectAnswers: 0,
      totalSessionAttempts: 0,
      difficultyLevel: 'muito_facil',
      lastPlayerWasCorrect: false,
      consecutiveCorrectAnswers: 0,
      consecutiveWrongAnswers: 0
    });
  }, []);

  // Obter estatísticas da sessão atual
  const getSessionStats = useCallback(() => {
    const accuracy = gameProgression.totalSessionAttempts > 0 ? 
      gameProgression.currentSessionCorrectAnswers / gameProgression.totalSessionAttempts : 0;
    
    return {
      accuracy: Math.round(accuracy * 100),
      totalAttempts: gameProgression.totalSessionAttempts,
      correctAnswers: gameProgression.currentSessionCorrectAnswers,
      currentDifficulty: gameProgression.difficultyLevel,
      streak: gameProgression.consecutiveCorrectAnswers
    };
  }, [gameProgression]);

  return {
    selectNextPlayer,
    recordGuessResult,
    resetSession,
    getSessionStats,
    playersWithDifficulty,
    gameProgression
  };
};
