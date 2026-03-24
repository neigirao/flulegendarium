import React, { useCallback } from "react";
import type { DifficultyLevel } from "@/types/guess-game";
import { useAdaptiveGuessGame } from "@/hooks/game";
import { useGameOrchestration } from "@/hooks/game";
import { usePlayersData } from "@/hooks/data";
import { BaseGameContainer } from "./BaseGameContainer";
import { ImageFeedbackButton } from "@/components/image-feedback/ImageFeedbackButton";
import { GameHeader } from "./GameHeader";
import { AdaptiveDifficultyIndicator } from "./AdaptiveDifficultyIndicator";
import { AdaptivePlayerImage } from "./AdaptivePlayerImage";
import { GuessForm } from "./GuessForm";
import { SkipPlayerButton } from "./SkipPlayerButton";
import { GameOverDialog } from "./GameOverDialog";
import { GuestNameForm } from "./GuestNameForm";
import { AdaptiveProgressionNotification } from "./AdaptiveProgressionNotification";
import { DebugInfo } from "./DebugInfo";
import { ErrorDisplay } from "./ErrorDisplay";
import { GuessHistoryPanel } from "./GuessHistoryPanel";
import { KeyboardShortcutsHint } from "@/components/game/KeyboardShortcutsHint";
import { AchievementNotification } from "@/components/achievements/AchievementNotification";
import { SEOManager } from "@/components/seo/SEOManager";
import { clearAllImageCache } from "@/utils/player-image/cache";
import { prepareNextBatch } from "@/utils/player-image/preloadUtils";
import { CoachMark } from "@/components/onboarding";

const AdaptiveGameContainer = () => {
  const { players, isLoading, playersError } = usePlayersData();

  const {
    currentPlayer, gameKey, currentDifficulty, difficultyProgress,
    score, gameOver, timeRemaining,
    handleGuess: originalHandleGuess, selectRandomPlayer,
    handlePlayerImageFixed, isProcessingGuess,
    startGameForPlayer, isTimerRunning, resetScore,
    gamesPlayed, currentStreak, maxStreak,
    difficultyChangeInfo: adaptiveDiffChange, clearDifficultyChange,
    saveToRanking
  } = useAdaptiveGuessGame(players);

  const orch = useGameOrchestration({
    gameMode: 'adaptive',
    pagePath: '/quiz-adaptativo',
    currentItem: currentPlayer ? { id: currentPlayer.id, name: currentPlayer.name, image_url: currentPlayer.image_url } : null,
    gameOver, score, gamesPlayed, currentStreak,
    currentDifficulty, difficultyProgress,
    isTimerRunning, isProcessingGuess, timeRemaining,
    startGame: startGameForPlayer,
    resetGame: resetScore,
    selectNext: selectRandomPlayer,
    dataReady: !!(players && players.length > 0),
    clearImageCache: clearAllImageCache,
  });

  const handleGuess = orch.wrapGuess(originalHandleGuess);

  const handleImageLoaded = useCallback(() => {
    orch.handleImageLoaded();
    handlePlayerImageFixed();
    if (players && currentPlayer) {
      prepareNextBatch(players, currentPlayer, 2);
    }
  }, [orch, handlePlayerImageFixed, players, currentPlayer]);

  if (playersError) return <ErrorDisplay error={playersError} />;

  return (
    <>
      <SEOManager
        title={`Quiz Adaptativo - ${currentDifficulty.label} | Lendas do Flu`}
        description="Quiz inteligente que se adapta ao seu nível! Adivinhe jogadores lendários do Fluminense."
        schema="Game"
      />

      <BaseGameContainer
        title="Quiz Adaptativo"
        subtitle="Dificuldade automática baseada no seu desempenho"
        icon="🎯"
        isLoading={isLoading}
        loadingMessage="Carregando jogadores..."
        hasPlayers={!!(players && players.length > 0)}
        emptyStateMessage="Nenhum jogador encontrado para o quiz"
        playerCount={players?.length}
        showDebug={orch.showDebug}
        debugContent={orch.showDebug ? <DebugInfo show imageUrl={currentPlayer?.image_url} /> : null}
      >
        <GameHeader score={score} onDebugClick={() => orch.setShowDebug(!orch.showDebug)} timeRemaining={timeRemaining} gameActive={!gameOver && isTimerRunning} currentStreak={currentStreak} />

        {currentPlayer && (
          <div className="mt-4 space-y-4">
            {/* Image + vertical difficulty bar side by side */}
            <div className="flex justify-center items-start gap-3">
              <AdaptivePlayerImage key={`${gameKey}-${currentPlayer.id}`} player={currentPlayer} onImageFixed={handleImageLoaded} difficulty={currentDifficulty.level as DifficultyLevel} />
              <AdaptiveDifficultyIndicator currentDifficulty={currentDifficulty.level as DifficultyLevel} progress={difficultyProgress} vertical />
            </div>

            {/* Form controls below image */}
            <div className="flex flex-col items-center space-y-3 w-full max-w-sm mx-auto">
              <GuessForm onSubmitGuess={handleGuess} disabled={gameOver || isProcessingGuess} isProcessing={isProcessingGuess} />
              <div className="flex justify-center">
                <SkipPlayerButton onSkip={orch.handleSkipPlayer} skipsUsed={orch.skipsUsed} maxSkips={orch.maxSkips} canSkip={orch.canSkip} skipPenalty={orch.skipPenalty} disabled={gameOver || isProcessingGuess || !isTimerRunning} />
              </div>
              {!gameOver && (
                <div className="flex justify-center">
                  <ImageFeedbackButton itemName={currentPlayer.name} itemType="player" imageUrl={currentPlayer.image_url} itemId={currentPlayer.id} onReportSent={() => resetScore()} />
                </div>
              )}
            </div>
          </div>
        )}

        {orch.history.length > 0 && <GuessHistoryPanel history={orch.history} stats={orch.getStats()} compact className="mt-4" />}
        <KeyboardShortcutsHint shortcuts={orch.shortcuts} show={!orch.showGuestNameForm && currentPlayer !== null} className="mt-4" />
      </BaseGameContainer>

      <GameOverDialog open={gameOver} onClose={() => {}} playerName={currentPlayer?.name || ''} score={score} onResetScore={resetScore} isAuthenticated={!!orch.user} onSaveToRanking={saveToRanking} gameMode="adaptive" difficultyLevel={currentDifficulty.label} unlockedAchievementIds={orch.unlockedAchievementIds} />

      {orch.showGuestNameForm && (
        <CoachMark step="name-input" title="Qual seu Nome?" description="Informe seu nome para começar. Ele aparecerá no ranking se você pontuar!" position="bottom">
          <GuestNameForm onNameSubmitted={orch.handleGuestNameSubmit} onCancel={orch.onGuestCancel} />
        </CoachMark>
      )}

      {(adaptiveDiffChange || orch.difficultyChangeInfo) && (
        <AdaptiveProgressionNotification
          changeInfo={{
            direction: 'up',
            newLevel: (adaptiveDiffChange?.newLevel || orch.difficultyChangeInfo?.newLevel) as DifficultyLevel,
            oldLevel: (adaptiveDiffChange?.oldLevel || orch.difficultyChangeInfo?.oldLevel) as DifficultyLevel,
            reason: (adaptiveDiffChange?.reason || orch.difficultyChangeInfo?.reason) || '',
          }}
          onClose={adaptiveDiffChange ? clearDifficultyChange : orch.handleClearDifficultyNotification}
        />
      )}

      <AchievementNotification achievement={orch.currentNotification} onClose={orch.dismissNotification} />
    </>
  );
};

export default AdaptiveGameContainer;
