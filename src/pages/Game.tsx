
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
import { useCallback, useEffect, useState } from "react";
import { RootLayout } from "@/components/RootLayout";
import { Player } from "@/types/guess-game";
import { Loader } from "@/components/guess-game/Loader";
import { ErrorDisplay } from "@/components/guess-game/ErrorDisplay";
import { EmptyPlayersDisplay } from "@/components/guess-game/EmptyPlayersDisplay";
import { GameHeader } from "@/components/guess-game/GameHeader";
import { DebugInfo } from "@/components/guess-game/DebugInfo";
import { GameContainer } from "@/components/guess-game/GameContainer";
import { useDebug } from "@/hooks/use-debug";

const Game = () => {
  const { user } = useAuth();
  const { preloadImages } = usePreload();
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [isAuthenticatedGame, setIsAuthenticatedGame] = useState(false);
  const { showImageUrl, handleDebugClick } = useDebug();
  
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

  // Show game over dialog when player loses
  useEffect(() => {
    if (hasLost) {
      setShowGameOverDialog(true);
    }
  }, [hasLost]);

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
  };

  const handleSkipTutorial = () => {
    setShowTutorial(false);
    setGameStarted(true);
    setIsAuthenticatedGame(!!user);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white p-4 flex items-center justify-center">
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
    <RootLayout>
      <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white p-4">
        <div className="container mx-auto max-w-4xl">
          <GameHeader 
            score={score} 
            onDebugClick={handleDebugClick} 
          />

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
    </RootLayout>
  );
};

export default Game;
