import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DecadeSelectionPage } from './DecadeSelectionPage';
import { BaseGameContainer } from '@/components/guess-game/BaseGameContainer';
import { GameHeader } from '@/components/guess-game/GameHeader';
import { GuestNameForm } from '@/components/guess-game/GuestNameForm';
import { GameOverDialog } from '@/components/guess-game/GameOverDialog';
import { GuessHistoryPanel } from '@/components/guess-game/GuessHistoryPanel';
import { SkipPlayerButton } from '@/components/guess-game/SkipPlayerButton';
import { AdaptiveProgressionNotification } from '@/components/guess-game/AdaptiveProgressionNotification';
import { DebugInfo } from '@/components/guess-game/DebugInfo';
import { GuessForm } from '@/components/guess-game/GuessForm';
import { SEOManager } from '@/components/seo/SEOManager';
import { KeyboardShortcutsHint } from '@/components/game/KeyboardShortcutsHint';
import { UnifiedPlayerImage } from '@/components/player-image/UnifiedPlayerImage';
import { AchievementNotification } from '@/components/achievements/AchievementNotification';
import { ImageFeedbackButton } from '@/components/image-feedback/ImageFeedbackButton';
import {
  useDecadePlayerSelection,
  useSimpleGameLogic,
  useSimpleGameCallbacks,
  useSimpleGameMetrics,
  useDecadeGameTimer,
  useDecadeGameState,
} from '@/hooks/game';
import { useGameOrchestration } from '@/hooks/game';
import { Decade } from '@/types/decade-game';
import { decadePlayerService } from '@/services/decadePlayerService';
import { getDecadeInfo } from '@/data/decades';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';
import { clearAllImageCache, prepareNextBatch } from '@/utils/player-image';
import { CoachMark } from '@/components/onboarding';
import type { DifficultyLevel } from '@/types/guess-game';

export const DecadeGameContainer = () => {
  const navigate = useNavigate();
  const [selectedDecade, setSelectedDecade] = useState<Decade | null>(null);
  const [playerCounts, setPlayerCounts] = useState<Record<Decade, number>>({
    '1970s': 0, '1980s': 0, '1990s': 0, '2000s': 0, '2010s': 0, '2020s': 0,
  });
  const [gameKey, setGameKey] = useState(0);

  // Game hooks
  const {
    availablePlayers, currentPlayer, isLoading: playersLoading,
    selectRandomPlayer, handlePlayerImageFixed, playerChangeCount,
  } = useDecadePlayerSelection(selectedDecade);

  const {
    score, addScore, gameOver, endGame, resetGame: resetDecadeGame,
    attempts, incrementAttempts, MAX_ATTEMPTS,
    currentStreak, maxStreak, resetStreak,
    gamesPlayed, currentDifficulty, difficultyProgress,
  } = useDecadeGameState();

  const {
    timeRemaining, isTimerRunning, startTimer, stopTimer, resetTimer,
  } = useDecadeGameTimer({
    initialTime: 60,
    onTimeUp: () => { endGame(); resetStreak(); },
  });

  const {
    startMetricsTracking, incrementCorrectGuesses,
    saveGameData, saveToRanking, resetMetrics,
  } = useSimpleGameMetrics();

  const gameCallbacks = useSimpleGameCallbacks({
    currentPlayer, gameActive: !gameOver, gameOver, score,
    endGame, resetStreak, saveGameData, setGameProgress: () => {},
    addScore, incrementCorrectGuesses, incrementAttempts,
  });

  const { handleGuess: originalHandleGuess, isProcessingGuess } = useSimpleGameLogic({
    currentPlayer,
    onCorrectGuess: gameCallbacks.handleCorrectGuess,
    onIncorrectGuess: gameCallbacks.handleIncorrectGuess,
    onGameEnd: gameCallbacks.handleGameEnd,
    selectRandomPlayer, stopTimer, startTimer,
  });

  const handleResetGame = useCallback(() => {
    resetDecadeGame(); resetMetrics(); resetTimer();
    setGameKey(prev => prev + 1);
  }, [resetDecadeGame, resetMetrics, resetTimer]);

  // Orchestration
  const orch = useGameOrchestration({
    gameMode: selectedDecade ? `decade_${selectedDecade}` : 'decade',
    pagePath: '/quiz-decada',
    currentItem: currentPlayer ? { id: currentPlayer.id, name: currentPlayer.name, image_url: currentPlayer.image_url } : null,
    gameOver, score, gamesPlayed, currentStreak,
    currentDifficulty, difficultyProgress,
    isTimerRunning, isProcessingGuess, timeRemaining,
    startGame: startTimer,
    resetGame: handleResetGame,
    selectNext: selectRandomPlayer,
    dataReady: availablePlayers.length > 0,
    clearImageCache: clearAllImageCache,
  });

  const handleGuess = orch.wrapGuess(originalHandleGuess);

  const handleImageFixed = useCallback(() => {
    orch.handleImageLoaded();
    handlePlayerImageFixed();
    if (availablePlayers.length > 0 && currentPlayer) {
      prepareNextBatch(availablePlayers, currentPlayer, 2);
    }
  }, [orch, handlePlayerImageFixed, availablePlayers, currentPlayer]);

  // Load player counts per decade
  useEffect(() => {
    const loadPlayerCounts = async () => {
      try {
        const availableDecades = await decadePlayerService.getAvailableDecades();
        const counts: Record<Decade, number> = { '1970s': 0, '1980s': 0, '1990s': 0, '2000s': 0, '2010s': 0, '2020s': 0 };
        for (const decade of availableDecades) {
          const players = await decadePlayerService.getPlayersByDecade(decade);
          counts[decade] = players.length;
        }
        setPlayerCounts(counts);
      } catch { logger.error('Error loading player counts for decades'); }
    };
    loadPlayerCounts();
  }, []);

  // Start metrics tracking when player is ready
  useEffect(() => {
    if (currentPlayer && !gameOver && (orch.user || orch.guestName)) {
      startMetricsTracking();
    }
  }, [currentPlayer, gameOver, orch.user, orch.guestName, startMetricsTracking]);

  const handleDecadeSelect = (decade: Decade) => {
    setSelectedDecade(decade);
    resetDecadeGame(); resetMetrics(); resetTimer();
    setGameKey(prev => prev + 1);
  };

  const handleBackToSelection = () => {
    setSelectedDecade(null);
    resetDecadeGame(); resetMetrics(); resetTimer();
  };

  if (!selectedDecade) {
    return <DecadeSelectionPage onDecadeSelect={handleDecadeSelect} playerCounts={playerCounts} />;
  }

  const decadeInfo = getDecadeInfo(selectedDecade);

  return (
    <>
      <SEOManager title={`Quiz por Década - ${currentDifficulty.label} | Lendas do Flu`} description="Explore as diferentes eras do Fluminense! Quiz organizado por décadas." schema="Game" />

      <DebugInfo show={orch.showDebug} imageUrl={currentPlayer?.image_url} />

      {orch.difficultyChangeInfo && (
        <AdaptiveProgressionNotification changeInfo={orch.difficultyChangeInfo} onClose={orch.handleClearDifficultyNotification} />
      )}

      {orch.showGuestNameForm && (
        <CoachMark step="name-input" title="Qual seu Nome?" description="Informe seu nome para começar. Ele aparecerá no ranking se você pontuar!" position="bottom">
          <GuestNameForm onNameSubmitted={orch.handleGuestNameSubmit} onCancel={handleBackToSelection} />
        </CoachMark>
      )}

      <BaseGameContainer
        onBack={handleBackToSelection} backLabel="Décadas"
        title={decadeInfo.label} subtitle={decadeInfo.description}
        icon={decadeInfo.icon} iconColor={decadeInfo.color}
        isLoading={playersLoading}
        loadingMessage={`Carregando jogadores dos ${decadeInfo.label}...`}
        hasPlayers={availablePlayers.length > 0}
        emptyStateMessage={`Não há jogadores cadastrados para os ${decadeInfo.label}.`}
        emptyStateAction={<Button onClick={handleBackToSelection}>Escolher outra década</Button>}
        playerCount={availablePlayers.length}
        onReset={handleResetGame} showReset
      >
        <GameHeader score={score} onDebugClick={() => orch.setShowDebug(!orch.showDebug)} timeRemaining={timeRemaining} gameActive={!gameOver && isTimerRunning} currentStreak={currentStreak} maxTime={60} />

        {currentPlayer && (
          <div className="mt-6 space-y-6">
            <div className="flex justify-center">
              <div className="relative p-[3px] rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary shadow-[0_0_24px_hsl(var(--secondary)/0.2)]">
                <div className="relative rounded-[13px] overflow-hidden bg-card w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80">
                  <UnifiedPlayerImage key={`${currentPlayer.id}-${gameKey}`} player={currentPlayer} onImageLoaded={handleImageFixed} priority />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-3 w-full max-w-sm mx-auto">
              <GuessForm onSubmitGuess={handleGuess} disabled={isProcessingGuess || gameOver} isProcessing={isProcessingGuess} />
              <div className="flex justify-center">
                <SkipPlayerButton onSkip={orch.handleSkipPlayer} skipsUsed={orch.skipsUsed} maxSkips={orch.maxSkips} canSkip={orch.canSkip} skipPenalty={orch.skipPenalty} disabled={gameOver || isProcessingGuess || !isTimerRunning} />
              </div>
              {!gameOver && (
                <div className="flex justify-center">
                  <ImageFeedbackButton itemName={currentPlayer.name} itemType="player" imageUrl={currentPlayer.image_url} itemId={currentPlayer.id} onReportSent={handleResetGame} />
                </div>
              )}
            </div>
          </div>
        )}

        {orch.history.length > 0 && <GuessHistoryPanel history={orch.history} stats={orch.getStats()} compact className="mt-4" />}
        <KeyboardShortcutsHint shortcuts={orch.shortcuts} show={!orch.showGuestNameForm && currentPlayer !== null} className="mt-4" />
      </BaseGameContainer>

      <GameOverDialog open={gameOver} onClose={() => {}} playerName={currentPlayer?.name || ''} score={score} onResetScore={handleResetGame} isAuthenticated={!!orch.user} onSaveToRanking={saveToRanking} gameMode="classic" difficultyLevel={currentDifficulty.label} unlockedAchievementIds={orch.unlockedAchievementIds} />

      <AchievementNotification achievement={orch.currentNotification} onClose={orch.dismissNotification} />
    </>
  );
};

export default DecadeGameContainer;
