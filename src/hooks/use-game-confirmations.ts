
import { useState } from "react";

interface ConfirmationState {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export const useGameConfirmations = () => {
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const showConfirmation = (config: Omit<ConfirmationState, 'open'>) => {
    setConfirmation({
      ...config,
      open: true,
    });
  };

  const hideConfirmation = () => {
    setConfirmation(prev => ({
      ...prev,
      open: false,
    }));
  };

  const confirmResetScore = (onConfirm: () => void) => {
    showConfirmation({
      title: "Resetar Pontuação",
      description: "Tem certeza que deseja resetar sua pontuação? Esta ação não pode ser desfeita.",
      onConfirm: () => {
        onConfirm();
        hideConfirmation();
      },
      confirmText: "Resetar",
      variant: "destructive"
    });
  };

  const confirmExitGame = (onConfirm: () => void) => {
    showConfirmation({
      title: "Sair do Jogo",
      description: "Tem certeza que deseja sair? Seu progresso atual será perdido.",
      onConfirm: () => {
        onConfirm();
        hideConfirmation();
      },
      confirmText: "Sair",
      variant: "destructive"
    });
  };

  const confirmNextPlayer = (onConfirm: () => void, currentScore: number) => {
    showConfirmation({
      title: "Próximo Jogador",
      description: `Deseja continuar jogando? Sua pontuação atual é ${currentScore} pontos.`,
      onConfirm: () => {
        onConfirm();
        hideConfirmation();
      },
      confirmText: "Continuar",
      cancelText: "Ficar"
    });
  };

  return {
    confirmation,
    showConfirmation,
    hideConfirmation,
    confirmResetScore,
    confirmExitGame,
    confirmNextPlayer,
  };
};
