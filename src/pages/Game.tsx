
import React from "react";
import { Link } from "react-router-dom";
import { Loader as GameLoader } from "lucide-react";

import { AuthButton } from "@/components/auth/AuthButton";
import { GameOverDialog } from "@/components/guess-game/GameOverDialog";
import { GameTutorial } from "@/components/guess-game/GameTutorial";
import { Loader } from "@/components/guess-game/Loader";
import { ErrorDisplay } from "@/components/guess-game/ErrorDisplay";
import { EmptyPlayersDisplay } from "@/components/guess-game/EmptyPlayersDisplay";
import { DebugInfo } from "@/components/guess-game/DebugInfo";
import { GameContainer } from "@/components/guess-game/GameContainer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEOHead } from "@/components/SEOHead";
import { useGuessGame } from "@/hooks/use-guess-game";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/use-analytics";
import { useDebug } from "@/hooks/use-debug";
import { usePlayersData } from "@/hooks/use-players-data";
import { usePlayerPreload } from "@/hooks/use-player-preload";
import { useGameState } from "@/hooks/use-game-state";
import { useEffect } from "react";

const Game = () => {
  const { user } = useAuth();
  const { trackGameStart, trackGameEnd, trackPageView, trackEvent } = useAnalytics();
  const { showImageUrl, handleDebugClick } = useDebug();
  
  // Load players data
  const { players, isLoading, playersError } = usePlayersData();

  // Track page view
  useEffect(() => {
    trackPageView('/game');
  }, [trackPageView]);

  // Only pass players when game has actually started
  const {
    currentPlayer,
    attempts,
    score,
    gameOver,
    timeRemaining,
    MAX_ATTEMPTS,
    handleGuess,
    selectRandomPlayer,
    handlePlayerImageFixed,
    isProcessingGuess,
    hasLost,
    startGameForPlayer,
    isTimerRunning,
    resetScore
  } = useGuessGame(undefined); // Always pass undefined initially

  // Manage game state
  const {
    showGameOverDialog,
    showTutorial,
    gameStarted,
    isAuthenticatedGame,
    handleGameOverClose,
    handleTutorialComplete,
    handleSkipTutorial
  } = useGameState({ hasLost });

  // Preload next players
  usePlayerPreload(players, currentPlayer);

  // Track game end
  useEffect(() => {
    if (hasLost) {
      const correctGuesses = Math.floor(score / 5);
      trackGameEnd(score, correctGuesses);
    }
  }, [hasLost, score, trackGameEnd]);

  const onTutorialComplete = () => {
    handleTutorialComplete(user);
    trackGameStart('authenticated_game');
  };

  const onSkipTutorial = () => {
    handleSkipTutorial(user);
    trackGameStart('guest_game');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <GameLoader />
      </div>
    );
  }

  // Error state
  if (playersError) {
    return <ErrorDisplay error={playersError} />;
  }

  // Empty players state
  if (!players || players.length === 0) {
    return <EmptyPlayersDisplay />;
  }

  return (
    <>
      <SEOHead 
        title="Jogar Quiz Fluminense - Adivinhe os Jogadores | Lendas do Flu"
        description="🎮 Jogue agora o quiz oficial do Fluminense! Adivinhe os jogadores pelas fotos, ganhe pontos e entre no ranking tricolor. Desafio gratuito!"
        keywords="jogar quiz fluminense, adivinhar jogador fluminense, jogo tricolor, quiz futebol online, teste fluminense grátis"
        url="https://flulegendarium.lovable.app/game"
        canonical="https://flulegendarium.lovable.app/game"
      />
      <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-sm py-4 sticky top-0 z-50">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                alt="Escudo Fluminense FC" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-2xl font-bold text-flu-grena">Lendas do Flu</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-flu-verde hover:text-flu-grena transition-colors"
                onClick={() => trackEvent({
                  action: 'navigation_click',
                  category: 'Navigation',
                  label: 'home_from_game'
                })}
              >
                Início
              </Link>
              <Link 
                to="/select-mode" 
                className="text-flu-verde hover:text-flu-grena transition-colors"
                onClick={() => trackEvent({
                  action: 'navigation_click',
                  category: 'Navigation',
                  label: 'select_mode_from_game'
                })}
              >
                Jogar
              </Link>
              {user && (
                <Link 
                  to="/profile" 
                  className="text-flu-verde hover:text-flu-grena transition-colors"
                  onClick={() => trackEvent({
                    action: 'navigation_click',
                    category: 'Navigation',
                    label: 'profile_from_game'
                  })}
                >
                  Meu Perfil
                </Link>
              )}
              <Link 
                to="/admin/login" 
                className="text-flu-verde hover:text-flu-grena transition-colors"
                onClick={() => trackEvent({
                  action: 'navigation_click',
                  category: 'Navigation',
                  label: 'admin_from_game'
                })}
              >
                Admin
              </Link>
              <AuthButton />
            </nav>
          </div>
        </header>

        {/* Game Content */}
        <div className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <Breadcrumbs className="mb-6" />
            
            <DebugInfo 
              show={showImageUrl} 
              imageUrl={currentPlayer?.image_url} 
            />

            {gameStarted && (
              <GameContainer
                currentPlayer={currentPlayer}
                attempts={attempts}
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
              />
            )}
          </div>
        </div>

        {showTutorial && (
          <GameTutorial
            onComplete={onTutorialComplete}
            onSkip={onSkipTutorial}
          />
        )}

        {currentPlayer && gameStarted && (
          <GameOverDialog
            open={showGameOverDialog}
            onClose={() => handleGameOverClose(selectRandomPlayer)}
            playerName={currentPlayer.name}
            score={score}
            onResetScore={resetScore}
            isAuthenticated={isAuthenticatedGame}
          />
        )}
      </div>
    </>
  );
};

export default Game;
