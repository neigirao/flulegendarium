import React, { useCallback, useState, useRef, useEffect } from "react";
import type { DifficultyLevel } from "@/types/guess-game";
import { useAdaptiveGuessGame } from "@/hooks/game";
import { useGameOrchestration } from "@/hooks/game/use-game-orchestration";
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
import { QuizFeedbackZone, type FeedbackState } from "./QuizFeedbackZone";
import { ProgressDots } from "./ProgressDots";
import { GameTimer } from "./GameTimer";
import { clearAllImageCache } from "@/utils/player-image/cache";
import { prepareNextBatch } from "@/utils/player-image/preloadUtils";

const AdaptiveGameContainer = () => {
  const { players, isLoading, playersError } = usePlayersData();

  const {
    currentPlayer, gameKey, currentDifficulty, difficultyProgress,
    score, gameOver, timeRemaining,
    handleGuess: originalHandleGuess, handleSkipPlayer: gameHandleSkip,
    handlePlayerImageFixed, isProcessingGuess,
    startGameForPlayer, isTimerRunning, resetScore,
    gamesPlayed, currentStreak,
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
    selectNext: gameHandleSkip,
    dataReady: !!(players && players.length > 0),
    clearImageCache: clearAllImageCache,
  });

  const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
  const [lastPoints, setLastPoints] = useState(0);
  const [lastPlayerName, setLastPlayerName] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const prevScoreRef = useRef(score);
  const pendingWrongCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pendingWrongCheckRef.current) clearTimeout(pendingWrongCheckRef.current);
    };
  }, []);

  const handleFeedbackIdle = useCallback(() => setFeedbackState('idle'), []);

  useEffect(() => {
    if (score !== prevScoreRef.current) {
      const delta = score - prevScoreRef.current;
      prevScoreRef.current = score;
      if (delta > 0) {
        if (pendingWrongCheckRef.current) {
          clearTimeout(pendingWrongCheckRef.current);
          pendingWrongCheckRef.current = null;
        }
        setFeedbackState('correct');
        setLastPoints(delta);
        setLastPlayerName(currentPlayer?.name ?? '');
        setCorrectCount(c => c + 1);
      }
    }
  }, [score, currentPlayer]);

  const handleGuess = orch.wrapGuess((guess: string) => {
    const scoreBefore = prevScoreRef.current;
    originalHandleGuess(guess);
    // After a short delay, if score didn't change, it was wrong
    pendingWrongCheckRef.current = setTimeout(() => {
      if (prevScoreRef.current === scoreBefore && !gameOver) {
        setFeedbackState('wrong');
        setWrongCount(c => c + 1);
      }
      pendingWrongCheckRef.current = null;
    }, 300);
  });

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
        title={`Advinhe o Jogador - ${currentDifficulty.label} | Lendas do Flu`}
        description="Quiz inteligente que se adapta ao seu nível! Adivinhe jogadores lendários do Fluminense."
        schema="Game"
      />

      <BaseGameContainer
        title="Advinhe o Jogador"
        isLoading={isLoading}
        loadingMessage="Carregando jogadores..."
        hasPlayers={!!(players && players.length > 0)}
        emptyStateMessage="Nenhum jogador encontrado para o quiz"
        playerCount={players?.length}
        showDebug={orch.showDebug}
        debugContent={orch.showDebug ? <DebugInfo show imageUrl={currentPlayer?.image_url} /> : null}
      >
        {currentPlayer && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-6 md:gap-8 items-start">
            <div className="flex flex-col items-center gap-4">
              <AdaptivePlayerImage
                key={`${gameKey}-${currentPlayer.id}`}
                player={currentPlayer}
                onImageFixed={handleImageLoaded}
                difficulty={currentDifficulty.level as DifficultyLevel}
                feedbackState={feedbackState}
              />
              <ProgressDots total={10} correct={correctCount} wrong={wrongCount} />
            </div>

            <div className="flex flex-col gap-4">
              <GameHeader
                score={score}
                currentStreak={currentStreak}
                onDebugClick={() => orch.setShowDebug(!orch.showDebug)}
              />

              <div className="flex justify-center">
                <GameTimer
                  timeRemaining={timeRemaining}
                  isRunning={!gameOver && isTimerRunning}
                  gameOver={gameOver}
                />
              </div>

              <AdaptiveDifficultyIndicator
                currentDifficulty={currentDifficulty.level as DifficultyLevel}
                progress={difficultyProgress}
                variant="horizontal-4"
              />

              <QuizFeedbackZone
                state={feedbackState}
                playerName={lastPlayerName}
                points={lastPoints}
                onIdle={handleFeedbackIdle}
              />

              <GuessForm
                onSubmitGuess={handleGuess}
                disabled={gameOver || isProcessingGuess}
                isProcessing={isProcessingGuess}
              />

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <SkipPlayerButton
                    onSkip={orch.handleSkipPlayer}
                    skipsUsed={orch.skipsUsed}
                    maxSkips={orch.maxSkips}
                    canSkip={orch.canSkip}
                    skipPenalty={orch.skipPenalty}
                    disabled={gameOver || isProcessingGuess || !isTimerRunning}
                  />
                </div>
                {!gameOver && (
                  <ImageFeedbackButton
                    itemName={currentPlayer.name}
                    itemType="player"
                    imageUrl={currentPlayer.image_url}
                    itemId={currentPlayer.id}
                    onReportSent={() => resetScore()}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {orch.history.length > 0 && (
          <div className="mt-6">
            <GuessHistoryPanel history={orch.history} stats={orch.getStats()} compact />
          </div>
        )}
        <KeyboardShortcutsHint shortcuts={orch.shortcuts} show={!orch.showGuestNameForm && currentPlayer !== null} />
      </BaseGameContainer>

      <GameOverDialog
        open={gameOver}
        onClose={() => {}}
        playerName={currentPlayer?.name || ''}
        score={score}
        onResetScore={resetScore}
        isAuthenticated={!!orch.user}
        onSaveToRanking={saveToRanking}
        gameMode="adaptive"
        difficultyLevel={currentDifficulty.label}
        unlockedAchievementIds={orch.unlockedAchievementIds}
        rankingPlayerName={orch.guestName}
        guessHistory={orch.history.map(h => h.isCorrect ? 'correct' : 'wrong')}
      />

      {orch.showGuestNameForm && (
        <GuestNameForm onNameSubmitted={orch.handleGuestNameSubmit} onCancel={orch.onGuestCancel} />
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
