import { ArrowLeft, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getReliableImageUrl, preloadPlayerImages, preloadNextPlayer, prepareNextBatch } from "@/utils/playerImageUtils";
import { PlayerImage } from "@/components/guess-game/PlayerImage";
import { GuessForm } from "@/components/guess-game/GuessForm";
import { GameStatus } from "@/components/guess-game/GameStatus";
import { RankingDisplay } from "@/components/guess-game/RankingDisplay";
import { GameOverDialog } from "@/components/guess-game/GameOverDialog";
import { useGuessGame } from "@/hooks/use-guess-game";
import { usePreload } from "@/hooks/use-preload";
import { useState, useCallback, Suspense, useEffect, lazy } from "react";
import { cn } from "@/lib/utils";
import { RootLayout } from "@/components/RootLayout";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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

const Loader = () => (
  <div className="w-full flex justify-center my-8">
    <div className="w-10 h-10 border-4 border-flu-verde border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const GuessPlayer = () => {
  const navigate = useNavigate();
  const [showRanking, setShowRanking] = useState(false);
  const { preloadImages } = usePreload();
  const [debugClickCount, setDebugClickCount] = useState(0);
  const [showImageUrl, setShowImageUrl] = useState(false);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  
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
    hasLost
  } = useGuessGame(players);

  useEffect(() => {
    if (hasLost) {
      setShowGameOverDialog(true);
    }
  }, [hasLost]);

  const handleGameOverClose = useCallback(() => {
    setShowGameOverDialog(false);
    selectRandomPlayer();
  }, [selectRandomPlayer]);

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

  const toggleRanking = useCallback(() => {
    setShowRanking(prev => !prev);
  }, []);

  const handleDebugClick = useCallback(() => {
    setDebugClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        setShowImageUrl(true);
        return 0;
      }
      return newCount;
    });
  }, []);

  useEffect(() => {
    if (showImageUrl) {
      const timer = setTimeout(() => {
        setShowImageUrl(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showImageUrl]);

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
            <div className="flex flex-col items-center">
              <div className="text-flu-grena font-semibold">
                {score} pontos
              </div>
              <div 
                className="text-gray-500 mt-1 cursor-default"
                onClick={handleDebugClick}
              >
                <Info size={16} className="opacity-50 hover:opacity-70 transition-opacity" />
              </div>
            </div>
          </div>

          {showImageUrl && currentPlayer && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Alert className="mb-4">
                    <AlertTitle>Debug Info</AlertTitle>
                    <AlertDescription className="text-xs truncate">
                      URL da imagem: {currentPlayer.image_url}
                    </AlertDescription>
                  </Alert>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Clique para copiar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

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
                />

                {!hasLost && (
                  <GuessForm 
                    disabled={gameOver}
                    onSubmitGuess={handleGuess}
                    isProcessing={isProcessingGuess}
                  />
                )}

                <GameStatus
                  attempts={attempts}
                  maxAttempts={MAX_ATTEMPTS}
                  score={score}
                  gameOver={gameOver}
                  timeRemaining={timeRemaining}
                  onNextPlayer={selectRandomPlayer}
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

      {currentPlayer && (
        <GameOverDialog
          open={showGameOverDialog}
          onClose={handleGameOverClose}
          playerName={currentPlayer.name}
          score={score}
        />
      )}
    </RootLayout>
  );
};

export default GuessPlayer;
