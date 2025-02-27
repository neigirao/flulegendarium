
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
  const [imageBlur, setImageBlur] = useState("blur-xl");
  const [gameOver, setGameOver] = useState(false);
  
  // Busca jogadores do Supabase
  const { data: players = [], isLoading, error: playersError } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*');
      if (error) throw error;
      return data as Player[];
    },
  });

  useEffect(() => {
    if (players.length > 0 && !currentPlayer) {
      selectRandomPlayer();
    }
  }, [players]);

  const selectRandomPlayer = () => {
    if (players.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * players.length);
    setCurrentPlayer(players[randomIndex]);
    setAttempts(0);
    setImageBlur("blur-xl");
    setGuess("");
    setGameOver(false);
  };

  const handleGuess = () => {
    if (!currentPlayer || !guess || gameOver) return;

    // Verificação simplificada do nome (case insensitive)
    if (guess.toLowerCase() === currentPlayer.name.toLowerCase()) {
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
      
      // Ajustar o blur conforme as tentativas
      if (newAttempts === 1) {
        setImageBlur("blur-md");
        toast({
          title: "Dica!",
          description: `Posição: ${currentPlayer.position}`,
        });
      } else if (newAttempts === 2) {
        setImageBlur("blur-sm");
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
        setImageBlur("blur-none");
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
    return <div className="text-center p-8 text-red-500">Erro ao carregar jogadores.</div>;
  }

  if (players.length === 0) {
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
          </div>

          {currentPlayer && (
            <div className="space-y-6">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <img
                  src={currentPlayer.image_url}
                  alt="Jogador misterioso"
                  className={`w-full h-full object-cover ${imageBlur} transition-all duration-500`}
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
