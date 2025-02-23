
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface Player {
  id: number;
  name: string;
  position: string;
  imageUrl: string;
  yearHighlight: string;
  funFact: string;
}

const MOCK_PLAYERS: Player[] = [
  {
    id: 1,
    name: "Fred",
    position: "Atacante",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    yearHighlight: "2012",
    funFact: "Artilheiro do Brasileirão 2012"
  },
  {
    id: 2,
    name: "Germán Cano",
    position: "Atacante",
    imageUrl: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    yearHighlight: "2022",
    funFact: "Artilheiro da Libertadores 2022"
  }
];

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

  useEffect(() => {
    selectRandomPlayer();
  }, []);

  const selectRandomPlayer = () => {
    const randomIndex = Math.floor(Math.random() * MOCK_PLAYERS.length);
    setCurrentPlayer(MOCK_PLAYERS[randomIndex]);
    setAttempts(0);
    setShowHint(false);
    setImageBlur("blur-xl");
    setGuess("");
  };

  const handleGuess = () => {
    if (!currentPlayer) return;

    if (guess.toLowerCase() === currentPlayer.name.toLowerCase()) {
      const attemptPoints = 3 - attempts;
      const points = Math.max(attemptPoints * 5, 5);
      setScore((prev) => prev + points);
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
          description: `Ano de destaque: ${currentPlayer.yearHighlight}`,
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
    setGuess("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-flu-grena hover:opacity-80"
          >
            <ArrowLeft className="mr-2" />
            Voltar
          </button>
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
            <p className="text-gray-600">Pontuação atual: {score}</p>
          </div>

          {currentPlayer && (
            <div className="space-y-6">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <img
                  src={currentPlayer.imageUrl}
                  alt="Jogador misterioso"
                  className={`w-full h-full object-cover ${imageBlur} transition-all duration-500`}
                />
              </div>

              <div className="flex gap-4">
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Nome do jogador..."
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
                <div className="text-center">
                  <button
                    onClick={() => {
                      setGameOver(false);
                      selectRandomPlayer();
                    }}
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
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default GuessPlayer;
