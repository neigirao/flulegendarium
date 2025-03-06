
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { saveRanking } from "@/services/rankingService";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { isValidPlayerName } from "@/utils/filterUtils";

interface RankingFormProps {
  score: number;
  onSaved: () => void;
  onCancel: () => void;
}

export const RankingForm = ({ score, onSaved, onCancel }: RankingFormProps) => {
  const [playerName, setPlayerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      
      toast({
        title: "Pontuação salva!",
        description: `${playerName}, sua pontuação de ${score} pontos foi registrada.`,
      });
      
      onSaved();
    } catch (error) {
      console.error("Erro ao salvar pontuação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar sua pontuação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white/70 rounded-lg">
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
  );
};
