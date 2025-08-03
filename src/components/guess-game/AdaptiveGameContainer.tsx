
import React, { useState, useEffect } from "react";
import { useAdaptiveGuessGame } from "@/hooks/use-adaptive-guess-game";
import { usePlayersData } from "@/hooks/use-players-data";
import { useAuth } from "@/hooks/useAuth";
import { GameHeader } from "./GameHeader";

import { AdaptiveDifficultyIndicator } from "./AdaptiveDifficultyIndicator";
import { AdaptivePlayerImage } from "./AdaptivePlayerImage";
import { GuessForm } from "./GuessForm";
import { GameOverDialog } from "./GameOverDialog";
import { AdaptiveTutorial } from "./AdaptiveTutorial";
import { AdaptiveProgressionNotification } from "./AdaptiveProgressionNotification";
import { DebugInfo } from "./DebugInfo";
import { EmptyPlayersDisplay } from "./EmptyPlayersDisplay";
import { ErrorDisplay } from "./ErrorDisplay";
import { useAchievementSystem } from "@/components/achievements/AchievementSystemProvider";
import { useEnhancedAnalytics } from "@/hooks/use-enhanced-analytics";
import { DynamicSEO } from "@/components/seo/DynamicSEO";
import { useMobileOptimization } from "@/hooks/use-mobile-optimization";
import { useUX } from "@/components/ux/UXProvider";
import { ResponsiveContainer } from "@/components/ux/ResponsiveContainer";
import { LoadingState } from "@/components/ux/LoadingStates";

const AdaptiveGameContainer = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
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
    const hasSeenTutorial = localStorage.getItem('adaptive-tutorial-seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
    
    // Track page view
    analytics.trackPageView('/quiz-adaptativo');
    analytics.trackUserEngagement('page_view', 'adaptive_game');
  }, [analytics]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem('adaptive-tutorial-seen', 'true');
    analytics.trackUserEngagement('tutorial_completed', 'adaptive_game');
  };

  if (isLoading) {
    return (
      <ResponsiveContainer variant="game" className="min-h-screen flex items-center justify-center">
        <LoadingState 
          type="general" 
          message="Carregando jogadores..." 
        />
      </ResponsiveContainer>
    );
  }

  if (playersError) {
    return <ErrorDisplay error={playersError} />;
  }

  if (!players || players.length === 0) {
    return <EmptyPlayersDisplay />;
  }

  return (
    <>
      <DynamicSEO 
        gameMode="adaptive"
        difficulty={currentDifficulty.label}
        player={currentPlayer}
      />
      
      <ResponsiveContainer variant="game" maxWidth="xl" className={viewportInfo.isMobile ? 'px-2' : ''}>
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

          {showDebug && (
            <DebugInfo
              show={true}
              imageUrl={currentPlayer?.image_url}
            />
          )}
        </div>

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

        <AdaptiveTutorial 
          isOpen={showTutorial}
          onComplete={handleTutorialComplete}
        />

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
      </ResponsiveContainer>
      
    </>
  );
};

export default AdaptiveGameContainer;
