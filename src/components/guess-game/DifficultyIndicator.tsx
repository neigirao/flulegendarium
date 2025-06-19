
import { memo } from 'react';
import { DifficultyLevel, GameProgressInfo } from '@/types/guess-game';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Define difficulty levels mapping
const DIFFICULTY_LEVELS: Record<string, DifficultyLevel> = {
  muito_facil: { level: 'muito_facil', label: 'Muito Fácil', color: 'text-green-600', icon: '⭐', multiplier: 1.0 },
  facil: { level: 'facil', label: 'Fácil', color: 'text-blue-600', icon: '⭐⭐', multiplier: 1.2 },
  medio: { level: 'medio', label: 'Médio', color: 'text-yellow-600', icon: '⭐⭐⭐', multiplier: 1.5 },
  dificil: { level: 'dificil', label: 'Difícil', color: 'text-orange-600', icon: '⭐⭐⭐⭐', multiplier: 2.0 },
  muito_dificil: { level: 'muito_dificil', label: 'Muito Difícil', color: 'text-red-600', icon: '⭐⭐⭐⭐⭐', multiplier: 3.0 }
};

interface DifficultyIndicatorProps {
  currentDifficulty: DifficultyLevel | null;
  gameProgress: GameProgressInfo;
  className?: string;
}

export const DifficultyIndicator = memo(({ 
  currentDifficulty, 
  gameProgress,
  className = '' 
}: DifficultyIndicatorProps) => {
  if (!currentDifficulty) return null;

  const progressToNext = Math.min(
    (gameProgress.currentStreak / gameProgress.nextDifficultyThreshold) * 100,
    100
  );

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`${currentDifficulty.color} border-current px-3 py-1`}
            >
              <span className="mr-1">{currentDifficulty.icon}</span>
              {currentDifficulty.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p><strong>Multiplicador:</strong> {currentDifficulty.multiplier}x</p>
              <p><strong>Rodada:</strong> {gameProgress.currentRound}</p>
              <p><strong>Sequência:</strong> {gameProgress.currentStreak}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {gameProgress.currentStreak < gameProgress.nextDifficultyThreshold && (
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Próximo nível:
          </span>
          <Progress 
            value={progressToNext} 
            className="h-2 flex-1 max-w-24"
          />
          <span className="text-xs text-muted-foreground">
            {gameProgress.currentStreak}/{gameProgress.nextDifficultyThreshold}
          </span>
        </div>
      )}
    </div>
  );
});

DifficultyIndicator.displayName = 'DifficultyIndicator';
