
import { useCallback } from "react";
import { useAnalytics } from "@/hooks/use-analytics";

interface UseGameHandlersProps {
  user: any;
  trackGameStart: (mode: string) => void;
  handleTutorialComplete: (user: any) => void;
  handleSkipTutorial: (user: any) => void;
  handleGameOverClose: (selectRandomPlayer: () => void) => void;
  selectRandomPlayer: () => void;
}

export const useGameHandlers = ({
  user,
  trackGameStart,
  handleTutorialComplete,
  handleSkipTutorial,
  handleGameOverClose,
  selectRandomPlayer
}: UseGameHandlersProps) => {
  
  const onTutorialComplete = useCallback(() => {
    handleTutorialComplete(user);
    trackGameStart('authenticated_game');
  }, [user, handleTutorialComplete, trackGameStart]);

  const onSkipTutorial = useCallback(() => {
    handleSkipTutorial(user);
    trackGameStart('guest_game');
  }, [user, handleSkipTutorial, trackGameStart]);

  const onGameOverClose = useCallback(() => {
    handleGameOverClose(selectRandomPlayer);
  }, [handleGameOverClose, selectRandomPlayer]);

  return {
    onTutorialComplete,
    onSkipTutorial,
    onGameOverClose
  };
};
