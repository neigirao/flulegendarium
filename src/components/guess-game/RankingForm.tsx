import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, User, X } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";
import { useQueryClient } from "@tanstack/react-query";

interface RankingFormProps {
  score: number;
  onSaved: (playerName: string) => void;
  onCancel: () => void;
  isAuthenticated?: boolean;
  gameMode?: 'classic' | 'adaptive';
  difficultyLevel?: string;
}

export const RankingForm = ({ 
  score, 
  onSaved, 
  onCancel, 
  isAuthenticated = false,
  gameMode = 'classic',
  difficultyLevel 
}: RankingFormProps) => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const queryClient = useQueryClient();

  // Auto-fill name if user is authenticated
  useEffect(() => {
    if (user) {
      // Try to get name from user metadata or email
      const displayName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.email?.split('@')[0] || 
                         '';
      
      console.log('👤 Preenchendo nome automaticamente:', displayName);
      setName(displayName);
    }
  }, [user]);

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
      console.log('💾 Salvando ranking no banco:', {
        player_name: name.trim(),
        score: score,
        user_id: user?.id || null,
        game_mode: gameMode,
        difficulty_level: difficultyLevel
      });

      const { error } = await supabase
        .from('rankings')
        .insert([
          {
            player_name: name.trim(),
            score: score,
            user_id: user?.id || null,
            game_mode: gameMode,
            difficulty_level: difficultyLevel,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      console.log('✅ Ranking salvo com sucesso!');

      // Invalidate all ranking queries to force refresh
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
      queryClient.invalidateQueries({ queryKey: ['rankings-home'] });
      queryClient.invalidateQueries({ queryKey: ['rankings-game'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats-all'] });

      trackEvent({
        action: 'score_saved_to_ranking',
        category: 'Game',
        label: `ranking_submission_${gameMode}`,
        value: score
      });

      const modeText = gameMode === 'adaptive' ? ' no modo adaptativo' : '';
      toast({
        title: "Sucesso!",
        description: `Sua pontuação de ${score} pontos foi salva no ranking${modeText}!`,
      });

      onSaved(name.trim());
    } catch (error) {
      console.error('❌ Erro ao salvar pontuação:', error);
      
      trackEvent({
        action: 'score_save_error',
        category: 'Game',
        label: `ranking_submission_failed_${gameMode}`
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-flu-grena" />
          <h3 className="text-lg font-bold text-flu-grena">Salvar no Ranking</h3>
          {gameMode === 'adaptive' && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
              Adaptativo
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="text-center">
        <p className="text-gray-600">
          Sua pontuação: <span className="font-bold text-flu-grena">{score} pontos</span>
        </p>
        {gameMode === 'adaptive' && difficultyLevel && (
          <p className="text-sm text-gray-500">
            Nível final: {difficultyLevel}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
              autoFocus={!user}
            />
          </div>
          {user && (
            <p className="text-xs text-gray-500">
              Nome preenchido automaticamente do seu perfil
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="flex-1 bg-flu-grena hover:bg-flu-grena/90"
          >
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Pular
          </Button>
        </div>
      </form>
    </div>
  );
};
