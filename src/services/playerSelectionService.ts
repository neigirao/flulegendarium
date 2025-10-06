/**
 * @fileoverview Serviço centralizado para lógica de seleção de jogadores
 * @module services/playerSelectionService
 * 
 * Este serviço consolida toda a lógica relacionada à seleção de jogadores,
 * incluindo seleção aleatória, filtragem por dificuldade, e controle de repetições.
 */

import { Player, DifficultyLevel } from "@/types/guess-game";
import { DecadePlayer, Decade } from "@/types/decade-game";

/**
 * Opções para seleção de jogadores
 */
export interface PlayerSelectionOptions {
  /** IDs de jogadores já utilizados (para evitar repetições) */
  usedPlayerIds?: Set<string>;
  /** Nível de dificuldade desejado */
  difficultyLevel?: DifficultyLevel;
  /** Década específica (para modo década) */
  decade?: Decade;
  /** Se deve evitar repetir o último jogador */
  avoidLastPlayer?: boolean;
  /** ID do último jogador selecionado */
  lastPlayerId?: string | null;
}

/**
 * Resultado da seleção de jogador
 */
export interface PlayerSelectionResult<T extends Player = Player> {
  /** Jogador selecionado */
  player: T | null;
  /** Jogadores disponíveis após filtragem */
  availablePlayers: T[];
  /** Se houve necessidade de reset do pool de jogadores */
  didReset: boolean;
  /** Mensagem de debug */
  debugMessage?: string;
}

/**
 * Classe principal do serviço de seleção de jogadores
 */
export class PlayerSelectionService {
  /**
   * Seleciona um jogador aleatório da lista fornecida
   * 
   * @template T - Tipo do jogador (Player ou DecadePlayer)
   * @param players - Lista de jogadores disponíveis
   * @param options - Opções de seleção
   * @returns Resultado da seleção com jogador e metadados
   * 
   * @example
   * ```typescript
   * const result = PlayerSelectionService.selectRandomPlayer(players, {
   *   usedPlayerIds: new Set(['player-1', 'player-2']),
   *   difficultyLevel: 'medio'
   * });
   * 
   * if (result.player) {
   *   console.log('Jogador selecionado:', result.player.name);
   * }
   * ```
   */
  static selectRandomPlayer<T extends Player>(
    players: T[],
    options: PlayerSelectionOptions = {}
  ): PlayerSelectionResult<T> {
    const {
      usedPlayerIds = new Set(),
      difficultyLevel,
      decade,
      avoidLastPlayer = true,
      lastPlayerId = null
    } = options;

    // Validação inicial
    if (!players || players.length === 0) {
      return {
        player: null,
        availablePlayers: [],
        didReset: false,
        debugMessage: '⚠️ Nenhum jogador disponível na lista'
      };
    }

    // Filtragem por década (se aplicável)
    let filteredPlayers = decade
      ? this.filterByDecade(players as DecadePlayer[], decade) as T[]
      : players;

    // Filtragem por dificuldade (se especificada)
    if (difficultyLevel) {
      const playersByDifficulty = this.filterByDifficulty(filteredPlayers, difficultyLevel);
      
      // Se encontrou jogadores da dificuldade, usa eles; senão, usa todos
      if (playersByDifficulty.length > 0) {
        filteredPlayers = playersByDifficulty;
      }
    }

    // Filtragem de jogadores já utilizados
    let availablePlayers = filteredPlayers.filter(
      player => !usedPlayerIds.has(player.id)
    );

    // Se todos foram usados, resetar o pool
    let didReset = false;
    if (availablePlayers.length === 0) {
      console.log('🔄 Todos os jogadores foram usados, resetando pool...');
      availablePlayers = filteredPlayers;
      didReset = true;
    }

    // Evitar repetir o último jogador (se possível)
    if (avoidLastPlayer && lastPlayerId && availablePlayers.length > 1) {
      const withoutLast = availablePlayers.filter(p => p.id !== lastPlayerId);
      if (withoutLast.length > 0) {
        availablePlayers = withoutLast;
      }
    }

    // Seleção aleatória
    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    const selectedPlayer = availablePlayers[randomIndex] || null;

    return {
      player: selectedPlayer,
      availablePlayers,
      didReset,
      debugMessage: selectedPlayer
        ? `✅ Jogador selecionado: ${selectedPlayer.name}`
        : '⚠️ Nenhum jogador disponível após filtragem'
    };
  }

  /**
   * Filtra jogadores por nível de dificuldade
   * 
   * @param players - Lista de jogadores
   * @param difficulty - Nível de dificuldade desejado
   * @returns Jogadores que correspondem à dificuldade
   */
  static filterByDifficulty<T extends Player>(
    players: T[],
    difficulty: DifficultyLevel
  ): T[] {
    return players.filter(player => player.difficulty_level === difficulty);
  }

  /**
   * Filtra jogadores por década
   * 
   * @param players - Lista de jogadores com informação de década
   * @param decade - Década desejada
   * @returns Jogadores que jogaram na década especificada
   */
  static filterByDecade(
    players: DecadePlayer[],
    decade: Decade
  ): DecadePlayer[] {
    return players.filter(player => 
      player.decades?.includes(decade) || player.decade === decade
    );
  }

  /**
   * Obtém jogadores por múltiplos níveis de dificuldade
   * 
   * @param players - Lista de jogadores
   * @param difficulties - Array de níveis de dificuldade permitidos
   * @returns Jogadores que correspondem a qualquer uma das dificuldades
   */
  static filterByMultipleDifficulties<T extends Player>(
    players: T[],
    difficulties: DifficultyLevel[]
  ): T[] {
    return players.filter(player => 
      player.difficulty_level && difficulties.includes(player.difficulty_level)
    );
  }

  /**
   * Seleciona múltiplos jogadores únicos
   * 
   * @param players - Lista de jogadores disponíveis
   * @param count - Número de jogadores a selecionar
   * @param options - Opções de seleção
   * @returns Array de jogadores selecionados
   */
  static selectMultiplePlayers<T extends Player>(
    players: T[],
    count: number,
    options: PlayerSelectionOptions = {}
  ): T[] {
    const selectedPlayers: T[] = [];
    const usedIds = new Set(options.usedPlayerIds);

    for (let i = 0; i < count; i++) {
      const result = this.selectRandomPlayer(players, {
        ...options,
        usedPlayerIds: usedIds,
        lastPlayerId: selectedPlayers[selectedPlayers.length - 1]?.id || null
      });

      if (result.player) {
        selectedPlayers.push(result.player);
        usedIds.add(result.player.id);
      } else {
        break; // Não há mais jogadores disponíveis
      }
    }

    return selectedPlayers;
  }

  /**
   * Valida se um jogador está disponível para seleção
   * 
   * @param player - Jogador a validar
   * @param options - Opções de validação
   * @returns Se o jogador está disponível
   */
  static isPlayerAvailable<T extends Player>(
    player: T,
    options: PlayerSelectionOptions = {}
  ): boolean {
    const { usedPlayerIds, difficultyLevel, decade, lastPlayerId } = options;

    // Verificar se já foi usado
    if (usedPlayerIds?.has(player.id)) {
      return false;
    }

    // Verificar se é o último jogador
    if (lastPlayerId && player.id === lastPlayerId) {
      return false;
    }

    // Verificar dificuldade
    if (difficultyLevel && player.difficulty_level !== difficultyLevel) {
      return false;
    }

    // Verificar década (se aplicável)
    if (decade && 'decades' in player) {
      const decadePlayer = player as unknown as DecadePlayer;
      if (!decadePlayer.decades?.includes(decade) && decadePlayer.decade !== decade) {
        return false;
      }
    }

    return true;
  }

  /**
   * Obtém estatísticas sobre a disponibilidade de jogadores
   * 
   * @param players - Lista de jogadores
   * @param options - Opções de filtragem
   * @returns Estatísticas de disponibilidade
   */
  static getAvailabilityStats<T extends Player>(
    players: T[],
    options: PlayerSelectionOptions = {}
  ): {
    total: number;
    available: number;
    used: number;
    byDifficulty: Record<DifficultyLevel, number>;
  } {
    const usedPlayerIds = options.usedPlayerIds || new Set();
    const available = players.filter(p => !usedPlayerIds.has(p.id));

    const byDifficulty: Record<string, number> = {};
    available.forEach(player => {
      if (player.difficulty_level) {
        byDifficulty[player.difficulty_level] = (byDifficulty[player.difficulty_level] || 0) + 1;
      }
    });

    return {
      total: players.length,
      available: available.length,
      used: usedPlayerIds.size,
      byDifficulty: byDifficulty as Record<DifficultyLevel, number>
    };
  }
}

/**
 * Instância singleton do serviço (opcional)
 * Para uso com métodos de instância se necessário no futuro
 */
export const playerSelectionService = new PlayerSelectionService();

/**
 * Funções auxiliares para uso direto (wrappers convenientes)
 */

/**
 * Seleciona um jogador aleatório (wrapper simplificado)
 */
export const selectRandomPlayer = PlayerSelectionService.selectRandomPlayer.bind(
  PlayerSelectionService
);

/**
 * Filtra jogadores por dificuldade (wrapper simplificado)
 */
export const filterByDifficulty = PlayerSelectionService.filterByDifficulty.bind(
  PlayerSelectionService
);

/**
 * Filtra jogadores por década (wrapper simplificado)
 */
export const filterByDecade = PlayerSelectionService.filterByDecade.bind(
  PlayerSelectionService
);
