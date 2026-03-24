import React, { useCallback } from "react";
import { useJerseyGuessGame } from "@/hooks/use-jersey-guess-game";
import { useJerseysData } from "@/hooks/use-jerseys-data";
import { useGameOrchestration } from "@/hooks/game";
import { BaseGameContainer } from "@/components/guess-game/BaseGameContainer";
import { GameHeader } from "@/components/guess-game/GameHeader";
import { GameOverDialog } from "@/components/guess-game/GameOverDialog";
import { GuestNameForm } from "@/components/guess-game/GuestNameForm";
import { ErrorDisplay } from "@/components/guess-game/ErrorDisplay";
import { GuessHistoryPanel } from "@/components/guess-game/GuessHistoryPanel";
import { SkipPlayerButton } from "@/components/guess-game/SkipPlayerButton";
import { AdaptiveDifficultyIndicator } from "@/components/guess-game/AdaptiveDifficultyIndicator";
import { AdaptiveProgressionNotification } from "@/components/guess-game/AdaptiveProgressionNotification";
import { DebugInfo } from "@/components/guess-game/DebugInfo";
import { JerseyImage } from "./JerseyImage";
import { ImageFeedbackButton } from "@/components/image-feedback/ImageFeedbackButton";
import { JerseyYearOptions } from "./JerseyYearOptions";
import { KeyboardShortcutsHint } from "@/components/game/KeyboardShortcutsHint";
import { AchievementNotification } from "@/components/achievements/AchievementNotification";
import { SEOManager } from "@/components/seo/SEOManager";
import { clearJerseyImageCache, prepareNextJerseyBatch } from "@/utils/jersey-image/preloadUtils";
import { CoachMark } from "@/components/onboarding";
import type { DifficultyLevel } from "@/types/guess-game";

const JerseyGameContainer = () => {
  const { jerseys, isLoading, jerseysError } = useJerseysData();

  const {
    currentJersey, gameKey, currentDifficulty, difficultyProgress,
    score, gameOver, timeRemaining,
    handleOptionSelect, isProcessingGuess,
    startGameForJersey, isTimerRunning,
    resetGame, gamesPlayed, currentStreak, maxStreak,
    saveToRanking, guessHistory,
    currentOptions, selectedOption, showResult,
  } = useJerseyGuessGame(jerseys || []);

  // Keyboard option handler (needs to be defined before orch)
  const handleKeyboardOptionSelect = useCallback((index: number) => {
    if (currentOptions && currentOptions[index]) {
      handleOptionSelect(currentOptions[index].year);
    }
  }, [currentOptions, handleOptionSelect]);

  const orch = useGameOrchestration({
    gameMode: 'jersey',
    pagePath: '/quiz-camisas',
    currentItem: currentJersey ? { id: currentJersey.id, name: `Camisa ${currentJersey.years.join('/')}`, image_url: currentJersey.image_url } : null,
    gameOver, score, gamesPlayed, currentStreak,
    currentDifficulty, difficultyProgress,
    isTimerRunning, isProcessingGuess, timeRemaining,
    startGame: startGameForJersey,
    resetGame,
    selectNext: startGameForJersey,
    dataReady: !!(jerseys && jerseys.length > 0),
    clearImageCache: clearJerseyImageCache,
    keyboardOptions: {
      onSelectOption: handleKeyboardOptionSelect,
      maxOptions: currentOptions?.length || 3,
      extraDisabled: showResult,
    },
  });

  const handleSelectOption = useCallback((year: number) => {
    const wrappedGuess = orch.wrapGuess((g: string) => handleOptionSelect(Number(g)));
    wrappedGuess(String(year));
  }, [orch, handleOptionSelect]);

  const handleImageLoaded = useCallback(() => {
    orch.handleImageLoaded();
    if (jerseys && jerseys.length > 0 && currentJersey) {
      prepareNextJerseyBatch(jerseys, currentJersey, 2);
    }
  }, [orch, jerseys, currentJersey]);

  const handleSaveToRanking = useCallback(async (playerName: string) => {
    await saveToRanking(playerName);
  }, [saveToRanking]);

  if (jerseysError) return <ErrorDisplay error={jerseysError} />;

  const correctYear = currentJersey?.years[0];

  return (
    <>
      <SEOManager title={`Quiz das Camisas - ${currentDifficulty.label} | Lendas do Flu`} description="Veja a camisa histórica do Fluminense e escolha o ano correto!" schema="Game" />

      <DebugInfo show={orch.showDebug} imageUrl={currentJersey?.image_url} />

      {orch.difficultyChangeInfo && (
        <AdaptiveProgressionNotification changeInfo={orch.difficultyChangeInfo} onClose={orch.handleClearDifficultyNotification} />
      )}

      <BaseGameContainer
        title="Quiz das Camisas"
        subtitle="Adivinhe o ano das camisas históricas do Fluminense"
        icon="👕"
        isLoading={isLoading}
        loadingMessage="Carregando camisas..."
        hasPlayers={!!(jerseys && jerseys.length > 0)}
        emptyStateMessage="Nenhuma camisa encontrada para o quiz"
        playerCount={jerseys?.length}
      >
        <CoachMark step="timer-explanation" title="Fique de Olho no Tempo!" description="Você tem tempo limitado para escolher. Respostas rápidas valem mais pontos!" position="bottom">
          <GameHeader score={score} onDebugClick={() => orch.setShowDebug(!orch.showDebug)} timeRemaining={timeRemaining} gameActive={!gameOver && isTimerRunning} currentStreak={currentStreak} />
        </CoachMark>

        <div className="mt-6 space-y-6">
          <AdaptiveDifficultyIndicator currentDifficulty={currentDifficulty.level as DifficultyLevel} progress={difficultyProgress} />

          {currentJersey && (
            <div className="relative space-y-6">
              <JerseyImage key={`${gameKey}-${currentJersey.id}`} jersey={currentJersey} onImageLoaded={handleImageLoaded} difficulty={currentDifficulty.level as DifficultyLevel} />

              <CoachMark step="first-guess" title="Escolha o Ano!" description="Selecione uma das opções abaixo. Cada camisa foi usada em um ano específico!" position="top">
                <div className="flex flex-col items-center space-y-3 w-full">
                  {currentOptions.length > 0 && !gameOver && (
                    <JerseyYearOptions
                      options={currentOptions}
                      onSelectOption={handleSelectOption}
                      disabled={gameOver || !isTimerRunning}
                      isProcessing={isProcessingGuess}
                      selectedYear={selectedOption}
                      showResult={showResult}
                      correctYear={correctYear}
                    />
                  )}

                  <div className="flex justify-center pt-2">
                    <SkipPlayerButton onSkip={orch.handleSkipPlayer} skipsUsed={orch.skipsUsed} maxSkips={orch.maxSkips} canSkip={orch.canSkip} skipPenalty={orch.skipPenalty} disabled={gameOver || isProcessingGuess || !isTimerRunning || showResult} />
                  </div>

                  {!gameOver && (
                    <div className="flex justify-center">
                      <ImageFeedbackButton itemName={`Camisa ${currentJersey.years.join('/')}`} itemType="jersey" imageUrl={currentJersey.image_url} itemId={currentJersey.id} onReportSent={() => resetGame()} />
                    </div>
                  )}
                </div>
              </CoachMark>
            </div>
          )}

          {orch.history.length > 0 && <GuessHistoryPanel history={orch.history} stats={orch.getStats()} compact className="mt-4" />}
          <KeyboardShortcutsHint shortcuts={orch.shortcuts} show={!orch.showGuestNameForm && currentJersey !== null} className="mt-4" />
        </div>
      </BaseGameContainer>

      <GameOverDialog open={gameOver} onClose={() => {}} playerName={currentJersey ? `Camisa de ${currentJersey.years.join('/')}` : ''} score={score} onResetScore={resetGame} isAuthenticated={!!orch.user} onSaveToRanking={handleSaveToRanking} gameMode="adaptive" difficultyLevel={currentDifficulty.label} unlockedAchievementIds={orch.unlockedAchievementIds} />

      {orch.showGuestNameForm && (
        <CoachMark step="name-input" title="Qual seu Nome?" description="Informe seu nome para começar. Ele aparecerá no ranking se você pontuar!" position="bottom">
          <GuestNameForm onNameSubmitted={orch.handleGuestNameSubmit} onCancel={orch.onGuestCancel} />
        </CoachMark>
      )}

      <AchievementNotification achievement={orch.currentNotification} onClose={orch.dismissNotification} />
    </>
  );
};

export default JerseyGameContainer;
