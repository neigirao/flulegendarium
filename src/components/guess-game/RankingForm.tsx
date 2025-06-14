
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, User } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";
import { useNavigate } from "react-router-dom";

interface RankingFormProps {
  score: number;
  onSaved: () => void;
  onCancel: () => void;
  isAuthenticated?: boolean;
}

export const RankingForm = ({ score, onSaved, onCancel, isAuthenticated = false }: RankingFormProps) => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Nome obrigatório",
        description: "Por favor, digite seu nome para salvar a pontuação.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('ranking')
        .insert([
          {
            player_name: name.trim(),
            score: score,
            user_id: user?.id || null,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      trackEvent({
        action: 'score_saved_to_ranking',
        category: 'Game',
        label: 'ranking_submission',
        value: score
      });

      toast({
        title: "Sucesso!",
        description: "Sua pontuação foi salva no ranking!",
      });

      // Se não está autenticado (jogador convidado), redireciona para home
      if (!isAuthenticated) {
        navigate("/");
      } else {
        onSaved();
      }
    } catch (error) {
      console.error('Erro ao salvar pontuação:', error);
      
      trackEvent({
        action: 'score_save_error',
        category: 'Game',
        label: 'ranking_submission_failed'
      });
      
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar sua pontuação. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-flu-grena" />
          <h3 className="text-xl font-bold text-flu-grena">Salvar Pontuação</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Sua pontuação: <span className="font-bold text-flu-grena">{score}</span>
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="playerName" className="block text-sm font-medium text-gray-700">
          Seu nome
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="playerName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome..."
            className="pl-10"
            disabled={isLoading}
            autoFocus
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !name.trim()}
        className="w-full bg-flu-grena hover:bg-flu-grena/90"
      >
        {isLoading ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
};
