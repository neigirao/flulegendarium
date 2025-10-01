
import React, { useState, useEffect } from "react";
import { useAdaptiveGuessGame } from "@/hooks/use-adaptive-guess-game";
import { usePlayersData } from "@/hooks/use-players-data";
import { useAuth } from "@/hooks/useAuth";
import { BaseGameContainer } from "./BaseGameContainer";
import { GameHeader } from "./GameHeader";
import { AdaptiveDifficultyIndicator } from "./AdaptiveDifficultyIndicator";
import { AdaptivePlayerImage } from "./AdaptivePlayerImage";
import { GuessForm } from "./GuessForm";
import { GameOverDialog } from "./GameOverDialog";
import { GuestNameForm } from "./GuestNameForm";
import { AdaptiveProgressionNotification } from "./AdaptiveProgressionNotification";
import { DebugInfo } from "./DebugInfo";
import { ErrorDisplay } from "./ErrorDisplay";
import { useAchievementSystem } from "@/components/achievements/AchievementSystemProvider";
import { useEnhancedAnalytics } from "@/hooks/use-enhanced-analytics";
import { DynamicSEO } from "@/components/seo/DynamicSEO";
import { useMobileOptimization } from "@/hooks/use-mobile-optimization";
import { useUX } from "@/components/ux/UXProvider";

const AdaptiveGameContainer = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [guestName, setGuestName] = useState<string>("");
  const [showGuestNameForm, setShowGuestNameForm] = useState(false);
  
  const { user } = useAuth();
  const { players, isLoading, playersError } = usePlayersData();
  
  // Achievement hooks
  const { checkProgressAchievements } = useAchievementSystem();
  const analytics = useEnhancedAnalytics();
  const { viewportInfo, getTouchTargetSize } = useMobileOptimization();
  const { showContextualFeedback } = useUX();
  
  const {
    currentPlayer,
    gameKey,
    currentDifficulty,
    difficultyProgress,
    attempts,
    score,
    gameOver,
    timeRemaining,
    handleGuess,
    selectRandomPlayer,
    forceRefresh,
    handlePlayerImageFixed,
    isProcessingGuess,
    hasLost,
    startGameForPlayer,
    isTimerRunning,
    resetScore,
    gamesPlayed,
    currentStreak,
    maxStreak,
    difficultyChangeInfo,
    clearDifficultyChange,
    saveToRanking
  } = useAdaptiveGuessGame(players);

  useEffect(() => {
    // Se não estiver autenticado e não tiver nome de convidado, mostrar formulário
    if (!user && !guestName && !showGuestNameForm && players && players.length > 0) {
      setShowGuestNameForm(true);
    }
    
    // Track page view
    analytics.trackPageView('/quiz-adaptativo');
    analytics.trackUserEngagement('page_view', 'adaptive_game');
  }, [analytics, user, guestName, showGuestNameForm, players]);

  const handleGuestNameSubmit = (name: string) => {
    setGuestName(name);
    setShowGuestNameForm(false);
    // O timer só vai começar quando a imagem for carregada (handlePlayerImageFixed)
  };

  if (playersError) {
    return <ErrorDisplay error={playersError} />;
  }

  const debugContent = showDebug ? (
    <DebugInfo
      show={true}
      imageUrl={currentPlayer?.image_url}
    />
  ) : null;

  return (
    <>
      <DynamicSEO 
        gameMode="adaptive"
        difficulty={currentDifficulty.label}
        player={currentPlayer}
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
        showDebug={showDebug}
        debugContent={debugContent}
      >
        <GameHeader 
          score={score} 
          onDebugClick={() => setShowDebug(!showDebug)}
          isAdaptiveMode={true}
          timeRemaining={timeRemaining}
          gameActive={!gameOver && isTimerRunning}
        />
        
        <div className="mt-6 space-y-6">
          <AdaptiveDifficultyIndicator 
            currentDifficulty={currentDifficulty.level as any}
            progress={difficultyProgress}
          />

          {currentPlayer && (
            <div className="relative">
              <AdaptivePlayerImage
                key={`${gameKey}-${currentPlayer.id}`}
                player={currentPlayer}
                onImageFixed={handlePlayerImageFixed}
                difficulty={currentDifficulty.level as any}
              />
              
              <GuessForm
                onSubmitGuess={handleGuess}
                disabled={gameOver || isProcessingGuess}
                isProcessing={isProcessingGuess}
              />
            </div>
          )}
        </div>
      </BaseGameContainer>

      <GameOverDialog
        open={gameOver}
        onClose={() => {}}
        playerName={currentPlayer?.name || ''}
        score={score}
        onResetScore={resetScore}
        isAuthenticated={!!user}
        onSaveToRanking={saveToRanking}
        gameMode="adaptive"
        difficultyLevel={currentDifficulty.label}
      />

      {showGuestNameForm && (
        <GuestNameForm
          onNameSubmitted={handleGuestNameSubmit}
          onCancel={() => window.history.back()}
        />
      )}

      {difficultyChangeInfo && (
        <AdaptiveProgressionNotification
          changeInfo={{
            direction: 'up',
            newLevel: difficultyChangeInfo.newLevel as any,
            oldLevel: difficultyChangeInfo.oldLevel as any,
            reason: difficultyChangeInfo.reason
          }}
          onClose={clearDifficultyChange}
        />
      )}
    </>
  );
};

export default AdaptiveGameContainer;
