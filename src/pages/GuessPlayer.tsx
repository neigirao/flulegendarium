import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getReliableImageUrl, preloadPlayerImages, preloadNextPlayer, prepareNextBatch } from "@/utils/playerImageUtils";
import { PlayerImage } from "@/components/guess-game/PlayerImage";
import { GuessForm } from "@/components/guess-game/GuessForm";
import { GameStatus } from "@/components/guess-game/GameStatus";
import { RankingDisplay } from "@/components/guess-game/RankingDisplay";
import { useGuessGame } from "@/hooks/use-guess-game";
import { usePreload } from "@/hooks/use-preload";
import { useState, useCallback, Suspense, useEffect, lazy } from "react";
import { cn } from "@/lib/utils";
import { RootLayout } from "@/components/RootLayout";

// Lazy load the RankingDisplay component since it's not initially visible
const LazyRankingDisplay = lazy(() => 
  import("@/components/guess-game/RankingDisplay").then(module => ({
    default: module.RankingDisplay
  }))
);

interface Player {
  id: string;
  name: string;
  position: string;
  image_url: string;
  year_highlight: string;
  fun_fact: string;
  achievements: string[];
  statistics: {
    gols: number;
    jogos: number;
  };
}

// Loader component
const Loader = () => (
  <div className="w-full flex justify-center my-8">
    <div className="w-10 h-10 border-4 border-flu-verde border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const GuessPlayer = () => {
  const navigate = useNavigate();
  const [showRanking, setShowRanking] = useState(false);
  const { preloadImages } = usePreload();
  
  // Fetch players from Supabase with improved error handling and more logs
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
          
          // Fix image URLs for all players
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
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 3,
    refetchOnWindowFocus: false,
  });

  // Enhanced preloading system when data is available
  useEffect(() => {
    if (players && players.length > 0) {
      // Immediate preloading of initial batch
      preloadPlayerImages(players);
      
      // Preload using our hook as well for redundancy
      const imagesToPreload = players
        .slice(0, 8) // Increased from 5 to 8
        .map(player => getReliableImageUrl(player));
      
      preloadImages(imagesToPreload);
      
      // Schedule background preloading for the rest with delays
      if (players.length > 8) {
        // Stagger loading the rest of the players in batches
        const batchSize = 5;
        for (let i = 8; i < players.length; i += batchSize) {
          const batch = players.slice(i, i + batchSize);
          const delay = (i - 8) * 1000; // 1 second between batches
          
          setTimeout(() => {
            console.log(`Iniciando pré-carregamento em background de lote ${i / batchSize + 1}`);
            batch.forEach((player, index) => {
              const img = new Image();
              img.src = getReliableImageUrl(player);
              img.fetchPriority = 'low';
            });
          }, delay);
        }
      }
    }
  }, [players, preloadImages]);

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
    isImageLoaded,
    handleImageLoaded
  } = useGuessGame(players);

  // Enhanced next player preloading that's more aggressive
  useEffect(() => {
    if (players && players.length > 1 && currentPlayer) {
      // Prepare next batch of potential players
      prepareNextBatch(players, currentPlayer, 5);
      
      // Also preload a specific next player for immediate use
      const potentialNextPlayers = players.filter(p => p.id !== currentPlayer.id);
      if (potentialNextPlayers.length > 0) {
        // Pick multiple random potential next players to preload
        const randomIndices = Array.from(
          { length: Math.min(3, potentialNextPlayers.length) },
          () => Math.floor(Math.random() * potentialNextPlayers.length)
        );
        
        randomIndices.forEach((idx, i) => {
          setTimeout(() => {
            preloadNextPlayer(potentialNextPlayers[idx]);
          }, i * 200); // Stagger preloading
        });
      }
    }
  }, [currentPlayer, players]);

  const toggleRanking = useCallback(() => {
    setShowRanking(prev => !prev);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white p-4 flex items-center justify-center">
      <Loader />
    </div>;
  }

  if (playersError) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 font-semibold mb-4">Erro ao carregar jogadores.</p>
        <p className="text-sm text-gray-600 mb-4">
          {playersError instanceof Error ? playersError.message : "Erro desconhecido"}
        </p>
        <button 
          onClick={() => navigate("/")}
          className="bg-flu-grena text-white px-4 py-2 rounded-lg"
        >
          Voltar
        </button>
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="mb-4">Nenhum jogador cadastrado ainda.</p>
        <button 
          onClick={() => navigate("/")}
          className="bg-flu-grena text-white px-4 py-2 rounded-lg"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <RootLayout>
      <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-flu-grena hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="mr-2" />
              Voltar
            </button>
            <div className="text-flu-grena font-semibold">
              {score} pontos
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-flu-grena mb-2">
                Adivinhe o Jogador
              </h1>
              <p className="text-gray-600">Use apelidos ou nomes oficiais!</p>
              <p className="text-sm text-gray-500 mt-2">
                Total de jogadores: {players ? players.length : 0}
              </p>
            </div>

            {currentPlayer && (
              <div className="space-y-6">
                <PlayerImage 
                  player={currentPlayer} 
                  onImageFixed={handlePlayerImageFixed}
                  onImageLoaded={handleImageLoaded}
                />

                <GuessForm 
                  disabled={gameOver || !isImageLoaded}
                  onSubmitGuess={handleGuess}
                  isProcessing={isProcessingGuess}
                />

                <GameStatus
                  attempts={attempts}
                  maxAttempts={MAX_ATTEMPTS}
                  score={score}
                  gameOver={gameOver}
                  timeRemaining={timeRemaining}
                  onNextPlayer={selectRandomPlayer}
                  isImageLoaded={isImageLoaded}
                />
              </div>
            )}
            
            <div className="mt-6">
              <button 
                onClick={toggleRanking}
                className={cn(
                  "w-full py-2 px-4 rounded-lg transition-colors",
                  showRanking 
                    ? "bg-gray-200 text-gray-700" 
                    : "bg-flu-grena text-white"
                )}
              >
                {showRanking ? "Ocultar Ranking" : "Mostrar Ranking"}
              </button>
              
              {showRanking && (
                <Suspense fallback={<Loader />}>
                  <LazyRankingDisplay />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default GuessPlayer;
