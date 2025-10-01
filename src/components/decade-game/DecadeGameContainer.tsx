
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DecadeSelectionPage } from './DecadeSelectionPage';
import { GameContainer } from '@/components/guess-game/GameContainer';
import { BaseGameContainer } from '@/components/guess-game/BaseGameContainer';
import { useDecadePlayerSelection } from '@/hooks/use-decade-player-selection';
import { useSimpleGameLogic } from '@/hooks/use-simple-game-logic';
import { useSimpleGameCallbacks } from '@/hooks/use-simple-game-callbacks';
import { useSimpleGameMetrics } from '@/hooks/use-simple-game-metrics';
import { useDecadeGameTimer } from '@/hooks/use-decade-game-timer';
import { useDecadeGameState } from '@/hooks/use-decade-game-state';
import { Decade } from '@/types/decade-game';
import { decadePlayerService } from '@/services/decadePlayerService';
import { getDecadeInfo } from '@/data/decades';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';

export const DecadeGameContainer = () => {
  const navigate = useNavigate();
  
  // Remover temporariamente o useUX que pode estar causando problemas
  // const { showContextualFeedback } = useUX();
  
  const [selectedDecade, setSelectedDecade] = useState<Decade | null>(null);
  const [playerCounts, setPlayerCounts] = useState<Record<Decade, number>>({
    '1970s': 0,
    '1980s': 0,
    '1990s': 0,
    '2000s': 0,
    '2010s': 0,
    '2020s': 0
  });
  const [gameKey, setGameKey] = useState(0);

  // Hooks do jogo
  const { 
    availablePlayers, 
    currentPlayer, 
    isLoading: playersLoading,
    selectRandomPlayer,
    handlePlayerImageFixed,
    playerChangeCount
  } = useDecadePlayerSelection(selectedDecade);

  const {
    score,
    addScore,
    gameOver,
    endGame,
    resetGame,
    attempts,
    incrementAttempts,
    MAX_ATTEMPTS,
    currentStreak,
    maxStreak,
    resetStreak,
    gamesPlayed,
    currentDifficulty,
    difficultyProgress,
    adjustDifficulty
  } = useDecadeGameState();

  const {
    timeRemaining,
    isTimerRunning,
    startTimer,
    stopTimer,
    resetTimer
  } = useDecadeGameTimer({
    initialTime: 60,
    onTimeUp: () => {
      endGame();
      resetStreak();
    }
  });

  const {
    startMetricsTracking,
    incrementCorrectGuesses,
    saveGameData,
    resetMetrics
  } = useSimpleGameMetrics();

  const gameCallbacks = useSimpleGameCallbacks({
    currentPlayer,
    gameActive: !gameOver,
    gameOver,
    score,
    endGame,
    resetStreak,
    saveGameData,
    setGameProgress: () => {}, // Não usado no modo década
    addScore,
    incrementCorrectGuesses,
    incrementAttempts
  });

  const { handleGuess, isProcessingGuess } = useSimpleGameLogic({
    currentPlayer,
    onCorrectGuess: gameCallbacks.handleCorrectGuess,
    onIncorrectGuess: gameCallbacks.handleIncorrectGuess,
    onGameEnd: gameCallbacks.handleGameEnd,
    selectRandomPlayer,
    stopTimer,
    startTimer
  });

  // Carregar contadores de jogadores por década
  useEffect(() => {
    const loadPlayerCounts = async () => {
      try {
        const availableDecades = await decadePlayerService.getAvailableDecades();
        const counts: Record<Decade, number> = {
          '1970s': 0,
          '1980s': 0,
          '1990s': 0,
          '2000s': 0,
          '2010s': 0,
          '2020s': 0
        };
        
        for (const decade of availableDecades) {
          const players = await decadePlayerService.getPlayersByDecade(decade);
          counts[decade] = players.length;
        }
        
        setPlayerCounts(counts);
      } catch (error) {
        logger.error('Error loading player counts for decades');
      }
    };

    loadPlayerCounts();
  }, []);

  // Iniciar jogo quando jogador é selecionado
  useEffect(() => {
    if (currentPlayer && !gameOver) {
      startMetricsTracking();
      startTimer();
    }
  }, [currentPlayer, gameOver, startMetricsTracking, startTimer]);

  const handleDecadeSelect = (decade: Decade) => {
    setSelectedDecade(decade);
    resetGame();
    resetMetrics();
    resetTimer();
    setGameKey(prev => prev + 1);
  };

  const handleBackToSelection = () => {
    setSelectedDecade(null);
    resetGame();
    resetMetrics();
    resetTimer();
  };

  const handleResetGame = () => {
    resetGame();
    resetMetrics();
    resetTimer();
    setGameKey(prev => prev + 1);
  };

  const forceRefresh = () => {
    setGameKey(prev => prev + 1);
  };

  // Se nenhuma década foi selecionada, mostrar página de seleção
  if (!selectedDecade) {
    return (
      <DecadeSelectionPage 
        onDecadeSelect={handleDecadeSelect}
        playerCounts={playerCounts}
      />
    );
  }

  const decadeInfo = getDecadeInfo(selectedDecade);

  return (
    <BaseGameContainer
      onBack={handleBackToSelection}
      backLabel="Décadas"
      title={decadeInfo.label}
      subtitle={decadeInfo.description}
      icon={decadeInfo.icon}
      iconColor={decadeInfo.color}
      isLoading={playersLoading}
      loadingMessage={`Carregando jogadores dos ${decadeInfo.label}...`}
      hasPlayers={availablePlayers.length > 0}
      emptyStateMessage={`Não há jogadores cadastrados para os ${decadeInfo.label}.`}
      emptyStateAction={
        <Button onClick={handleBackToSelection}>
          Escolher outra década
        </Button>
      }
      playerCount={availablePlayers.length}
      onReset={handleResetGame}
      showReset={true}
    >
      <GameContainer
        currentPlayer={currentPlayer}
        gameKey={gameKey.toString()}
        attempts={attempts}
        score={score}
        gameOver={gameOver}
        timeRemaining={timeRemaining}
        MAX_ATTEMPTS={MAX_ATTEMPTS}
        handleGuess={handleGuess}
        selectRandomPlayer={selectRandomPlayer}
        handlePlayerImageFixed={handlePlayerImageFixed}
        isProcessingGuess={isProcessingGuess}
        hasLost={gameOver}
        startGameForPlayer={() => {}}
        isTimerRunning={isTimerRunning}
        gamesPlayed={gamesPlayed}
        currentStreak={currentStreak}
        maxStreak={maxStreak}
        forceRefresh={forceRefresh}
        playerChangeCount={playerChangeCount}
        gameProgress={{ 
          currentRound: gamesPlayed + 1,
          currentStreak: currentStreak,
          allowedDifficulties: ['muito_facil', 'facil', 'medio', 'dificil', 'muito_dificil'],
          nextDifficultyThreshold: difficultyProgress
        }}
        currentDifficulty={{ 
          label: currentDifficulty.label, 
          level: currentDifficulty.level,
          color: 'bg-flu-grena',
          icon: '🎯',
          multiplier: currentDifficulty.multiplier
        } as any}
      />
    </BaseGameContainer>
  );
};

export default DecadeGameContainer;
