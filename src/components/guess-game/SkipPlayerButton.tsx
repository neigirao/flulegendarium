import React from 'react';
import { Button } from '@/components/ui/button';
import { SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkipPlayerButtonProps {
  onSkip: () => void;
  skipsUsed: number;
  maxSkips: number;
  canSkip: boolean;
  skipPenalty: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Botão para pular o jogador atual com penalidade de pontos.
 */
export const SkipPlayerButton: React.FC<SkipPlayerButtonProps> = ({
  onSkip,
  skipsUsed,
  maxSkips,
  canSkip,
  skipPenalty,
  disabled = false,
  className,
}) => {
  const remainingSkips = maxSkips - skipsUsed;

  return (
    <Button
      data-testid="skip-button"
      variant="outline"
      size="sm"
      onClick={onSkip}
      disabled={disabled || !canSkip}
      className={cn(
        "gap-2 text-muted-foreground hover:text-foreground transition-colors",
        !canSkip && "opacity-50",
        className
      )}
      title={canSkip 
        ? `Pular jogador (-${skipPenalty} pts)` 
        : 'Limite de pulos atingido'
      }
    >
      <SkipForward className="h-4 w-4" />
      <span className="hidden sm:inline">
        Pular ({remainingSkips}/{maxSkips})
      </span>
      <span className="sm:hidden">
        {remainingSkips}/{maxSkips}
      </span>
    </Button>
  );
};
