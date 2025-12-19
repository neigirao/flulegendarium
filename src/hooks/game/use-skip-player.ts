import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface UseSkipPlayerOptions {
  maxSkips?: number;
  skipPenalty?: number;
  onSkip?: () => void;
}

interface UseSkipPlayerReturn {
  skipsUsed: number;
  maxSkips: number;
  canSkip: boolean;
  skipPenalty: number;
  handleSkip: () => boolean;
  resetSkips: () => void;
}

/**
 * Hook para gerenciar a funcionalidade de pular jogadores no jogo.
 * 
 * @param options Configurações do skip (máximo de pulos e penalidade)
 * @returns Estado e ações para gerenciar pulos
 */
export const useSkipPlayer = (options: UseSkipPlayerOptions = {}): UseSkipPlayerReturn => {
  const { maxSkips = 1, skipPenalty = 100, onSkip } = options;
  const [skipsUsed, setSkipsUsed] = useState(0);
  const { toast } = useToast();

  const canSkip = skipsUsed < maxSkips;

  const handleSkip = useCallback(() => {
    if (!canSkip) {
      toast({
        variant: "destructive",
        title: "Limite atingido",
        description: `Você já usou ${maxSkips === 1 ? 'seu pulo' : `seus ${maxSkips} pulos`} nesta partida.`,
      });
      return false;
    }

    setSkipsUsed(prev => prev + 1);
    
    toast({
      title: "Jogador pulado",
      description: `Penalidade de -${skipPenalty} pontos aplicada.`,
    });

    logger.info('Player skipped', 'SkipPlayer', { 
      skipsUsed: skipsUsed + 1, 
      maxSkips,
      penalty: skipPenalty 
    });

    onSkip?.();
    return true;
  }, [canSkip, maxSkips, skipPenalty, skipsUsed, toast, onSkip]);

  const resetSkips = useCallback(() => {
    setSkipsUsed(0);
  }, []);

  return {
    skipsUsed,
    maxSkips,
    canSkip,
    skipPenalty,
    handleSkip,
    resetSkips,
  };
};
