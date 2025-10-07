import { useUIGameState } from "./game/use-ui-game-state";

interface UseGameStateProps {
  hasLost: boolean;
}

/**
 * Hook de gerenciamento de estado do jogo (UI).
 * 
 * @deprecated Use `useUIGameState` diretamente para novos componentes
 * @param {UseGameStateProps} props - Propriedades do hook
 * @returns Estado e ações de UI do jogo
 */
export const useGameState = ({ hasLost }: UseGameStateProps) => {
  return useUIGameState({ hasLost });
};
