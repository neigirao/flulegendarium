import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, User, X, Instagram } from "lucide-react";
import { useAnalytics } from "@/hooks/analytics";
import { useQueryClient } from "@tanstack/react-query";
import { logger } from "@/utils/logger";

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
  const [instagram, setInstagram] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const queryClient = useQueryClient();

  // Auto-fill name if user is authenticated
  useEffect(() => {
    if (user) {
      const displayName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.email?.split('@')[0] || 
                         '';
      
      logger.debug('Usuário logado, preenchendo automaticamente', 'RANKING_FORM', { displayName });
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
      const playerDisplayName = instagram.trim() ? 
        `${name.trim()} (@${instagram.trim().replace('@', '')})` : 
        name.trim();

      logger.debug('Preparando salvamento do ranking', 'RANKING_FORM', {
        player_name: playerDisplayName,
        score: score,
        user_id: user?.id || null,
        game_mode: gameMode,
        difficulty_level: difficultyLevel
      });

      // Invalidate all ranking queries to force refresh
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
      queryClient.invalidateQueries({ queryKey: ['rankings-home'] });
      queryClient.invalidateQueries({ queryKey: ['rankings-game'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats-all'] });

      trackEvent({
        action: 'score_saved_to_ranking',
        category: 'Game',
        label: `ranking_submission_${gameMode}_guest`,
        value: score
      });

      const modeText = gameMode === 'adaptive' ? ' no modo adaptativo' : '';
      toast({
        title: "Sucesso!",
        description: `Sua pontuação de ${score} pontos foi salva no ranking${modeText}!`,
      });

      // Notifica componente pai para fazer o salvamento
      onSaved(playerDisplayName);
    } catch (error) {
      console.error('❌ Erro ao preparar salvamento:', error);
      
      trackEvent({
        action: 'score_save_error',
        category: 'Game',
        label: `ranking_submission_failed_${gameMode}_guest`
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
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-primary">Salvar no Ranking</h3>
          {gameMode === 'adaptive' && (
            <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full">
              Adaptativo
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="text-center">
        <p className="text-muted-foreground">
          Sua pontuação: <span className="font-bold text-primary">{score} pontos</span>
        </p>
        {gameMode === 'adaptive' && difficultyLevel && (
          <p className="text-sm text-muted-foreground">
            Nível final: {difficultyLevel}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="playerName" className="block text-sm font-medium text-foreground">
            Seu nome
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
          {user && (
            <p className="text-xs text-muted-foreground">
              Nome preenchido automaticamente do seu perfil
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="instagram" className="block text-sm font-medium text-foreground">
            Instagram (opcional)
          </label>
          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="instagram"
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@seuinstagram"
              className="pl-10"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Seu @ do Instagram aparecerá no ranking junto com seu nome
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Salvando..." : "Salvar no Ranking"}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-border text-muted-foreground hover:bg-muted"
          >
            Pular
          </Button>
        </div>
      </form>
    </div>
  );
};
