
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Player, DifficultyLevel, GameProgressInfo } from "@/types/guess-game";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const DIFFICULTY_LEVELS: Record<string, DifficultyLevel> = {
  muito_facil: { level: 'muito_facil', label: 'Muito Fácil', color: 'text-green-600', icon: '⭐', multiplier: 1.0 },
  facil: { level: 'facil', label: 'Fácil', color: 'text-blue-600', icon: '⭐⭐', multiplier: 1.2 },
  medio: { level: 'medio', label: 'Médio', color: 'text-yellow-600', icon: '⭐⭐⭐', multiplier: 1.5 },
  dificil: { level: 'dificil', label: 'Difícil', color: 'text-orange-600', icon: '⭐⭐⭐⭐', multiplier: 2.0 },
  muito_dificil: { level: 'muito_dificil', label: 'Muito Difícil', color: 'text-red-600', icon: '⭐⭐⭐⭐⭐', multiplier: 3.0 }
};

export const useAdaptivePlayerSelection = (players: Player[] | undefined) => {
  const { user } = useAuth();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameKey, setGameKey] = useState<string>(Date.now().toString());
  const [gameProgress, setGameProgress] = useState<GameProgressInfo>({
    currentRound: 1,
    currentStreak: 0,
    allowedDifficulties: ['muito_facil', 'facil'],
    nextDifficultyThreshold: 3
  });

  const isInitialized = useRef<boolean>(false);
  const lastSelectedId = useRef<string | null>(null);
  const playerChangeCount = useRef<number>(0);
  const roundStartTime = useRef<number>(Date.now());

  // Calcular dificuldades permitidas baseado no progresso
  const getAllowedDifficulties = useCallback((streak: number, round: number): string[] => {
    if (streak === 0 && round <= 2) return ['muito_facil', 'facil'];
    if (streak <= 2) return ['muito_facil', 'facil', 'medio'];
    if (streak <= 5) return ['facil', 'medio', 'dificil'];
    return ['medio', 'dificil', 'muito_dificil'];
  }, []);

  // Filtrar jogadores por dificuldades permitidas
  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    return players.filter(player => 
      gameProgress.allowedDifficulties.includes(player.difficulty_level || 'medio')
    );
  }, [players, gameProgress.allowedDifficulties]);

  // Salvar estatísticas de dificuldade
  const savePlayerDifficultyStats = useCallback(async (
    playerId: string, 
    guessTime: number, 
    isCorrect: boolean
  ) => {
    if (!user) return;

    try {
      await supabase.from('player_difficulty_stats').insert({
        player_id: playerId,
        user_id: user.id,
        guess_time: guessTime,
        is_correct: isCorrect,
        session_id: gameKey,
        device_type: /Mobile|Android|iP(hone|od)/.test(navigator.userAgent) ? 'mobile' : 'desktop'
      });
      console.log('📊 Estatísticas de dificuldade salvas para:', playerId);
    } catch (error) {
      console.error('❌ Erro ao salvar estatísticas:', error);
    }
  }, [user, gameKey]);

  // Inicializar com primeiro jogador
  useEffect(() => {
    if (filteredPlayers && filteredPlayers.length > 0 && !isInitialized.current) {
      console.log('🎮 Inicializando seleção adaptativa com', filteredPlayers.length, 'jogadores filtrados');
      isInitialized.current = true;
      const randomIndex = Math.floor(Math.random() * filteredPlayers.length);
      const selectedPlayer = filteredPlayers[randomIndex];
      if (selectedPlayer) {
        console.log('🎯 Jogador inicial selecionado:', selectedPlayer.name, 'Dificuldade:', selectedPlayer.difficulty_level);
        setCurrentPlayer(selectedPlayer);
        lastSelectedId.current = selectedPlayer.id;
        setGameKey(`adaptive-${Date.now()}-${playerChangeCount.current}`);
        roundStartTime.current = Date.now();
      }
    }
  }, [filteredPlayers]);

  // Seleção adaptativa de jogador
  const selectRandomPlayer = useCallback((isCorrectGuess?: boolean) => {
    if (!filteredPlayers || filteredPlayers.length === 0) {
      console.warn('⚠️ Nenhum jogador disponível para a dificuldade atual');
      return;
    }

    // Calcular tempo da rodada anterior
    const guessTime = Date.now() - roundStartTime.current;
    
    // Salvar estatísticas do jogador anterior se houve tentativa
    if (currentPlayer && isCorrectGuess !== undefined) {
      savePlayerDifficultyStats(currentPlayer.id, guessTime, isCorrectGuess);
    }

    playerChangeCount.current += 1;
    
    // Atualizar progresso do jogo
    const newStreak = isCorrectGuess ? gameProgress.currentStreak + 1 : 0;
    const newRound = gameProgress.currentRound + 1;
    const newAllowedDifficulties = getAllowedDifficulties(newStreak, newRound);
    
    setGameProgress({
      currentRound: newRound,
      currentStreak: newStreak,
      allowedDifficulties: newAllowedDifficulties,
      nextDifficultyThreshold: Math.ceil((newStreak + 1) / 3) * 3
    });

    console.log('🔄 Progresso atualizado:', {
      round: newRound,
      streak: newStreak,
      difficulties: newAllowedDifficulties
    });

    // Novo game key para forçar refresh
    const newGameKey = `adaptive-${Date.now()}-${playerChangeCount.current}`;
    
    // Filtrar para evitar repetir o jogador atual
    const availablePlayers = filteredPlayers.filter(player => player.id !== lastSelectedId.current);
    const playersToSelect = availablePlayers.length > 0 ? availablePlayers : filteredPlayers;
    
    const randomIndex = Math.floor(Math.random() * playersToSelect.length);
    const selectedPlayer = playersToSelect[randomIndex];
    
    if (selectedPlayer) {
      console.log('🎯 Novo jogador selecionado:', {
        name: selectedPlayer.name,
        difficulty: selectedPlayer.difficulty_level,
        gameKey: newGameKey,
        changeCount: playerChangeCount.current
      });
      
      setGameKey(newGameKey);
      setCurrentPlayer(selectedPlayer);
      lastSelectedId.current = selectedPlayer.id;
      roundStartTime.current = Date.now();
    }
  }, [filteredPlayers, currentPlayer, gameProgress, getAllowedDifficulties, savePlayerDifficultyStats]);

  // Calcular pontuação baseada na dificuldade
  const calculateDifficultyPoints = useCallback((basePontos: number, playerDifficulty?: string): number => {
    if (!playerDifficulty) return basePontos;
    const multiplier = DIFFICULTY_LEVELS[playerDifficulty]?.multiplier || 1.0;
    return Math.round(basePontos * multiplier);
  }, []);

  // Reset do progresso
  const resetProgress = useCallback(() => {
    setGameProgress({
      currentRound: 1,
      currentStreak: 0,
      allowedDifficulties: ['muito_facil', 'facil'],
      nextDifficultyThreshold: 3
    });
    playerChangeCount.current = 0;
  }, []);

  // Force refresh - útil para debug
  const forceRefresh = useCallback(() => {
    if (currentPlayer) {
      playerChangeCount.current += 1;
      const newGameKey = `refresh-${Date.now()}-${playerChangeCount.current}`;
      console.log('🔄 Forçando refresh do jogador atual:', currentPlayer.name, 'com key:', newGameKey);
      setGameKey(newGameKey);
    }
  }, [currentPlayer]);

  const handlePlayerImageFixed = useCallback(() => {
    if (currentPlayer) {
      console.log('🖼️ Imagem corrigida para:', currentPlayer.name);
    }
  }, [currentPlayer]);

  // Obter informações de dificuldade do jogador atual
  const currentDifficulty = useMemo(() => {
    if (!currentPlayer?.difficulty_level) return null;
    return DIFFICULTY_LEVELS[currentPlayer.difficulty_level];
  }, [currentPlayer]);

  return {
    currentPlayer,
    gameKey,
    gameProgress,
    currentDifficulty,
    selectRandomPlayer,
    forceRefresh,
    handlePlayerImageFixed,
    calculateDifficultyPoints,
    resetProgress,
    playerChangeCount: playerChangeCount.current,
    savePlayerDifficultyStats
  };
};
