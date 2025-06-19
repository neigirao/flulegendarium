
import React, { useState, useEffect } from "react";
import { useAdaptiveGuessGame } from "@/hooks/use-adaptive-guess-game";
import { usePlayersData } from "@/hooks/use-players-data";
import { GameHeader } from "./GameHeader";
import { AdaptiveGameStatus } from "./AdaptiveGameStatus";
import { AdaptiveDifficultyIndicator } from "./AdaptiveDifficultyIndicator";
import { AdaptivePlayerImage } from "./AdaptivePlayerImage";
import { GuessForm } from "./GuessForm";
import { GameOverDialog } from "./GameOverDialog";
import { AdaptiveTutorial } from "./AdaptiveTutorial";
import { AdaptiveProgressionNotification } from "./AdaptiveProgressionNotification";
import { DebugInfo } from "./DebugInfo";
import { EmptyPlayersDisplay } from "./EmptyPlayersDisplay";
import { ErrorDisplay } from "./ErrorDisplay";

const AdaptiveGameContainer = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const { players, isLoading, playersError } = usePlayersData();
  
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
    clearDifficultyChange
  } = useAdaptiveGuessGame(players);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('adaptive-tutorial-seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem('adaptive-tutorial-seen', 'true');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
          <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin"></div>
          <p className="text-flu-grena font-semibold">Carregando jogadores...</p>
        </div>
      </div>
    );
  }

  if (playersError) {
    return <ErrorDisplay error={playersError} />;
  }

  if (!players || players.length === 0) {
    return <EmptyPlayersDisplay />;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <GameHeader 
        score={score} 
        onDebugClick={() => setShowDebug(!showDebug)}
      />
      
      <div className="mt-6 space-y-6">
        <AdaptiveDifficultyIndicator 
          currentDifficulty={currentDifficulty}
          progress={difficultyProgress}
        />
        
        <AdaptiveGameStatus
          timeRemaining={timeRemaining}
          currentStreak={currentStreak}
          gamesPlayed={gamesPlayed}
          maxStreak={maxStreak}
          attempts={attempts}
          gameActive={!gameOver && isTimerRunning}
        />

        {currentPlayer && (
          <div className="relative">
            <AdaptivePlayerImage
              key={`${gameKey}-${currentPlayer.id}`}
              player={currentPlayer}
              onImageFixed={handlePlayerImageFixed}
              difficulty={currentDifficulty}
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
        score={score}
        hasLost={hasLost}
        currentPlayer={currentPlayer}
        onPlayAgain={selectRandomPlayer}
        onResetScore={resetScore}
        maxStreak={maxStreak}
        gamesPlayed={gamesPlayed}
      />

      <AdaptiveTutorial 
        isOpen={showTutorial}
        onComplete={handleTutorialComplete}
      />

      {difficultyChangeInfo && (
        <AdaptiveProgressionNotification
          changeInfo={difficultyChangeInfo}
          onClose={clearDifficultyChange}
        />
      )}
    </div>
  );
};

export default AdaptiveGameContainer;
