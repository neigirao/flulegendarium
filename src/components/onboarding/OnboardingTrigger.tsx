import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from './OnboardingProvider';

export const OnboardingTrigger = () => {
  const { hasCompletedOnboarding, isOnboardingActive, startOnboarding, skipOnboarding } = useOnboarding();

  // Auto-iniciar onboarding para novos usuários após pequeno delay
  useEffect(() => {
    if (!hasCompletedOnboarding && !isOnboardingActive) {
      const timer = setTimeout(() => {
        startOnboarding();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding, isOnboardingActive, startOnboarding]);

  // Não mostrar se já completou ou se já está ativo
  if (hasCompletedOnboarding || isOnboardingActive) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-20 right-4 z-50"
      >
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">
                Primeira vez aqui?
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Deixe-nos guiar você pelo jogo!
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={startOnboarding}>
                  Iniciar Tour
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={skipOnboarding}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
