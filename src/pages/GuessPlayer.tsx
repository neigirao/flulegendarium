
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

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

const MAX_ATTEMPTS = 3;

const GuessPlayer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  
  // Busca jogadores do Supabase com tratamento de erro melhorado e mais logs
  const { data: players = [], isLoading, error: playersError } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      try {
        console.log("Iniciando busca de jogadores...");
        console.log("URL do Supabase:", supabase.supabaseUrl);
        
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
        }
        return data as Player[];
      } catch (err) {
        console.error("Exceção ao buscar jogadores:", err);
        throw err;
      }
    },
    retry: 3, // Tenta mais vezes em caso de falha
    refetchOnWindowFocus: false, // Evita refetch desnecessário
  });

  useEffect(() => {
    if (players?.length > 0 && !currentPlayer) {
      console.log("Selecionando jogador aleatório entre", players.length, "jogadores");
      selectRandomPlayer();
    }
  }, [players]);

  const selectRandomPlayer = () => {
    if (!players || players.length === 0) {
      console.log("Não há jogadores disponíveis para selecionar");
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * players.length);
    console.log("Jogador selecionado:", players[randomIndex]?.name || "Desconhecido");
    setCurrentPlayer(players[randomIndex]);
    setAttempts(0);
    setGuess("");
    setGameOver(false);
  };

  const handleGuess = () => {
    if (!currentPlayer || !guess || gameOver) return;

    // Verificação simplificada do nome (case insensitive)
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedPlayerName = currentPlayer.name.toLowerCase().trim();
    
    console.log(`Comparando "${normalizedGuess}" com "${normalizedPlayerName}"`);
    
    if (normalizedGuess === normalizedPlayerName) {
      // Acertou!
      const points = (MAX_ATTEMPTS - attempts) * 5;
      setScore((prev) => prev + points);
      
      toast({
        title: "Parabéns!",
        description: `Você acertou e ganhou ${points} pontos!`,
      });
      
      selectRandomPlayer();
    } else {
      // Errou
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      // Mostrar dicas conforme as tentativas
      if (newAttempts === 1) {
        toast({
          title: "Dica!",
          description: `Posição: ${currentPlayer.position}`,
        });
      } else if (newAttempts === 2) {
        if (currentPlayer.achievements && currentPlayer.achievements.length > 0) {
          toast({
            title: "Dica!",
            description: `Conquistas: ${currentPlayer.achievements.join(", ")}`,
          });
        } else {
          toast({
            title: "Dica!",
            description: `Ano de destaque: ${currentPlayer.year_highlight}`,
          });
        }
      } else {
        // Game over após 3 tentativas
        setGameOver(true);
        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `O jogador era ${currentPlayer.name}`,
        });
      }
    }
    
    setGuess("");
  };

  if (isLoading) {
    return <div className="text-center p-8">Carregando jogadores...</div>;
  }

  if (playersError) {
    console.error("Erro exibido na UI:", playersError);
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
          Adicione jogadores na página inicial para começar a jogar.
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
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <img
                  src={currentPlayer.image_url}
                  alt="Jogador"
                  className="w-full h-full object-cover transition-all duration-500"
                  onError={(e) => {
                    console.error("Erro ao carregar imagem:", e);
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>

              <div className="flex gap-4">
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Nome ou apelido do jogador..."
                  className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-flu-grena"
                  onKeyDown={(e) => e.key === "Enter" && handleGuess()}
                  disabled={gameOver}
                />
                <button
                  onClick={handleGuess}
                  disabled={!guess || gameOver}
                  className="bg-flu-grena text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adivinhar
                </button>
              </div>

              {gameOver && (
                <div className="text-center mt-4">
                  <button
                    onClick={selectRandomPlayer}
                    className="bg-flu-grena text-white px-6 py-2 rounded-lg hover:opacity-90"
                  >
                    Próximo Jogador
                  </button>
                </div>
              )}

              <div className="text-sm text-gray-600">
                <p>Tentativas restantes: {MAX_ATTEMPTS - attempts}</p>
                <p>Dicas desbloqueadas: {attempts}/{MAX_ATTEMPTS}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuessPlayer;
