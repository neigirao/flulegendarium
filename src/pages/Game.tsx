import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader as GameLoader } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { AuthButton } from "@/components/auth/AuthButton";
import { GameOverDialog } from "@/components/guess-game/GameOverDialog";
import { GameTutorial } from "@/components/guess-game/GameTutorial";
import { Loader } from "@/components/guess-game/Loader";
import { ErrorDisplay } from "@/components/guess-game/ErrorDisplay";
import { EmptyPlayersDisplay } from "@/components/guess-game/EmptyPlayersDisplay";
import { GameHeader } from "@/components/guess-game/GameHeader";
import { DebugInfo } from "@/components/guess-game/DebugInfo";
import { GameContainer } from "@/components/guess-game/GameContainer";
import { useGuessGame } from "@/hooks/use-guess-game";
import { usePreload } from "@/hooks/use-preload";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/use-analytics";
import { useDebug } from "@/hooks/use-debug";
import { 
  getReliableImageUrl, 
  preloadPlayerImages, 
  preloadNextPlayer, 
  prepareNextBatch 
} from "@/utils/player-image";
import { Player } from "@/types/guess-game";
import { convertStatistics } from "@/utils/statistics-converter";

const Game = () => {
  const { user } = useAuth();
  const { preloadImages } = usePreload();
  const { trackGameStart, trackGameEnd, trackPageView, trackEvent } = useAnalytics();
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [isAuthenticatedGame, setIsAuthenticatedGame] = useState(false);
  const { showImageUrl, handleDebugClick } = useDebug();

  // Track page view
  useEffect(() => {
    trackPageView('/game');
  }, [trackPageView]);
  
  const { data: players = [], isLoading, error: playersError } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('players')
          .select('*');
          
        if (error) {
          console.error("Erro ao buscar jogadores:", error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.warn("Nenhum jogador encontrado na base de dados");
          return [] as Player[];
        }
        
        const enhancedPlayers: Player[] = data.map((player) => {
          try {
            // Convert the player data to proper Player type with robust statistics conversion
            const enhancedPlayer: Player = {
              id: player.id,
              name: player.name || 'Nome não informado',
              position: player.position || 'Posição não informada',
              image_url: player.image_url || '',
              year_highlight: player.year_highlight || '',
              fun_fact: player.fun_fact || '',
              achievements: Array.isArray(player.achievements) ? player.achievements : [],
              nicknames: Array.isArray(player.nicknames) ? player.nicknames : [],
              statistics: convertStatistics(player.statistics)
            };
            
            // Now enhance the image URL
            enhancedPlayer.image_url = getReliableImageUrl(enhancedPlayer);
            
            return enhancedPlayer;
          } catch (playerError) {
            console.error(`Erro ao processar jogador ${player.name}:`, playerError);
            // Return a fallback player object
            return {
              id: player.id,
              name: player.name || 'Nome não informado',
              position: player.position || 'Posição não informada',
              image_url: getReliableImageUrl({ 
                id: player.id, 
                name: player.name || 'Nome não informado',
                image_url: player.image_url || ''
              } as Player),
              year_highlight: '',
              fun_fact: '',
              achievements: [],
              nicknames: [],
              statistics: { gols: 0, jogos: 0 }
            };
          }
        });
        
        return enhancedPlayers;
      } catch (err) {
        console.error("Erro ao buscar jogadores:", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: false,
  });

  // Preload player images when data is loaded
  useEffect(() => {
    if (players && players.length > 0) {
      preloadPlayerImages(players);

      const imagesToPreload = players
        .slice(0, 8)
        .map(player => getReliableImageUrl(player));
      preloadImages(imagesToPreload);

      if (players.length > 8) {
        const batchSize = 5;
        for (let i = 8; i < players.length; i += batchSize) {
          const batch = players.slice(i, i + batchSize);
          const delay = (i - 8) * 1000;
          setTimeout(() => {
            batch.forEach((player) => {
              const img = new Image();
              img.src = getReliableImageUrl(player);
              img.fetchPriority = 'low';
            });
          }, delay);
        }
      }
    }
  }, [players, preloadImages]);

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
  } = useGuessGame(gameStarted && players.length > 0 ? players : undefined);

  // Show game over dialog when player loses
  useEffect(() => {
    if (hasLost) {
      setShowGameOverDialog(true);
      // Track game end
      const correctGuesses = Math.floor(score / 5); // Each correct guess gives 5 points
      trackGameEnd(score, correctGuesses);
    }
  }, [hasLost, score, trackGameEnd]);

  // Handle dialog close and select a new player
  const handleGameOverClose = useCallback(() => {
    setShowGameOverDialog(false);
    selectRandomPlayer();
  }, [selectRandomPlayer]);

  // Prepare next batch of players for efficient loading
  useEffect(() => {
    if (players && players.length > 1 && currentPlayer) {
      prepareNextBatch(players, currentPlayer, 5);
      const potentialNextPlayers = players.filter(p => p.id !== currentPlayer.id);
      if (potentialNextPlayers.length > 0) {
        const randomIndices = Array.from(
          { length: Math.min(3, potentialNextPlayers.length) },
          () => Math.floor(Math.random() * potentialNextPlayers.length)
        );
        randomIndices.forEach((idx, i) => {
          setTimeout(() => {
            preloadNextPlayer(potentialNextPlayers[idx]);
          }, i * 200);
        });
      }
    }
  }, [currentPlayer, players]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setGameStarted(true);
    setIsAuthenticatedGame(!!user);
    trackGameStart('authenticated_game');
  };

  const handleSkipTutorial = () => {
    setShowTutorial(false);
    setGameStarted(true);
    setIsAuthenticatedGame(!!user);
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
    <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
              alt="Fluminense FC" 
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
          onComplete={handleTutorialComplete}
          onSkip={handleSkipTutorial}
        />
      )}

      {currentPlayer && gameStarted && (
        <GameOverDialog
          open={showGameOverDialog}
          onClose={handleGameOverClose}
          playerName={currentPlayer.name}
          score={score}
          onResetScore={resetScore}
          isAuthenticated={isAuthenticatedGame}
        />
      )}
    </div>
  );
};

export default Game;
