
import React, { useEffect } from "react";
import { Loader as GameLoader } from "lucide-react";

import { SEOHead } from "@/components/SEOHead";
import { ErrorDisplay } from "@/components/guess-game/ErrorDisplay";
import { EmptyPlayersDisplay } from "@/components/guess-game/EmptyPlayersDisplay";
import { GameHeader } from "@/components/game/GameHeader";
import { GameContent } from "@/components/game/GameContent";
import { GameModals } from "@/components/game/GameModals";

import { useSimpleGuessGame } from "@/hooks/use-simple-guess-game";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/use-analytics";
import { useDebug } from "@/hooks/use-debug";
import { usePlayersData } from "@/hooks/use-players-data";
import { usePlayerPreload } from "@/hooks/use-player-preload";
import { useGameState } from "@/hooks/use-game-state";
import { useGameHandlers } from "@/hooks/game/use-game-handlers";

const Game = () => {
  console.log("🎮 Game component iniciando...");
  
  const { user } = useAuth();
  const { trackGameStart, trackGameEnd, trackPageView, trackEvent } = useAnalytics();
  const { showImageUrl } = useDebug();
  
  // Load players data first
  const { players, isLoading, playersError } = usePlayersData();

  // Track page view
  useEffect(() => {
    trackPageView('/jogar-quiz-fluminense');
  }, [trackPageView]);

  // Verificação mais robusta dos dados
  const hasValidPlayers = players && Array.isArray(players) && players.length > 0;
  
  console.log("📋 Estado dos players no Game component:", {
    playersCount: players?.length || 0,
    isLoading,
    hasError: !!playersError,
    hasValidPlayers,
    firstPlayerName: hasValidPlayers ? players[0]?.name : 'none'
  });

  // Game logic hook - só inicializar se temos jogadores válidos
  const gameLogicResult = useSimpleGuessGame(hasValidPlayers ? players : undefined);
  
  // Loading state
  if (isLoading) {
    console.log("🔄 Mostrando loading state...");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GameLoader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Carregando jogadores...</p>
          <p className="text-sm text-gray-600 mt-2">Por favor, aguarde...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (playersError) {
    console.error("❌ Mostrando error state:", playersError);
    return <ErrorDisplay error={playersError} />;
  }

  // Empty players state
  if (!hasValidPlayers) {
    console.warn("⚠️ Mostrando empty players state");
    return <EmptyPlayersDisplay />;
  }

  // No game logic result yet (still initializing)
  if (!gameLogicResult) {
    console.log("⚠️ gameLogicResult ainda não disponível");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GameLoader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Inicializando jogo...</p>
        </div>
      </div>
    );
  }

  // Extrair dados do game logic
  const {
    currentPlayer,
    gameKey,
    attempts,
    score,
    gameOver,
    timeRemaining,
    MAX_ATTEMPTS,
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
    playerChangeCount
  } = gameLogicResult;

  // Game state management
  const {
    showGameOverDialog,
    showTutorial,
    gameStarted,
    isAuthenticatedGame,
    showGuestNameForm,
    guestPlayerName,
    handleGameOverClose,
    handleTutorialComplete,
    handleSkipTutorial,
    handleGuestNameSubmitted,
    handleGuestNameCancel
  } = useGameState({ hasLost });

  // Game handlers
  const { onTutorialComplete, onSkipTutorial, onGameOverClose } = useGameHandlers({
    user,
    trackGameStart,
    handleTutorialComplete,
    handleSkipTutorial,
    handleGameOverClose,
    selectRandomPlayer
  });

  // Preload next players
  usePlayerPreload(players, currentPlayer);

  // Track game end
  useEffect(() => {
    if (hasLost) {
      const correctGuesses = Math.floor(score / 5);
      trackGameEnd(score, correctGuesses);
    }
  }, [hasLost, score, trackGameEnd]);

  console.log('🎮 Game render - Estado final:', {
    currentPlayerName: currentPlayer?.name || 'Nenhum',
    gameKey,
    playersCount: players?.length || 0,
    gameStarted,
    isLoading,
    hasError: !!playersError
  });

  return (
    <>
      <SEOHead 
        title="Jogar Quiz Fluminense - Adivinhe os Jogadores | Lendas do Flu"
        description="🎮 Jogue agora o quiz oficial do Fluminense! Adivinhe os jogadores pelas fotos, ganhe pontos e entre no ranking tricolor. Desafio gratuito!"
        keywords="jogar quiz fluminense, adivinhar jogador fluminense, jogo tricolor, quiz futebol online, teste fluminense grátis"
        url="https://flulegendarium.lovable.app/jogar-quiz-fluminense"
        canonical="https://flulegendarium.lovable.app/jogar-quiz-fluminense"
      />
      <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white">
        <GameHeader user={user} trackEvent={trackEvent} />
        
        <GameContent
          gameStarted={gameStarted}
          showImageUrl={showImageUrl}
          currentPlayer={currentPlayer}
          gameKey={gameKey.toString()}
          attempts={attempts ? attempts.length : 0}
          score={score}
          gameOver={gameOver}
          timeRemaining={timeRemaining}
          MAX_ATTEMPTS={MAX_ATTEMPTS}
          handleGuess={handleGuess}
          selectRandomPlayer={selectRandomPlayer}
          handlePlayerImageFixed={handlePlayerImageFixed}
          isProcessingGuess={isProcessingGuess}
          hasLost={hasLost}
          startGameForPlayer={startGameForPlayer}
          isTimerRunning={isTimerRunning}
          gamesPlayed={gamesPlayed}
          currentStreak={currentStreak}
          maxStreak={maxStreak}
          forceRefresh={forceRefresh}
          playerChangeCount={playerChangeCount}
        />

        <GameModals
          showTutorial={showTutorial}
          showGuestNameForm={showGuestNameForm}
          showGameOverDialog={showGameOverDialog}
          currentPlayer={currentPlayer}
          gameStarted={gameStarted}
          score={score}
          isAuthenticatedGame={isAuthenticatedGame}
          guestPlayerName={guestPlayerName}
          onTutorialComplete={onTutorialComplete}
          onSkipTutorial={onSkipTutorial}
          handleGuestNameSubmitted={handleGuestNameSubmitted}
          handleGuestNameCancel={handleGuestNameCancel}
          handleGameOverClose={onGameOverClose}
          resetScore={resetScore}
        />
      </div>
    </>
  );
};

export default Game;
