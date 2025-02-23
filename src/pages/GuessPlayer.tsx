
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase"; // Assuma que já existe

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

interface ProcessedName {
  processedName: string | null;
  confidence: number;
}

const GuessPlayer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [imageBlur, setImageBlur] = useState("blur-xl");
  const [gameOver, setGameOver] = useState(false);

  // Busca jogadores do Supabase
  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*');
      if (error) throw error;
      return data as Player[];
    },
  });

  // Processa o nome do jogador usando a Edge Function
  const processName = async (input: string): Promise<ProcessedName> => {
    const { data, error } = await supabase.functions.invoke('process-player-name', {
      body: { userInput: input },
    });
    if (error) throw error;
    return data as ProcessedName;
  };

  // Atualiza o ranking
  const updateRanking = async (points: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('rankings').upsert({
      player_id: user.id,
      username: user.email?.split('@')[0] || 'Anônimo',
      score: points,
      games_played: 1,
      perfect_guesses: attempts === 0 ? 1 : 0,
    }, {
      onConflict: 'player_id',
      count: 'exact',
    });

    if (error) console.error('Erro ao atualizar ranking:', error);
  };

  useEffect(() => {
    if (players.length > 0) {
      selectRandomPlayer();
    }
  }, [players]);

  const selectRandomPlayer = () => {
    const randomIndex = Math.floor(Math.random() * players.length);
    setCurrentPlayer(players[randomIndex]);
    setAttempts(0);
    setShowHint(false);
    setImageBlur("blur-xl");
    setGuess("");
    setGameOver(false);
  };

  const handleGuess = async () => {
    if (!currentPlayer || !guess) return;

    try {
      const processedGuess = await processName(guess);

      if (processedGuess.processedName &&
          processedGuess.processedName.toLowerCase() === currentPlayer.name.toLowerCase()) {
        const attemptPoints = 3 - attempts;
        const points = Math.max(attemptPoints * 5, 5);
        setScore((prev) => prev + points);
        await updateRanking(points);
        
        toast({
          title: "Parabéns!",
          description: `Você acertou e ganhou ${points} pontos!`,
        });
        selectRandomPlayer();
      } else {
        setAttempts((prev) => prev + 1);
        
        if (attempts === 0) {
          setImageBlur("blur-md");
          toast({
            title: "Dica!",
            description: `Posição: ${currentPlayer.position}`,
          });
        } else if (attempts === 1) {
          setImageBlur("blur-sm");
          toast({
            title: "Dica!",
            description: `Conquistas: ${currentPlayer.achievements.join(", ")}`,
          });
        } else {
          setImageBlur("blur-none");
          setGameOver(true);
          toast({
            variant: "destructive",
            title: "Game Over!",
            description: `O jogador era ${currentPlayer.name}`,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao processar tentativa:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao processar sua tentativa",
      });
    }
    setGuess("");
  };

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
            Ranking: {score} pontos
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-lg p-6"
        >
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
                  onClick={() => handleGuess()}
                  disabled={!guess || gameOver}
                  className="bg-flu-grena text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adivinhar
                </button>
              </div>

              {gameOver && (
                <div className="text-center">
                  <button
                    onClick={selectRandomPlayer}
                    className="bg-flu-grena text-white px-6 py-2 rounded-lg hover:opacity-90"
                  >
                    Próximo Jogador
                  </button>
                </div>
              )}

              <div className="text-sm text-gray-600">
                <p>Tentativas restantes: {3 - attempts}</p>
                <p>Dicas desbloqueadas: {attempts}/3</p>
              </div>

              {showHint && (
                <div className="p-4 bg-flu-verde/10 rounded-lg">
                  <h3 className="font-semibold mb-2">Estatísticas do Jogador</h3>
                  <p>Gols: {currentPlayer.statistics.gols}</p>
                  <p>Jogos: {currentPlayer.statistics.jogos}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default GuessPlayer;
