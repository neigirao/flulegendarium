
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { saveRanking, getTopRankings } from "@/services/rankingService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { isValidPlayerName } from "@/utils/filterUtils";
import { useQuery } from "@tanstack/react-query";
import ReactConfetti from "react-confetti";
import { Trophy } from "lucide-react";

interface RankingFormProps {
  score: number;
  onSaved: () => void;
  onCancel: () => void;
}

export const RankingForm = ({ score, onSaved, onCancel }: RankingFormProps) => {
  const [playerName, setPlayerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChampion, setIsChampion] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get current top rankings to check if user will be the champion
  const { data: topRankings = [] } = useQuery({
    queryKey: ['rankings-top'],
    queryFn: () => getTopRankings(1),
  });

  // Update window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Stop confetti after a certain time
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 10000); // 10 seconds of confetti
      
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite seu nome para salvar sua pontuação.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isValidPlayerName(playerName)) {
      toast({
        title: "Nome inadequado",
        description: "Você usou um termo inadequado ou nome de time rival. Sua pontuação não será salva.",
        variant: "destructive",
      });
      
      // Redirect to home after a short delay
      setTimeout(() => {
        navigate("/");
      }, 2500);
      
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await saveRanking({
        player_name: playerName.trim(),
        score,
        games_played: 1
      });

      // Check if this score is the new champion (higher than current #1)
      const isNewChampion = topRankings.length === 0 || score > topRankings[0].score;
      
      if (isNewChampion) {
        setIsChampion(true);
        setShowConfetti(true);
        
        toast({
          title: "🏆 NOVO CAMPEÃO! 🏆",
          description: `Parabéns ${playerName}! Você é o novo campeão com ${score} pontos!`,
          variant: "default",
        });
      } else {
        toast({
          title: "Pontuação salva!",
          description: `${playerName}, sua pontuação de ${score} pontos foi registrada.`,
        });
      }
      
      // Only redirect after delay if they are champion to enjoy the confetti
      if (isNewChampion) {
        setTimeout(() => {
          onSaved();
        }, 5000);
      } else {
        onSaved();
      }
    } catch (error) {
      console.error("Erro ao salvar pontuação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar sua pontuação. Tente novamente.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={true}
          numberOfPieces={500}
          colors={['#009245', '#cf0a2c', '#ffffff']} // Fluminense colors
        />
      )}
      
      {isChampion && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-flu-grena/90 text-white px-8 py-6 rounded-xl shadow-2xl animate-pulse max-w-md text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold">NOVO CAMPEÃO!</h2>
            <p className="text-xl mt-2">
              Parabéns {playerName}! <br/>
              Você é o número #1 com {score} pontos!
            </p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-semibold text-flu-grena">Salvar Pontuação</h3>
        
        <div>
          <label htmlFor="playerName" className="block text-sm font-medium mb-1">
            Seu nome
          </label>
          <Input
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Digite seu nome..."
            className="w-full"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className="bg-flu-grena text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </>
  );
};
