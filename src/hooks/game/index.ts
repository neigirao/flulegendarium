/**
 * Game hooks barrel export
 * 
 * Centraliza todos os hooks relacionados ao gerenciamento de estado do jogo.
 */

export { useBaseGameState } from './use-base-game-state';
export type { BaseGameConfig, BaseGameState } from './use-base-game-state';

export { useUIGameState } from './use-ui-game-state';
export type { UIGameState } from './use-ui-game-state';

export { useAdaptiveGuessGame } from '../use-adaptive-guess-game';
export { useDecadeGameState } from '../use-decade-game-state';
export { useDecadePlayerSelection } from '../use-decade-player-selection';
export { useSimpleGameLogic } from '../use-simple-game-logic';
export { useSimpleGameCallbacks } from '../use-simple-game-callbacks';
export { useSimpleGameMetrics } from '../use-simple-game-metrics';
export { useDecadeGameTimer } from '../use-decade-game-timer';
export { useGameConfirmations } from '../use-game-confirmations';
export { useAchievements } from '../use-achievements';
export { useDevToolsDetection } from '../use-devtools-detection';

// Jersey Quiz hooks
export { useJerseysData } from '../use-jerseys-data';
export { useJerseySelection } from '../use-jersey-selection';
export { useJerseyGuessGame } from '../use-jersey-guess-game';

// Skip Player hook
export { useSkipPlayer } from './use-skip-player';
