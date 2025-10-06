import { useState, useEffect, useCallback, useRef } from "react";
import { DecadePlayer, Decade } from "@/types/decade-game";
import { decadePlayerService } from "@/services/decadePlayerService";
import { logger } from "@/utils/logger";

/**
 * Hook para seleção de jogadores no modo Quiz por Década.
 * 
 * Gerencia a seleção de jogadores filtrados por década histórica:
 * - Carrega jogadores quando a década é selecionada
 * - Controla jogadores já utilizados na partida
 * - Garante que não há repetição na mesma partida
 * - Seleciona primeiro jogador automaticamente
 * 
 * ### Fluxo de Funcionamento
 * 1. Usuário seleciona uma década (ex: 1990s)
 * 2. Hook carrega jogadores daquela época
 * 3. Seleciona primeiro jogador aleatoriamente
 * 4. Marca jogador como usado
 * 5. A cada acerto, seleciona próximo jogador não usado
 * 
 * ### Controle de Repetição
 * - Mantém Set de IDs usados internamente
 * - Limpa histórico apenas ao trocar de década
 * - Jogo termina quando todos foram mostrados
 * 
 * @param {Decade | null} selectedDecade - Década selecionada (ex: '1990s')
 * 
 * @returns {Object} Estado de seleção de jogadores da década
 * @returns {DecadePlayer[]} availablePlayers - Todos os jogadores da década
 * @returns {DecadePlayer | null} currentPlayer - Jogador atual
 * @returns {boolean} isLoading - Se está carregando jogadores
 * @returns {number} playerChangeCount - Contador de trocas (para forçar re-render)
 * @returns {Function} selectRandomPlayer - Seleciona próximo jogador aleatório
 * @returns {Function} handlePlayerImageFixed - Callback de imagem carregada
 * 
 * @example
 * ```tsx
 * const {
 *   availablePlayers,
 *   currentPlayer,
 *   isLoading,
 *   selectRandomPlayer
 * } = useDecadePlayerSelection('1990s');
 * 
 * // Após acerto, selecionar próximo
 * if (isCorrect) {
 *   selectRandomPlayer();
 * }
 * 
 * // Verificar se acabaram os jogadores
 * if (!currentPlayer && !isLoading) {
 *   console.log('Todos os jogadores foram mostrados!');
 * }
 * ```
 * 
 * @see {@link DecadePlayer} Tipo do jogador da década
 * @see {@link decadePlayerService} Serviço de busca de jogadores
 */
export const useDecadePlayerSelection = (selectedDecade: Decade | null) => {
  const [availablePlayers, setAvailablePlayers] = useState<DecadePlayer[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<DecadePlayer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playerChangeCount, setPlayerChangeCount] = useState(0);
  const usedPlayerIds = useRef<Set<string>>(new Set());

  // Carregar jogadores quando a década mudar
  useEffect(() => {
    const loadPlayersByDecade = async () => {
      if (!selectedDecade) {
        setAvailablePlayers([]);
        setCurrentPlayer(null);
        return;
      }

      setIsLoading(true);
      try {
        const players = await decadePlayerService.getPlayersByDecade(selectedDecade);
        setAvailablePlayers(players);
        usedPlayerIds.current.clear(); // Limpar histórico apenas ao mudar década
        
        if (players.length > 0) {
          // Selecionar primeiro jogador automaticamente
          const firstPlayer = players[Math.floor(Math.random() * players.length)];
          setCurrentPlayer(firstPlayer);
          usedPlayerIds.current.add(firstPlayer.id);
          setPlayerChangeCount(1);
        }
      } catch (error) {
        logger.error(`Error loading decade players for ${selectedDecade}`);
        setAvailablePlayers([]);
        setCurrentPlayer(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayersByDecade();
  }, [selectedDecade]);

  /**
   * Seleciona um jogador aleatório dentre os não utilizados.
   * 
   * Se todos os jogadores já foram usados, não faz nada (fim de jogo).
   * 
   * @example
   * ```typescript
   * // Após acerto correto
   * selectRandomPlayer();
   * ```
   */
  const selectRandomPlayer = useCallback(() => {
    if (!availablePlayers || availablePlayers.length === 0) {
      return;
    }

    // Se todos os jogadores já foram usados nesta partida, não reiniciar
    // O jogo deve acabar quando todos os jogadores foram mostrados
    if (usedPlayerIds.current.size >= availablePlayers.length) {
      return; // Não há mais jogadores disponíveis nesta partida
    }

    // Filtrar jogadores não utilizados nesta partida
    const availableForSelection = availablePlayers.filter(player => 
      !usedPlayerIds.current.has(player.id)
    );
    
    if (availableForSelection.length === 0) {
      return; // Não há mais jogadores disponíveis
    }

    // Selecionar jogador aleatório
    const randomIndex = Math.floor(Math.random() * availableForSelection.length);
    const selectedPlayer = availableForSelection[randomIndex];

    // Marcar como usado e atualizar estado
    usedPlayerIds.current.add(selectedPlayer.id);
    setCurrentPlayer(selectedPlayer);
    setPlayerChangeCount(prev => prev + 1);
  }, [availablePlayers]);

  const handlePlayerImageFixed = useCallback(() => {
    // Image loaded successfully
  }, [currentPlayer]);

  return {
    availablePlayers,
    currentPlayer,
    isLoading,
    selectRandomPlayer,
    handlePlayerImageFixed,
    playerChangeCount
  };
};
