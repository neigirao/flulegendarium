import { ReactNode, createContext, useContext, useState, useCallback, useEffect } from 'react';

export type OnboardingStep = 
  | 'welcome'
  | 'game-mode-selection'
  | 'name-input'
  | 'first-guess'
  | 'timer-explanation'
  | 'score-explanation'
  | 'completed';

interface OnboardingContextType {
  currentStep: OnboardingStep;
  isOnboardingActive: boolean;
  hasCompletedOnboarding: boolean;
  startOnboarding: () => void;
  nextStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  goToStep: (step: OnboardingStep) => void;
  isStepActive: (step: OnboardingStep) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = 'lendas-flu-onboarding-completed';
const STEP_ORDER: OnboardingStep[] = [
  'welcome',
  'game-mode-selection',
  'name-input',
  'first-guess',
  'timer-explanation',
  'score-explanation',
  'completed'
];

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);

  // Carregar estado de persistência
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (completed === 'true') {
      setHasCompletedOnboarding(true);
      setIsOnboardingActive(false);
    } else {
      setHasCompletedOnboarding(false);
    }
  }, []);

  const startOnboarding = useCallback(() => {
    setCurrentStep('welcome');
    setIsOnboardingActive(true);
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      const next = STEP_ORDER[currentIndex + 1];
      setCurrentStep(next);
      if (next === 'completed') {
        completeOnboarding();
      }
    }
  }, [currentStep]);

  const skipOnboarding = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasCompletedOnboarding(true);
    setIsOnboardingActive(false);
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasCompletedOnboarding(true);
    setIsOnboardingActive(false);
    setCurrentStep('completed');
  }, []);

  const goToStep = useCallback((step: OnboardingStep) => {
    setCurrentStep(step);
    if (!isOnboardingActive) {
      setIsOnboardingActive(true);
    }
  }, [isOnboardingActive]);

  const isStepActive = useCallback((step: OnboardingStep) => {
    return isOnboardingActive && currentStep === step;
  }, [isOnboardingActive, currentStep]);

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        isOnboardingActive,
        hasCompletedOnboarding,
        startOnboarding,
        nextStep,
        skipOnboarding,
        completeOnboarding,
        goToStep,
        isStepActive
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
