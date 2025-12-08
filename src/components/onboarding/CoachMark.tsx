import { ReactNode, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding, OnboardingStep } from './OnboardingProvider';

interface CoachMarkProps {
  step: OnboardingStep;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
  showSkip?: boolean;
  isLastStep?: boolean;
}

export const CoachMark = ({
  step,
  title,
  description,
  position = 'bottom',
  children,
  showSkip = true,
  isLastStep = false
}: CoachMarkProps) => {
  const { isStepActive, nextStep, skipOnboarding, completeOnboarding } = useOnboarding();
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const targetRef = useRef<HTMLDivElement>(null);
  const isActive = isStepActive(step);

  useEffect(() => {
    if (isActive && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top + scrollY - 120;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + scrollY + 12;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'left':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.left + scrollX - 280;
          break;
        case 'right':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.right + scrollX + 12;
          break;
      }

      setTooltipPosition({ top, left });
    }
  }, [isActive, position]);

  const handleNext = () => {
    if (isLastStep) {
      completeOnboarding();
    } else {
      nextStep();
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return '-translate-x-1/2';
      case 'bottom':
        return '-translate-x-1/2';
      case 'left':
        return '-translate-y-1/2';
      case 'right':
        return '-translate-y-1/2';
      default:
        return '-translate-x-1/2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-transparent border-r-transparent border-b-transparent border-t-primary';
      case 'bottom':
        return 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-transparent border-r-transparent border-t-transparent border-b-primary';
      case 'left':
        return 'right-0 top-1/2 translate-x-full -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-primary';
      case 'right':
        return 'left-0 top-1/2 -translate-x-full -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-primary';
      default:
        return '';
    }
  };

  return (
    <div ref={targetRef} className="relative inline-block">
      {/* Highlight ring quando ativo */}
      <div className={`${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg' : ''}`}>
        {children}
      </div>

      {/* Overlay escuro */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-50 w-72 ${getPositionClasses()}`}
            style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
          >
            <div className="bg-primary text-primary-foreground rounded-lg shadow-xl p-4">
              {/* Arrow */}
              <div className={`absolute w-0 h-0 border-8 ${getArrowClasses()}`} />
              
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-lg">{title}</h4>
                <button
                  onClick={skipOnboarding}
                  className="p-1 hover:bg-primary-foreground/20 rounded transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-primary-foreground/90 mb-4">
                {description}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between">
                {showSkip && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipOnboarding}
                    className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <SkipForward className="w-4 h-4 mr-1" />
                    Pular
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="ml-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  {isLastStep ? 'Concluir' : 'Próximo'}
                  {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
