import React, { useCallback, useState, useEffect } from "react";
import { useJerseyGuessGame } from "@/hooks/use-jersey-guess-game";
import { useJerseysData } from "@/hooks/use-jerseys-data";
import { useGameOrchestration } from "@/hooks/game/use-game-orchestration";
import { BaseGameContainer } from "@/components/guess-game/BaseGameContainer";
import { GameOverDialog } from "@/components/guess-game/GameOverDialog";
import { GuestNameForm } from "@/components/guess-game/GuestNameForm";
import { ErrorDisplay } from "@/components/guess-game/ErrorDisplay";
import { GuessHistoryPanel } from "@/components/guess-game/GuessHistoryPanel";
import { AdaptiveProgressionNotification } from "@/components/guess-game/AdaptiveProgressionNotification";
import { DebugInfo } from "@/components/guess-game/DebugInfo";
import { JerseyImage } from "./JerseyImage";
import { ImageFeedbackButton } from "@/components/image-feedback/ImageFeedbackButton";
import { JerseyYearOptions } from "./JerseyYearOptions";
import { JerseyHudBar } from "./JerseyHudBar";
import { JerseyEducationalReveal } from "./JerseyEducationalReveal";
import { KeyboardShortcutsHint } from "@/components/game/KeyboardShortcutsHint";
import { AchievementNotification } from "@/components/achievements/AchievementNotification";
import { SEOManager } from "@/components/seo/SEOManager";
import { clearJerseyImageCache, prepareNextJerseyBatch } from "@/utils/jersey-image/preloadUtils";
import type { DifficultyLevel } from "@/types/guess-game";
import { cn } from "@/lib/utils";

const JerseyGameContainer = () => {
  const { jerseys, isLoading, jerseysError } = useJerseysData();

  const {
    currentJersey, gameKey, currentDifficulty, difficultyProgress,
    score, gameOver, timeRemaining,
    handleOptionSelect, isProcessingGuess,
    startGameForJersey, isTimerRunning,
    resetGame, gamesPlayed, currentStreak,
    saveToRanking,
    currentOptions, selectedOption, showResult,
  } = useJerseyGuessGame(jerseys || []);

  // Pending selection before user clicks "Confirmar"
  const [pendingYear, setPendingYear] = useState<number | null>(null);

  // Reset pending selection when jersey changes
  useEffect(() => {
    setPendingYear(null);
  }, [gameKey]);

  const handleKeyboardOptionSelect = useCallback((index: number) => {
    if (currentOptions?.[index]) {
      // Keyboard shortcuts immediately confirm
      const wrappedGuess = (g: string) => handleOptionSelect(Number(g));
      wrappedGuess(String(currentOptions[index].year));
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

  const handleConfirm = useCallback(() => {
    if (!pendingYear) return;
    const wrappedGuess = orch.wrapGuess((g: string) => handleOptionSelect(Number(g)));
    wrappedGuess(String(pendingYear));
  }, [pendingYear, orch, handleOptionSelect]);

  const handleNextJersey = useCallback(() => {
    setPendingYear(null);
    startGameForJersey();
  }, [startGameForJersey]);

  const handleImageLoaded = useCallback(() => {
    orch.handleImageLoaded();
    if (jerseys?.length && currentJersey) {
      prepareNextJerseyBatch(jerseys, currentJersey, 2);
    }
  }, [orch, jerseys, currentJersey]);

  const handleSaveToRanking = useCallback(async (playerName: string) => {
    await saveToRanking(playerName);
  }, [saveToRanking]);

  if (jerseysError) return <ErrorDisplay error={jerseysError} />;

  const isCorrect = showResult && selectedOption !== null &&
    currentOptions.find(o => o.year === selectedOption)?.isCorrect === true;
  const feedbackState = showResult ? (isCorrect ? 'correct' : 'wrong') : 'idle';
  const correctYear = currentJersey?.years[0] ?? 0;
  const lastPointsEarned = isCorrect ? currentDifficulty.multiplier * 10 : 0;

  return (
    <>
      <SEOManager
        title={`Quiz das Camisas - ${currentDifficulty.label} | Lendas do Flu`}
        description="Veja a camisa histórica do Fluminense e escolha o ano correto!"
        schema="Game"
      />
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
        {/* HUD bar */}
        <JerseyHudBar
          score={score}
          timeRemaining={timeRemaining}
          isRunning={!gameOver && isTimerRunning}
          gameOver={gameOver}
          jerseyNumber={gamesPlayed + 1}
          maxTime={30}
        />

        {currentJersey && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-9 items-start">

            {/* LEFT — Jersey frame */}
            <JerseyImage
              key={`${gameKey}-${currentJersey.id}`}
              jersey={currentJersey}
              onImageLoaded={handleImageLoaded}
              difficulty={currentDifficulty.level as DifficultyLevel}
              feedbackState={feedbackState}
            />

            {/* RIGHT — Cards side */}
            <div className="flex flex-col gap-4">
              {/* Heading */}
              <div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold mb-1">
                  {showResult ? 'Resultado' : 'Pergunta'}
                </div>
                <div className="font-display text-[28px] leading-tight text-foreground">
                  {showResult
                    ? (isCorrect ? 'Acertou!' : 'Quase lá!')
                    : 'De qual era é essa camisa?'}
                </div>
              </div>

              {/* Tip */}
              {!showResult && (
                <div className="flex items-center gap-2 bg-secondary/6 border border-dashed border-secondary/30 rounded-xl px-4 py-2.5 text-xs text-secondary font-medium">
                  💡 <strong>Dica:</strong> escolha a era que faz mais sentido para a história
                </div>
              )}

              {/* Era option cards */}
              {currentOptions.length > 0 && (
                <JerseyYearOptions
                  options={currentOptions}
                  onPendingSelect={setPendingYear}
                  pendingYear={pendingYear}
                  disabled={gameOver || !isTimerRunning}
                  isProcessing={isProcessingGuess}
                  selectedYear={selectedOption}
                  showResult={showResult}
                />
              )}

              {/* Educational reveal */}
              {showResult && (
                <JerseyEducationalReveal
                  isCorrect={isCorrect}
                  correctYear={correctYear}
                  pointsEarned={lastPointsEarned}
                  funFact={currentJersey.fun_fact}
                />
              )}

              {/* Actions */}
              <div className="flex gap-2.5 mt-1">
                {!showResult ? (
                  <>
                    <button
                      disabled={!pendingYear || isProcessingGuess}
                      onClick={handleConfirm}
                      className={cn(
                        "flex-1 rounded-xl font-display text-[18px] tracking-wide py-3.5 transition-all duration-150",
                        pendingYear && !isProcessingGuess
                          ? "bg-primary text-white shadow-[0_6px_18px_rgba(122,2,19,0.3)] hover:-translate-y-px hover:shadow-[0_8px_22px_rgba(122,2,19,0.35)]"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      {pendingYear ? `CONFIRMAR ${pendingYear}` : 'ESCOLHA UMA ERA'}
                    </button>
                    <button
                      onClick={orch.handleSkipPlayer}
                      disabled={gameOver || isProcessingGuess || !isTimerRunning || !orch.canSkip}
                      className="rounded-xl border border-border text-muted-foreground text-sm font-medium px-4 py-3.5 transition-colors hover:border-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ⏭ Pular
                    </button>
                  </>
                ) : !gameOver ? (
                  <button
                    onClick={handleNextJersey}
                    className="flex-1 rounded-xl font-display text-[18px] tracking-wide py-3.5 bg-secondary text-white shadow-[0_6px_18px_rgba(0,97,64,0.3)] hover:-translate-y-px transition-all duration-150"
                  >
                    PRÓXIMA CAMISA →
                  </button>
                ) : null}
              </div>

              {/* Report button */}
              {!gameOver && (
                <div className="flex justify-start">
                  <ImageFeedbackButton
                    itemName={`Camisa ${currentJersey.years.join('/')}`}
                    itemType="jersey"
                    imageUrl={currentJersey.image_url}
                    itemId={currentJersey.id}
                    onReportSent={() => resetGame()}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {orch.history.length > 0 && (
          <div className="mt-8">
            <GuessHistoryPanel history={orch.history} stats={orch.getStats()} compact />
          </div>
        )}
        <KeyboardShortcutsHint shortcuts={orch.shortcuts} show={!orch.showGuestNameForm && currentJersey !== null} />
      </BaseGameContainer>

      <GameOverDialog
        open={gameOver}
        onClose={() => {}}
        playerName={currentJersey ? `Camisa de ${currentJersey.years.join('/')}` : ''}
        score={score}
        onResetScore={resetGame}
        isAuthenticated={!!orch.user}
        onSaveToRanking={handleSaveToRanking}
        gameMode="adaptive"
        difficultyLevel={currentDifficulty.label}
        unlockedAchievementIds={orch.unlockedAchievementIds}
        rankingPlayerName={orch.guestName}
      />

      {orch.showGuestNameForm && (
        <GuestNameForm onNameSubmitted={orch.handleGuestNameSubmit} onCancel={orch.onGuestCancel} />
      )}

      <AchievementNotification achievement={orch.currentNotification} onClose={orch.dismissNotification} />
    </>
  );
};

export default JerseyGameContainer;
