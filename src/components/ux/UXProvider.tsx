import { ReactNode, createContext, useContext } from 'react';
import { useUXFeedback } from '@/hooks/use-ux-feedback';
import { EnhancedFeedback } from './EnhancedFeedback';
import { AchievementSystemProvider } from '@/components/achievements/AchievementSystemProvider';
import { OnboardingProvider, OnboardingTrigger, WelcomeOverlay } from '@/components/onboarding';

interface UXContextType {
  showSuccess: (points: number, streak?: number, playerName?: string) => void;
  showError: (correctAnswer?: string, hint?: string) => void;
  showTimeout: (correctAnswer?: string) => void;
  showAchievement: (title: string, description: string, streak?: number) => void;
  showHint: (hint: string) => void;
  showContextualFeedback: (
    isCorrect: boolean, 
    score: number, 
    streak: number,
    timeRemaining: number,
    playerName?: string
  ) => void;
  triggerHapticFeedback: (type?: 'success' | 'error' | 'warning') => void;
}

const UXContext = createContext<UXContextType | undefined>(undefined);

interface UXProviderProps {
  children: ReactNode;
}

export const UXProvider = ({ children }: UXProviderProps) => {
  const {
    feedback,
    showSuccess,
    showError,
    showTimeout,
    showAchievement,
    showHint,
    showContextualFeedback,
    closeFeedback,
    triggerHapticFeedback
  } = useUXFeedback();

  const contextValue: UXContextType = {
    showSuccess,
    showError,
    showTimeout,
    showAchievement,
    showHint,
    showContextualFeedback,
    triggerHapticFeedback
  };

  return (
    <UXContext.Provider value={contextValue}>
      <OnboardingProvider>
        <AchievementSystemProvider>
          {children}
          
          {/* Feedback overlay global */}
          {feedback && (
            <EnhancedFeedback
              feedback={feedback}
              show={feedback.show}
              onClose={closeFeedback}
            />
          )}
          
          {/* Onboarding trigger para novos usuários */}
          <OnboardingTrigger />
        </AchievementSystemProvider>
      </OnboardingProvider>
    </UXContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUX = () => {
  const context = useContext(UXContext);
  if (context === undefined) {
    throw new Error('useUX must be used within a UXProvider');
  }
  return context;
};