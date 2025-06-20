
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, User, X, Instagram } from "lucide-react";
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
  const [saveMethod, setSaveMethod] = useState<'guest' | 'google' | null>(null);
  const [name, setName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showInstagramInput, setShowInstagramInput] = useState(false);
  const { toast } = useToast();
  const { user, signInWithGoogle } = useAuth();
  const { trackEvent } = useAnalytics();
  const queryClient = useQueryClient();

  // Auto-fill name if user is authenticated
  useEffect(() => {
    if (user) {
      const displayName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.email?.split('@')[0] || 
                         '';
      
      console.log('👤 Preenchendo nome automaticamente:', displayName);
      setName(displayName);
      setSaveMethod('google');
      setShowInstagramInput(true);
    }
  }, [user]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: "Não foi possível fazer login com Google. Tente novamente.",
        });
      }
    } catch (error) {
      console.error('❌ Erro no login Google:', error);
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: "Não foi possível fazer login com Google. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      console.log('💾 Salvando ranking no banco:', {
        player_name: playerDisplayName,
        score: score,
        user_id: user?.id || null,
        game_mode: gameMode,
        difficulty_level: difficultyLevel
      });

      const { error } = await supabase
        .from('rankings')
        .insert([
          {
            player_name: playerDisplayName,
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
        label: `ranking_submission_${gameMode}_${saveMethod}`,
        value: score
      });

      const modeText = gameMode === 'adaptive' ? ' no modo adaptativo' : '';
      toast({
        title: "Sucesso!",
        description: `Sua pontuação de ${score} pontos foi salva no ranking${modeText}!`,
      });

      onSaved(playerDisplayName);
    } catch (error) {
      console.error('❌ Erro ao salvar pontuação:', error);
      
      trackEvent({
        action: 'score_save_error',
        category: 'Game',
        label: `ranking_submission_failed_${gameMode}_${saveMethod}`
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

      {!saveMethod && !user && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 text-center">
            Como você gostaria de salvar sua pontuação?
          </p>
          
          <div className="grid gap-3">
            <Button
              onClick={() => setSaveMethod('guest')}
              variant="outline"
              className="w-full p-4 h-auto flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-semibold">Nome + Instagram</span>
              </div>
              <span className="text-xs text-gray-500">
                Informe seu nome e @ do Instagram
              </span>
            </Button>
            
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full p-4 h-auto flex flex-col gap-2 bg-flu-grena hover:bg-flu-grena/90"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-semibold">Entrar com Google</span>
              </div>
              <span className="text-xs text-white/80">
                {isLoading ? "Entrando..." : "Faça login e adicione seu Instagram depois"}
              </span>
            </Button>
          </div>
        </div>
      )}

      {(saveMethod === 'guest' || showInstagramInput) && (
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
                disabled={isLoading || !!user}
                autoFocus={!user}
              />
            </div>
            {user && (
              <p className="text-xs text-gray-500">
                Nome preenchido automaticamente do seu perfil Google
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
              Instagram (opcional)
            </label>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
            <p className="text-xs text-gray-500">
              Seu @ do Instagram aparecerá no ranking junto com seu nome
            </p>
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
      )}
    </div>
  );
};
