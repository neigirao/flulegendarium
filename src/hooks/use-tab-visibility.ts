
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface UseTabVisibilityProps {
  onTabChange?: () => void;
  isGameActive?: boolean;
}

export const useTabVisibility = ({ onTabChange, isGameActive = false }: UseTabVisibilityProps = {}) => {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const { toast } = useToast();

  const handleVisibilityChange = useCallback(() => {
    const isCurrentlyVisible = !document.hidden;
    setIsVisible(isCurrentlyVisible);
    
    // Se o jogo está ativo e o usuário saiu da aba
    if (isGameActive && !isCurrentlyVisible) {
      toast({
        variant: "destructive",
        title: "Game Over!",
        description: "Você não pode trocar de aba durante o jogo. O jogo foi encerrado.",
      });
      
      // Chama o callback para encerrar o jogo
      if (onTabChange) {
        onTabChange();
      }
    }
  }, [isGameActive, onTabChange, toast]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return { isVisible };
};
