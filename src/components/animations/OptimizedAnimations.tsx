import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';

// Componente para animações otimizadas de sucesso/erro
interface GameFeedbackAnimationProps {
  isCorrect: boolean | null;
  isVisible: boolean;
  onComplete?: () => void;
}

export const GameFeedbackAnimation: React.FC<GameFeedbackAnimationProps> = ({
  isCorrect,
  isVisible,
  onComplete
}) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && isCorrect !== null && (
        <motion.div
          key={`feedback-${isCorrect}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.2, 1],
            opacity: [0, 1, 1],
            rotate: isCorrect ? [0, 10, -10, 0] : [0, -5, 5, 0]
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ 
            duration: 0.6,
            ease: [0.23, 1, 0.32, 1]
          }}
          onAnimationComplete={onComplete}
          className={`
            fixed inset-0 flex items-center justify-center z-50 pointer-events-none
          `}
        >
          <motion.div
            className={`
              text-8xl font-bold transform
              ${isCorrect ? 'text-flu-verde' : 'text-destructive'}
            `}
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {isCorrect ? '🎉' : '😅'}
          </motion.div>
          
          {/* Partículas de celebração */}
          {isCorrect && (
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{
                    x: '50vw',
                    y: '50vh',
                    scale: 0
                  }}
                  animate={{
                    x: `${50 + (Math.random() - 0.5) * 80}vw`,
                    y: `${50 + (Math.random() - 0.5) * 80}vh`,
                    scale: [0, 1, 0],
                    rotate: 360
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.05,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Componente para transições suaves entre páginas
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: [0.23, 1, 0.32, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Loading skeleton animado
interface SkeletonLoadingProps {
  lines?: number;
  className?: string;
}

export const SkeletonLoading: React.FC<SkeletonLoadingProps> = ({ 
  lines = 3, 
  className = '' 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-muted rounded-md overflow-hidden relative"
          style={{ width: `${100 - (i * 10)}%` }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.1
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

// Card com hover effect otimizado
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  onClick,
  isSelected = false
}) => {
  return (
    <motion.div
      className={`
        cursor-pointer transition-shadow duration-300
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={{ 
        scale: 1.03,
        y: -5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.23, 1, 0.32, 1]
      }}
    >
      {children}
    </motion.div>
  );
};

// Contador animado
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const difference = value - startValue;

    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + difference * easeOut);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <span className={className}>{displayValue}</span>;
};

// Progress bar animada
interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  max = 100,
  className = '',
  showPercentage = false
}) => {
  const percentage = (value / max) * 100;

  return (
    <div className={`relative ${className}`}>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 1,
            ease: [0.23, 1, 0.32, 1]
          }}
        />
      </div>
      
      {showPercentage && (
        <motion.div
          className="absolute right-0 top-0 text-sm font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <AnimatedCounter value={Math.round(percentage)} />%
        </motion.div>
      )}
    </div>
  );
};

// Button com loading state animado
interface AnimatedButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  isLoading = false,
  onClick,
  className = '',
  disabled = false
}) => {
  return (
    <motion.button
      className={`
        relative overflow-hidden transition-colors duration-200
        ${disabled || isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        ${className}
      `}
      onClick={disabled || isLoading ? undefined : onClick}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      transition={{ duration: 0.1 }}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center"
          >
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 bg-white/20 rounded-full scale-0"
        whileTap={{ scale: 4, opacity: [0.5, 0] }}
        transition={{ duration: 0.4 }}
      />
    </motion.button>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    const element = document.querySelector('[data-scroll-animate]');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return isVisible;
};