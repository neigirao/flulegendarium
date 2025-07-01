
import { useState, useEffect, useCallback, useRef } from "react";
import { DecadePlayer, Decade } from "@/types/decade-game";
import { decadePlayerService } from "@/services/decadePlayerService";

export const useDecadePlayerSelection = (selectedDecade: Decade | null) => {
  const [availablePlayers, setAvailablePlayers] = useState<DecadePlayer[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<DecadePlayer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playerChangeCount, setPlayerChangeCount] = useState(0);
  const usedPlayerIds = useRef<Set<string>>(new Set());

  console.log('🎯 useDecadePlayerSelection hook:', {
    selectedDecade,
    playersCount: availablePlayers.length,
    currentPlayerName: currentPlayer?.name || 'null',
    playerChangeCount,
    usedPlayersCount: usedPlayerIds.current.size
  });

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
        console.log(`🔄 Carregando jogadores da década: ${selectedDecade}`);
        const players = await decadePlayerService.getPlayersByDecade(selectedDecade);
        setAvailablePlayers(players);
        usedPlayerIds.current.clear(); // Limpar histórico ao mudar década
        
        if (players.length > 0) {
          // Selecionar primeiro jogador automaticamente
          const firstPlayer = players[Math.floor(Math.random() * players.length)];
          setCurrentPlayer(firstPlayer);
          usedPlayerIds.current.add(firstPlayer.id);
          setPlayerChangeCount(1);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar jogadores por década:', error);
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
      console.warn('⚠️ Nenhum jogador disponível para seleção');
      return;
    }

    console.log('🎲 Selecionando jogador aleatório da década...', {
      totalPlayers: availablePlayers.length,
      usedPlayers: usedPlayerIds.current.size
    });

    // Se todos os jogadores já foram usados, reiniciar
    if (usedPlayerIds.current.size >= availablePlayers.length) {
      console.log('🔄 Todos os jogadores da década foram usados, reiniciando...');
      usedPlayerIds.current.clear();
    }

    // Filtrar jogadores não utilizados
    const availableForSelection = availablePlayers.filter(player => 
      !usedPlayerIds.current.has(player.id)
    );
    
    if (availableForSelection.length === 0) {
      console.warn('⚠️ Nenhum jogador disponível após filtro');
      return;
    }

    // Selecionar jogador aleatório
    const randomIndex = Math.floor(Math.random() * availableForSelection.length);
    const selectedPlayer = availableForSelection[randomIndex];

    console.log('✅ Jogador da década selecionado:', {
      name: selectedPlayer.name,
      decade: selectedPlayer.decade,
      id: selectedPlayer.id
    });

    // Marcar como usado e atualizar estado
    usedPlayerIds.current.add(selectedPlayer.id);
    setCurrentPlayer(selectedPlayer);
    setPlayerChangeCount(prev => prev + 1);
  }, [availablePlayers]);

  const handlePlayerImageFixed = useCallback(() => {
    console.log('🖼️ Imagem do jogador da década corrigida para:', currentPlayer?.name);
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
