
import { useState, useEffect, useCallback, useRef } from "react";
import { DecadePlayer, Decade } from "@/types/decade-game";
import { decadePlayerService } from "@/services/decadePlayerService";
import { logger } from "@/utils/logger";

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
