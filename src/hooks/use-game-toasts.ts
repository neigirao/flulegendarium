import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

type ToastVariant = 'default' | 'destructive';

interface GameToastOptions {
  duration?: number;
}

/**
 * Hook padronizado para toasts de jogos
 * Garante consistência visual e de mensagens em todos os modos de jogo
 */
export const useGameToasts = () => {
  const { toast } = useToast();

  // Acerto
  const showCorrectGuess = useCallback((playerName: string, points?: number, options?: GameToastOptions) => {
    toast({
      title: "✅ Acertou!",
      description: points 
        ? `${playerName} - +${points} pontos!` 
        : `Você acertou: ${playerName}`,
      duration: options?.duration ?? 3000,
    });
  }, [toast]);

  // Erro
  const showWrongGuess = useCallback((options?: GameToastOptions) => {
    toast({
      variant: "destructive",
      title: "❌ Errou!",
      description: "Tente novamente ou aguarde a próxima rodada.",
      duration: options?.duration ?? 2500,
    });
  }, [toast]);

  // Tempo esgotado
  const showTimeUp = useCallback((correctAnswer?: string, options?: GameToastOptions) => {
    toast({
      variant: "destructive",
      title: "⏰ Tempo Esgotado!",
      description: correctAnswer 
        ? `A resposta era: ${correctAnswer}` 
        : "O tempo acabou!",
      duration: options?.duration ?? 3500,
    });
  }, [toast]);

  // Novo recorde
  const showNewRecord = useCallback((score: number, options?: GameToastOptions) => {
    toast({
      title: "🏆 Novo Recorde!",
      description: `Parabéns! Você fez ${score} pontos!`,
      duration: options?.duration ?? 4000,
    });
  }, [toast]);

  // Streak alcançada
  const showStreakAchieved = useCallback((streak: number, options?: GameToastOptions) => {
    toast({
      title: "🔥 Sequência!",
      description: `${streak} acertos seguidos!`,
      duration: options?.duration ?? 2500,
    });
  }, [toast]);

  // Nível de dificuldade aumentou
  const showDifficultyUp = useCallback((newLevel: string, options?: GameToastOptions) => {
    toast({
      title: "📈 Dificuldade Aumentou!",
      description: `Novo nível: ${newLevel}`,
      duration: options?.duration ?? 3000,
    });
  }, [toast]);

  // Nível de dificuldade diminuiu
  const showDifficultyDown = useCallback((newLevel: string, options?: GameToastOptions) => {
    toast({
      title: "📉 Dificuldade Reduzida",
      description: `Novo nível: ${newLevel}`,
      duration: options?.duration ?? 3000,
    });
  }, [toast]);

  // Pular jogador
  const showSkipUsed = useCallback((penalty: number, skipsRemaining: number, options?: GameToastOptions) => {
    toast({
      title: "⏭️ Jogador Pulado",
      description: penalty > 0 
        ? `-${penalty} pontos. Pulos restantes: ${skipsRemaining}` 
        : `Pulos restantes: ${skipsRemaining}`,
      duration: options?.duration ?? 2500,
    });
  }, [toast]);

  // Jogo encerrado por devtools
  const showDevToolsDetected = useCallback((options?: GameToastOptions) => {
    toast({
      variant: "destructive",
      title: "🚫 Jogo Encerrado",
      description: "Uso de ferramentas de inspeção detectado.",
      duration: options?.duration ?? 5000,
    });
  }, [toast]);

  // Sucesso genérico
  const showSuccess = useCallback((title: string, description?: string, options?: GameToastOptions) => {
    toast({
      title: `✅ ${title}`,
      description,
      duration: options?.duration ?? 3000,
    });
  }, [toast]);

  // Erro genérico
  const showError = useCallback((title: string, description?: string, options?: GameToastOptions) => {
    toast({
      variant: "destructive",
      title: `❌ ${title}`,
      description,
      duration: options?.duration ?? 4000,
    });
  }, [toast]);

  // Info genérico
  const showInfo = useCallback((title: string, description?: string, options?: GameToastOptions) => {
    toast({
      title: `ℹ️ ${title}`,
      description,
      duration: options?.duration ?? 3000,
    });
  }, [toast]);

  return {
    // Game specific
    showCorrectGuess,
    showWrongGuess,
    showTimeUp,
    showNewRecord,
    showStreakAchieved,
    showDifficultyUp,
    showDifficultyDown,
    showSkipUsed,
    showDevToolsDetected,
    // Generic
    showSuccess,
    showError,
    showInfo,
  };
};

export default useGameToasts;
