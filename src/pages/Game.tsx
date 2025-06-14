
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { 
  getReliableImageUrl, 
  preloadPlayerImages, 
  preloadNextPlayer, 
  prepareNextBatch 
} from "@/utils/player-image";
import { GameOverDialog } from "@/components/guess-game/GameOverDialog";
import { GameTutorial } from "@/components/guess-game/GameTutorial";
import { useGuessGame } from "@/hooks/use-guess-game";
import { usePreload } from "@/hooks/use-preload";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/use-analytics";
import { useCallback, useEffect, useState } from "react";
import { Player } from "@/types/guess-game";
import { Loader } from "@/components/guess-game/Loader";
import { ErrorDisplay } from "@/components/guess-game/ErrorDisplay";
import { EmptyPlayersDisplay } from "@/components/guess-game/EmptyPlayersDisplay";
import { GameHeader } from "@/components/guess-game/GameHeader";
import { DebugInfo } from "@/components/guess-game/DebugInfo";
import { GameContainer } from "@/components/guess-game/GameContainer";
import { useDebug } from "@/hooks/use-debug";
import { Link } from "react-router-dom";
import { AuthButton } from "@/components/auth/AuthButton";

const Game = () => {
  const { user } = useAuth();
  const { preloadImages } = usePreload();
  const { trackGameStart, trackGameEnd, trackPageView, trackEvent } = useAnalytics();
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [isAuthenticatedGame, setIsAuthenticatedGame] = useState(false);
  const { showImageUrl, handleDebugClick } = useDebug();

  // DEBUG: log transitions
  useEffect(() => {
    console.log("showTutorial:", showTutorial);
    console.log("gameStarted:", gameStarted);
  }, [showTutorial, gameStarted]);

  // Track page view
  useEffect(() => {
    trackPageView('/game');
  }, [trackPageView]);
  
  const { data: players = [], isLoading, error: playersError } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      try {
        console.log("Iniciando busca de jogadores...");
        const { data, error } = await supabase
          .from('players')
          .select('*');
        if (error) {
          console.error("Erro ao buscar jogadores:", error);
          throw error;
        }
        console.log("Jogadores carregados com sucesso:", data?.length || 0, "jogadores");
        if (data && data.length > 0) {
          console.log("Primeiro jogador:", data[0].name);
          const enhancedPlayers = data.map((player: Player) => ({
            ...player,
            image_url: getReliableImageUrl(player)
          }));
          return enhancedPlayers;
        }
        return data as Player[];
      } catch (err) {
        console.error("Exceção ao buscar jogadores:", err);
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
            console.log(`Iniciando pré-carregamento em background de lote ${i / batchSize + 1}`);
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

  const [score, setScore] = useState(0);

  const {
    currentPlayer,
    attempts,
    gameOver,
    timeRemaining,
    MAX_ATTEMPTS,
    handleGuess,
    selectRandomPlayer,
    handlePlayerImageFixed,
    isProcessingGuess,
    hasLost
  } = useGuessGame(gameStarted ? players : undefined);

  const handleResetScore = useCallback(() => {
    setScore(0);
  }, []);

  useEffect(() => {
    // DEBUG: Log currentPlayer changes
    console.log("currentPlayer:", currentPlayer);
    // DEBUG: Log se imagem está correta
    if (currentPlayer) {
      console.log("URL da imagem do jogador:", currentPlayer?.image_url);
    }
  }, [currentPlayer]);

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
    console.log("Tutorial completado, iniciando jogo");
    setShowTutorial(false);
    setGameStarted(true);
    setIsAuthenticatedGame(!!user);
    trackGameStart('authenticated_game');
  };

  const handleSkipTutorial = () => {
    console.log("Tutorial pulado, iniciando jogo");
    setShowTutorial(false);
    setGameStarted(true);
    setIsAuthenticatedGame(!!user);
    trackGameStart('guest_game');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
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

          {/* DEBUG: mostrar estado */}
          <div className="mb-4 rounded bg-yellow-100 text-xs px-4 py-2 text-yellow-900">
            <div><b>showTutorial:</b> {String(showTutorial)}</div>
            <div><b>gameStarted:</b> {String(gameStarted)}</div>
          </div>

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
          onResetScore={handleResetScore}
          isAuthenticated={isAuthenticatedGame}
        />
      )}
    </div>
  );
};

export default Game;
