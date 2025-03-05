
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { saveRanking } from "@/services/rankingService";

interface RankingFormProps {
  score: number;
  onSaved: () => void;
  onCancel: () => void;
}

export const RankingForm = ({ score, onSaved, onCancel }: RankingFormProps) => {
  const [playerName, setPlayerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      toast({
        variant: "destructive",
        title: "Nome obrigatório",
        description: "Digite seu nome para salvar sua pontuação.",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await saveRanking({
        player_name: playerName,
        score,
        games_played: 1
      });
      
      toast({
        title: "Pontuação salva!",
        description: "Sua pontuação foi salva com sucesso no ranking.",
      });
      
      onSaved();
    } catch (error) {
      console.error("Erro ao salvar ranking:", error);
      
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar sua pontuação. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-white">
      <h3 className="font-medium text-lg mb-2">Salvar sua pontuação</h3>
      <p className="text-sm text-gray-600 mb-4">
        Parabéns! Você fez {score} pontos. Digite seu nome para salvar no ranking.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Seu nome"
            className="w-full"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            type="submit" 
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Pular
          </Button>
        </div>
      </form>
    </div>
  );
};
