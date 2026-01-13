import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { JerseyYearOption } from '@/types/jersey-game';

interface JerseyYearOptionsProps {
  options: JerseyYearOption[];
  onSelectOption: (year: number) => void;
  disabled: boolean;
  isProcessing: boolean;
  selectedYear?: number | null;
  showResult: boolean;
  correctYear?: number;
}

/**
 * Componente de grid 2x2 com opções de ano para múltipla escolha
 */
export const JerseyYearOptions: React.FC<JerseyYearOptionsProps> = ({
  options,
  onSelectOption,
  disabled,
  isProcessing,
  selectedYear,
  showResult,
  correctYear,
}) => {
  const handleClick = useCallback((year: number) => {
    if (disabled || isProcessing || showResult) return;
    onSelectOption(year);
  }, [disabled, isProcessing, showResult, onSelectOption]);

  const getButtonStyle = (option: JerseyYearOption) => {
    const isSelected = selectedYear === option.year;
    const isCorrectOption = option.isCorrect;
    
    // Antes de mostrar resultado
    if (!showResult) {
      return cn(
        'relative flex items-center justify-center',
        'text-xl sm:text-2xl font-bold',
        'w-20 sm:w-24 h-14 sm:h-16',
        'rounded-xl border-2',
        'transition-all duration-200',
        'bg-card text-card-foreground border-border',
        'hover:bg-accent hover:border-accent-foreground/20',
        'active:scale-95',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer'
      );
    }
    
    // Após mostrar resultado
    if (isSelected && isCorrectOption) {
      // Selecionou o correto
      return cn(
        'relative flex items-center justify-center',
        'text-xl sm:text-2xl font-bold',
        'w-20 sm:w-24 h-14 sm:h-16',
        'rounded-xl border-2',
        'bg-flu-verde/20 text-flu-verde border-flu-verde',
        'ring-2 ring-flu-verde ring-offset-2 ring-offset-background'
      );
    }
    
    if (isSelected && !isCorrectOption) {
      // Selecionou o errado
      return cn(
        'relative flex items-center justify-center',
        'text-xl sm:text-2xl font-bold',
        'w-20 sm:w-24 h-14 sm:h-16',
        'rounded-xl border-2',
        'bg-destructive/20 text-destructive border-destructive'
      );
    }
    
    if (!isSelected && isCorrectOption) {
      // Revelar o correto quando errou
      return cn(
        'relative flex items-center justify-center',
        'text-xl sm:text-2xl font-bold',
        'w-20 sm:w-24 h-14 sm:h-16',
        'rounded-xl border-2',
        'bg-flu-verde/10 text-flu-verde border-flu-verde',
        'ring-2 ring-flu-verde/50'
      );
    }
    
    // Opções não selecionadas e incorretas
    return cn(
      'relative flex items-center justify-center',
      'text-xl sm:text-2xl font-bold',
      'w-20 sm:w-24 h-14 sm:h-16',
      'rounded-xl border-2',
      'bg-muted/50 text-muted-foreground border-border/50',
      'opacity-50'
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      <p className="text-sm text-muted-foreground text-center mb-3">
        Escolha o ano da camisa:
      </p>
      
      {/* 3 opções em linha, centralizadas */}
      <div className="flex justify-center gap-3 sm:gap-4">
        {options.map((option, index) => (
          <motion.button
            key={`${option.year}-${index}`}
            type="button"
            data-testid={`year-option-${option.year}`}
            onClick={() => handleClick(option.year)}
            disabled={disabled || isProcessing || showResult}
            className={getButtonStyle(option)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.2 }}
            whileHover={!disabled && !isProcessing && !showResult ? { scale: 1.02 } : undefined}
            whileTap={!disabled && !isProcessing && !showResult ? { scale: 0.98 } : undefined}
          >
            {option.year}
            
            {/* Indicador de seleção correta */}
            {showResult && option.isCorrect && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-flu-verde rounded-full flex items-center justify-center text-white text-xs"
              >
                ✓
              </motion.span>
            )}
            
            {/* Indicador de seleção errada */}
            {showResult && selectedYear === option.year && !option.isCorrect && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-white text-xs"
              >
                ✗
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
      
      {isProcessing && (
        <p className="text-sm text-muted-foreground text-center mt-3 animate-pulse">
          Verificando...
        </p>
      )}
    </div>
  );
};
