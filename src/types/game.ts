/**
 * Tipos centralizados do sistema de jogo.
 * 
 * Este arquivo contém todas as interfaces e tipos relacionados ao
 * funcionamento dos modos de jogo.
 * 
 * @module types/game
 */

import { Player, DifficultyLevel } from './guess-game';
import { GameModeId } from '@/config/game-config';

/**
 * Configuração de um modo de jogo.
 */
export interface GameModeConfig {
  /** Identificador único do modo */
  id: GameModeId;
  /** Nome exibido ao usuário */
  name: string;
  /** Descrição do modo */
  description: string;
  /** Caminho da rota */
  path: string;
  /** Ícone representativo */
  icon: string;
  /** Duração do timer em segundos */
  timerDuration: number;
  /** Número máximo de tentativas (0 = ilimitado) */
  maxAttempts: number;
}

/**
 * Estado genérico de um jogo.
 * Pode ser estendido com metadata específica de cada modo.
 * 
 * @template T - Tipo da metadata adicional
 */
export interface GameState<T = Record<string, unknown>> {
  /** Modo de jogo atual */
  mode: GameModeConfig;
  /** Jogador sendo exibido */
  currentPlayer: Player | null;
  /** Pontuação atual */
  score: number;
  /** Se o jogo terminou */
  gameOver: boolean;
  /** Se o jogo está ativo */
  gameActive: boolean;
  /** Tempo restante em segundos */
  timeLeft: number;
  /** Streak de acertos consecutivos */
  currentStreak: number;
  /** Maior streak alcançado */
  maxStreak: number;
  /** Total de tentativas */
  totalAttempts: number;
  /** Total de acertos */
  correctGuesses: number;
  /** Metadata adicional específica do modo */
  metadata: T;
}

/**
 * Metadata específica do modo adaptativo.
 */
export interface AdaptiveGameMetadata {
  /** Nível de dificuldade atual */
  currentDifficulty: DifficultyLevel;
  /** Sequência de acertos consecutivos */
  correctSequence: number;
  /** Sequência de erros consecutivos */
  incorrectSequence: number;
  /** Progresso até próxima dificuldade (0-100) */
  difficultyProgress: number;
}

/**
 * Metadata específica do modo década.
 */
export interface DecadeGameMetadata {
  /** Década selecionada */
  selectedDecade: string;
  /** Jogadores disponíveis nessa década */
  availablePlayers: Player[];
  /** Total de jogadores nessa década */
  totalDecadePlayers: number;
}

/**
 * Estado completo do jogo adaptativo.
 */
export type AdaptiveGameState = GameState<AdaptiveGameMetadata>;

/**
 * Estado completo do jogo por década.
 */
export type DecadeGameState = GameState<DecadeGameMetadata>;

/**
 * Resultado de uma tentativa de palpite.
 */
export interface GuessResult {
  /** Se o palpite estava correto */
  isCorrect: boolean;
  /** Confiança do match (0-1) */
  confidence: number;
  /** Pontos ganhos (0 se errado) */
  pointsEarned: number;
  /** Tempo gasto na resposta */
  timeSpent: number;
  /** Nome correto do jogador */
  correctName: string;
  /** Palpite do usuário */
  userGuess: string;
}

/**
 * Informações de progresso do jogo.
 */
export interface GameProgressInfo {
  /** Rodada atual */
  currentRound: number;
  /** Streak atual */
  currentStreak: number;
  /** Dificuldades permitidas */
  allowedDifficulties: DifficultyLevel[];
  /** Threshold para próxima dificuldade */
  nextDifficultyThreshold: number;
}

/**
 * Dados de uma sessão de jogo completa.
 */
export interface GameSession {
  /** ID da sessão */
  id: string;
  /** ID do usuário (null para convidados) */
  userId: string | null;
  /** Nome do jogador */
  playerName: string;
  /** Modo de jogo */
  gameMode: GameModeId;
  /** Pontuação final */
  finalScore: number;
  /** Total de acertos */
  totalCorrect: number;
  /** Total de tentativas */
  totalAttempts: number;
  /** Maior streak */
  maxStreak: number;
  /** Duração em segundos */
  duration: number;
  /** Data de início */
  startedAt: Date;
  /** Data de fim */
  endedAt: Date;
}

/**
 * Dados de uma tentativa individual.
 */
export interface GameAttempt {
  /** ID da tentativa */
  id: string;
  /** ID da sessão */
  sessionId: string;
  /** Nome do jogador alvo */
  targetPlayerName: string;
  /** ID do jogador alvo */
  targetPlayerId: string;
  /** Palpite do usuário */
  guess: string;
  /** Se estava correto */
  isCorrect: boolean;
  /** Confiança do match */
  confidence: number;
  /** Tempo gasto */
  timeSpent: number;
  /** Pontos ganhos */
  pointsEarned: number;
  /** Número da tentativa */
  attemptNumber: number;
  /** Timestamp */
  createdAt: Date;
}

/**
 * Estatísticas agregadas de um jogador.
 */
export interface PlayerStats {
  /** ID do usuário */
  userId: string;
  /** Nome do jogador */
  playerName: string;
  /** Total de jogos */
  totalGames: number;
  /** Total de pontos */
  totalPoints: number;
  /** Maior pontuação */
  highScore: number;
  /** Taxa de acerto */
  accuracyRate: number;
  /** Tempo médio de resposta */
  avgResponseTime: number;
  /** Maior streak */
  maxStreak: number;
  /** Conquistas desbloqueadas */
  achievementsUnlocked: number;
  /** Posição no ranking */
  rankPosition: number;
}

/**
 * Opções de configuração ao iniciar um jogo.
 */
export interface GameStartOptions {
  /** Modo de jogo */
  mode: GameModeId;
  /** Dificuldade inicial (opcional) */
  initialDifficulty?: DifficultyLevel;
  /** Década (para modo década) */
  decade?: string;
  /** Se deve mostrar tutorial */
  showTutorial?: boolean;
}

/**
 * Callbacks de eventos do jogo.
 */
export interface GameEventCallbacks {
  /** Chamado quando o jogo inicia */
  onGameStart?: () => void;
  /** Chamado quando o jogo termina */
  onGameEnd?: (session: GameSession) => void;
  /** Chamado em cada acerto */
  onCorrectGuess?: (result: GuessResult) => void;
  /** Chamado em cada erro */
  onIncorrectGuess?: (result: GuessResult) => void;
  /** Chamado quando muda de dificuldade */
  onDifficultyChange?: (newLevel: DifficultyLevel, oldLevel: DifficultyLevel) => void;
  /** Chamado quando atinge um marco de streak */
  onStreakMilestone?: (streak: number) => void;
}
