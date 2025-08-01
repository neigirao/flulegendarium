import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface FeedbackState {
  type: 'success' | 'error' | 'timeout' | 'hint' | 'achievement';
  title: string;
  message: string;
  points?: number;
  streak?: number;
  show: boolean;
}

export const useUXFeedback = () => {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const { toast } = useToast();

  // Feedback para acerto
  const showSuccess = useCallback((points: number, streak?: number, playerName?: string) => {
    const streakBonus = streak && streak > 1 ? ` (${streak}x streak!)` : '';
    
    setFeedback({
      type: 'success',
      title: '🎉 Acertou!',
      message: playerName ? `Era ${playerName}!${streakBonus}` : `Resposta correta!${streakBonus}`,
      points,
      streak,
      show: true
    });

    // Toast para feedback rápido
    toast({
      title: "✅ Correto!",
      description: `+${points} pontos${streakBonus}`,
      duration: 2000,
    });
  }, [toast]);

  // Feedback para erro
  const showError = useCallback((correctAnswer?: string, hint?: string) => {
    setFeedback({
      type: 'error',
      title: '❌ Não foi dessa vez',
      message: correctAnswer ? `A resposta era: ${correctAnswer}` : 'Tente novamente!',
      show: true
    });

    // Toast com dica se disponível
    if (hint) {
      setTimeout(() => {
        toast({
          title: "💡 Dica",
          description: hint,
          duration: 3000,
        });
      }, 1500);
    }
  }, [toast]);

  // Feedback para timeout
  const showTimeout = useCallback((correctAnswer?: string) => {
    setFeedback({
      type: 'timeout',
      title: '⏰ Tempo esgotado!',
      message: correctAnswer ? `A resposta era: ${correctAnswer}` : 'Seja mais rápido na próxima!',
      show: true
    });
  }, []);

  // Feedback para conquista/achievement
  const showAchievement = useCallback((title: string, description: string, streak?: number) => {
    setFeedback({
      type: 'achievement',
      title: `🏆 ${title}`,
      message: description,
      streak,
      show: true
    });

    // Toast para achievement
    toast({
      title: `🏆 ${title}`,
      description: description,
      duration: 4000,
    });
  }, [toast]);

  // Feedback para dicas
  const showHint = useCallback((hint: string) => {
    setFeedback({
      type: 'hint',
      title: '💡 Dica',
      message: hint,
      show: true
    });
  }, []);

  // Fechar feedback
  const closeFeedback = useCallback(() => {
    setFeedback(prev => prev ? { ...prev, show: false } : null);
    // Limpar após animação
    setTimeout(() => setFeedback(null), 300);
  }, []);

  // Feedback com vibração (mobile)
  const triggerHapticFeedback = useCallback((type: 'success' | 'error' | 'warning' = 'success') => {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'success':
          navigator.vibrate([50, 50, 50]); // Padrão triplo
          break;
        case 'error':
          navigator.vibrate([100, 50, 100]); // Padrão de erro
          break;
        case 'warning':
          navigator.vibrate([200]); // Vibração longa
          break;
      }
    }
  }, []);

  // Feedback contextual baseado na performance
  const showContextualFeedback = useCallback((
    isCorrect: boolean, 
    score: number, 
    streak: number,
    timeRemaining: number,
    playerName?: string
  ) => {
    if (isCorrect) {
      let achievementTitle = '';
      let achievementDesc = '';
      
      // Verificar conquistas baseadas em performance
      if (streak >= 10) {
        achievementTitle = 'Sequência Incrível!';
        achievementDesc = `${streak} acertos seguidos - você é uma lenda!`;
        showAchievement(achievementTitle, achievementDesc, streak);
      } else if (streak >= 5) {
        achievementTitle = 'Em Chamas!';
        achievementDesc = `${streak} acertos seguidos - continue assim!`;
        showAchievement(achievementTitle, achievementDesc, streak);
      } else if (timeRemaining > 80) {
        achievementTitle = 'Resposta Relâmpago!';
        achievementDesc = 'Respondeu super rápido!';
        showAchievement(achievementTitle, achievementDesc);
      }
      
      // Calcular pontos com bônus
      const basePoints = 10;
      const streakBonus = Math.min(streak * 2, 20);
      const timeBonus = Math.floor(timeRemaining / 10);
      const totalPoints = basePoints + streakBonus + timeBonus;
      
      showSuccess(totalPoints, streak, playerName);
      triggerHapticFeedback('success');
    } else {
      showError(playerName);
      triggerHapticFeedback('error');
    }
  }, [showSuccess, showError, showAchievement, triggerHapticFeedback]);

  return {
    feedback,
    showSuccess,
    showError,
    showTimeout,
    showAchievement,
    showHint,
    showContextualFeedback,
    closeFeedback,
    triggerHapticFeedback
  };
};