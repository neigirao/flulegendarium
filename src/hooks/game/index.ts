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
