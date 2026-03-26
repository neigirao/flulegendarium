import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useOnboarding } from './OnboardingProvider';
import { Users, Shirt, Clock, Trophy, Zap, SkipForward, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const slides = [
  {
    title: 'Bem-vindo ao Lendas do Flu! ⚽',
    description: 'Teste seus conhecimentos sobre os maiores ídolos e camisas históricas do Fluminense Football Club.',
    icon: Trophy,
    details: [
      'De Castilho a Cano, passando por todas as eras',
      'Jogue de graça, sem cadastro',
      'Desafie amigos e entre no ranking',
    ],
  },
  {
    title: '3 Modos de Quiz',
    description: 'Escolha como quer provar que é um verdadeiro tricolor:',
    icon: Users,
    modes: [
      { icon: Users, label: 'Jogadores', desc: 'Adivinhe o ídolo pela foto' },
      { icon: Clock, label: 'Por Década', desc: 'Filtre por era tricolor' },
      { icon: Shirt, label: 'Camisas', desc: 'Identifique o ano do uniforme' },
    ],
  },
  {
    title: 'Dicas para Jogar',
    description: 'Maximize sua pontuação com essas dicas:',
    icon: Zap,
    tips: [
      { icon: Clock, text: 'Responda rápido — o timer conta!' },
      { icon: Zap, text: 'Combos de acertos multiplicam pontos' },
      { icon: SkipForward, text: 'Não sabe? Pule sem perder o streak' },
    ],
  },
];

export const WelcomeOverlay = () => {
  const { isOnboardingActive, currentStep, nextStep, skipOnboarding } = useOnboarding();
  const [slideIndex, setSlideIndex] = useState(0);

  if (!isOnboardingActive || currentStep !== 'welcome') return null;

  const isLast = slideIndex === slides.length - 1;
  const slide = slides[slideIndex];

  const handleNext = () => {
    if (isLast) {
      nextStep();
    } else {
      setSlideIndex((i) => i + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Skip button */}
        <div className="flex justify-end p-3 pb-0">
          <button
            onClick={skipOnboarding}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
          >
            Pular tutorial
          </button>
        </div>

        {/* Slide content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIndex}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="px-6 pb-6 pt-2"
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <slide.icon className="w-8 h-8 text-primary" />
              </div>
            </div>

            <h2 className="text-display-sm text-foreground text-center mb-2 font-display">
              {slide.title}
            </h2>
            <p className="text-muted-foreground text-center text-sm mb-6 font-body">
              {slide.description}
            </p>

            {/* Slide 1 — details list */}
            {slide.details && (
              <ul className="space-y-2 mb-6">
                {slide.details.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                    <span className="text-primary">✦</span> {d}
                  </li>
                ))}
              </ul>
            )}

            {/* Slide 2 — game modes */}
            {slide.modes && (
              <div className="space-y-3 mb-6">
                {slide.modes.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <m.icon className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Slide 3 — tips */}
            {slide.tips && (
              <div className="space-y-3 mb-6">
                {slide.tips.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                    <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center shrink-0">
                      <t.icon className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    {t.text}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer — dots + button */}
        <div className="px-6 pb-6 flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  i === slideIndex ? "bg-primary w-6" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          <Button onClick={handleNext} className="gap-1 font-display">
            {isLast ? 'Começar a Jogar!' : 'Próximo'}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
