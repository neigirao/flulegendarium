
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getReliableImageUrl } from "@/utils/playerImageUtils";
import { PlayerImage } from "@/components/guess-game/PlayerImage";
import { GuessForm } from "@/components/guess-game/GuessForm";
import { GameStatus } from "@/components/guess-game/GameStatus";
import { RankingDisplay } from "@/components/guess-game/RankingDisplay";
import { useGuessGame } from "@/hooks/use-guess-game";

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

const GuessPlayer = () => {
  const navigate = useNavigate();
  
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
          
          // Update images in database too
          for (const player of enhancedPlayers) {
            try {
              const newUrl = getReliableImageUrl(player);
              if (newUrl !== player.image_url) {
                await supabase
                  .from('players')
                  .update({ image_url: newUrl })
                  .eq('id', player.id);
              }
            } catch (err) {
              console.error(`Erro ao atualizar imagem do jogador ${player.name}:`, err);
            }
          }
          
          return enhancedPlayers;
        }
        return data as Player[];
      } catch (err) {
        console.error("Exceção ao buscar jogadores:", err);
        throw err;
      }
    },
    retry: 3,
    refetchOnWindowFocus: false,
  });

  const {
    currentPlayer,
    attempts,
    score,
    gameOver,
    MAX_ATTEMPTS,
    handleGuess,
    selectRandomPlayer,
    handlePlayerImageFixed
  } = useGuessGame(players);

  if (isLoading) {
    return <div className="text-center p-8">Carregando jogadores...</div>;
  }

  if (playersError) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 font-semibold mb-4">Erro ao carregar jogadores.</p>
        <p className="text-sm text-gray-600 mb-4">
          {playersError instanceof Error ? playersError.message : "Erro desconhecido"}
        </p>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-48 mb-4">
          {JSON.stringify(playersError, null, 2)}
        </pre>
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
        <p className="text-sm text-gray-600 mb-4">
          Entre em contato com o administrador para adicionar jogadores.
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-flu-grena hover:opacity-80"
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
              />

              <GuessForm 
                disabled={gameOver}
                onSubmitGuess={handleGuess}
              />

              <GameStatus
                attempts={attempts}
                maxAttempts={MAX_ATTEMPTS}
                score={score}
                gameOver={gameOver}
                onNextPlayer={selectRandomPlayer}
              />
            </div>
          )}
          
          <RankingDisplay />
        </div>
      </div>
    </div>
  );
};

export default GuessPlayer;
