import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { JerseyYearOption } from '@/types/jersey-game';

interface JerseyYearOptionsProps {
  options: JerseyYearOption[];
  /** Called when user clicks a card (before confirm) */
  onPendingSelect: (year: number) => void;
  pendingYear: number | null;
  disabled: boolean;
  isProcessing: boolean;
  selectedYear?: number | null;
  showResult: boolean;
}

function getDecadeLabel(year: number): { tag: string; icon: string } {
  const d = Math.floor(year / 10) * 10;
  const map: Record<number, { tag: string; icon: string }> = {
    1970: { tag: 'Anos 70', icon: '🌟' },
    1980: { tag: 'Anos 80', icon: '🏆' },
    1990: { tag: 'Anos 90', icon: '⚽' },
    2000: { tag: 'Anos 2000', icon: '🎯' },
    2010: { tag: 'Anos 2010', icon: '🚀' },
    2020: { tag: 'Anos 2020', icon: '💫' },
  };
  return map[d] ?? { tag: `Anos ${d}`, icon: '👕' };
}

export const JerseyYearOptions: React.FC<JerseyYearOptionsProps> = ({
  options,
  onPendingSelect,
  pendingYear,
  disabled,
  isProcessing,
  selectedYear,
  showResult,
}) => {
  const handleClick = useCallback((year: number) => {
    if (disabled || isProcessing || showResult) return;
    onPendingSelect(year);
  }, [disabled, isProcessing, showResult, onPendingSelect]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {options.map((option) => {
        const { tag, icon } = getDecadeLabel(option.year);
        const isPending = pendingYear === option.year && !showResult;
        const isResultSelected = showResult && selectedYear === option.year;
        const isCorrectReveal = showResult && option.isCorrect;
        const isWrongSelected = isResultSelected && !option.isCorrect;

        const cardClass = cn(
          'flex gap-4 items-center rounded-2xl border-2 px-5 py-4 text-left transition-all duration-200 w-full',
          // Idle
          !showResult && !isPending && 'bg-card border-border hover:-translate-y-0.5 hover:shadow-lg cursor-pointer',
          // Pending selection
          isPending && 'bg-gradient-to-br from-primary/4 to-card border-primary shadow-[0_6px_20px_rgba(122,2,19,0.15)] cursor-pointer',
          // Correct reveal
          isCorrectReveal && 'border-[#22C55E] bg-gradient-to-br from-[rgba(34,197,94,0.05)] to-card',
          // Wrong selected
          isWrongSelected && 'border-destructive bg-gradient-to-br from-destructive/4 to-card opacity-70',
          // Other disabled (not correct, not selected)
          showResult && !isCorrectReveal && !isWrongSelected && 'border-border bg-muted/30 opacity-40 cursor-default',
          // Disabled before result
          disabled && !showResult && 'opacity-50 cursor-not-allowed',
        );

        const yearColor = cn(
          'font-display text-[38px] leading-none flex-shrink-0 min-w-[74px]',
          isCorrectReveal && 'text-[#22C55E]',
          isWrongSelected && 'text-destructive',
          !showResult && isPending && 'text-primary',
          !showResult && !isPending && 'text-primary',
        );

        return (
          <button
            key={option.year}
            type="button"
            data-testid={`year-option-${option.year}`}
            onClick={() => handleClick(option.year)}
            disabled={disabled || isProcessing || showResult}
            className={cardClass}
          >
            {/* Year */}
            <div className={yearColor}>{option.year}</div>

            {/* Body */}
            <div className="flex-1 min-w-0">
              <span className={cn(
                'inline-block text-[9px] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-md mb-1.5',
                'bg-muted/60 text-muted-foreground'
              )}>
                {tag}
              </span>
              <div className="text-[13px] font-semibold text-foreground leading-tight">
                Era {option.year}
              </div>
            </div>

            {/* Icon / result indicator */}
            <div className="text-lg flex-shrink-0 opacity-40">
              {showResult && isCorrectReveal ? '✓' : showResult && isWrongSelected ? '✕' : icon}
            </div>
          </button>
        );
      })}

      {isProcessing && (
        <p className="text-sm text-muted-foreground text-center animate-pulse">Verificando...</p>
      )}
    </div>
  );
};
