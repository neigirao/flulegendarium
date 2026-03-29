import { cn } from "@/lib/utils";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ReactNode } from "react";

// Variantes de animação padronizadas para todos os jogos
// eslint-disable-next-line react-refresh/only-export-components
export const gameAnimationVariants = {
  // Fade in/out básico
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },

  // Slide de baixo para cima
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeOut" }
  },

  // Slide da direita
  slideInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: 0.3, ease: "easeOut" }
  },

  // Scale bounce para feedback de acerto
  scaleBounce: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },

  // Pop para notificações
  pop: {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
    transition: { type: "spring", stiffness: 400, damping: 25 }
  },

  // Shake para erros
  shake: {
    initial: { x: 0 },
    animate: { x: [0, -10, 10, -10, 10, 0] },
    exit: { x: 0 },
    transition: { duration: 0.4 }
  }
} as const;

type AnimationVariant = 'fadeIn' | 'slideUp' | 'slideInRight' | 'scaleBounce' | 'pop' | 'shake';

// Componente de container animado genérico
interface AnimatedContainerProps {
  children: ReactNode;
  variant?: AnimationVariant;
  className?: string;
  delay?: number;
}

export const AnimatedContainer = ({
  children,
  variant = "fadeIn",
  className,
  delay = 0
}: AnimatedContainerProps) => {
  const { initial, animate, exit, transition } = gameAnimationVariants[variant];
  
  return (
    <motion.div
      initial={initial}
      animate={animate}
      exit={exit}
      transition={{ ...transition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Componente para transição de jogadores/camisas
interface PlayerTransitionProps {
  children: ReactNode;
  gameKey: string | number;
  className?: string;
}

export const PlayerTransition = ({
  children,
  gameKey,
  className
}: PlayerTransitionProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={gameKey}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Componente para feedback de acerto/erro
interface FeedbackAnimationProps {
  isCorrect: boolean;
  show: boolean;
  className?: string;
}

export const FeedbackAnimation = ({
  isCorrect,
  show,
  className
}: FeedbackAnimationProps) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn(
        "fixed inset-0 flex items-center justify-center pointer-events-none z-50",
        className
      )}
    >
      <span className="text-8xl">
        {isCorrect ? "✅" : "❌"}
      </span>
    </motion.div>
  );
};

// Componente para contador/timer animado
interface AnimatedCounterProps {
  value: number;
  className?: string;
  critical?: boolean;
}

export const AnimatedCounter = ({
  value,
  className,
  critical = false
}: AnimatedCounterProps) => {
  return (
    <motion.span
      key={value}
      initial={{ y: -10, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
        scale: critical ? [1, 1.2, 1] : 1
      }}
      transition={{ duration: 0.2 }}
      className={cn(
        critical && "text-destructive font-bold",
        className
      )}
    >
      {value}
    </motion.span>
  );
};

// Componente para score animado
interface AnimatedScoreProps {
  score: number;
  previousScore?: number;
  className?: string;
}

export const AnimatedScore = ({
  score,
  previousScore,
  className
}: AnimatedScoreProps) => {
  const increased = previousScore !== undefined && score > previousScore;
  const diff = previousScore !== undefined ? score - previousScore : 0;

  return (
    <div className={cn("relative inline-flex items-center gap-2", className)}>
      <motion.span
        key={score}
        initial={{ scale: increased ? 1.3 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {score}
      </motion.span>
      
      {increased && diff > 0 && (
        <motion.span
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -20 }}
          transition={{ duration: 1 }}
          className="absolute -right-8 text-green-500 text-sm font-bold"
        >
          +{diff}
        </motion.span>
      )}
    </div>
  );
};

// Componente para streak com efeito de fogo
interface StreakIndicatorProps {
  streak: number;
  className?: string;
}

export const StreakIndicator = ({
  streak,
  className
}: StreakIndicatorProps) => {
  if (streak <= 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn("flex items-center gap-1", className)}
    >
      <motion.span
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [-5, 5, -5]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 0.5,
          ease: "easeInOut"
        }}
        className="text-2xl"
      >
        🔥
      </motion.span>
      <span className="font-bold text-orange-500">{streak}</span>
    </motion.div>
  );
};

export default {
  AnimatedContainer,
  PlayerTransition,
  FeedbackAnimation,
  AnimatedCounter,
  AnimatedScore,
  StreakIndicator,
  gameAnimationVariants
};
