
import { useState, useEffect, useCallback, useRef } from "react";
import { Player } from "@/types/guess-game";

export const usePlayerSelection = (players: Player[] | undefined) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [playerChangeCount, setPlayerChangeCount] = useState(0);
  const usedPlayerIds = useRef<Set<string>>(new Set());

  console.log('🎯 usePlayerSelection hook:', {
    playersCount: players?.length || 0,
    currentPlayerName: currentPlayer?.name || 'null',
    playerChangeCount,
    usedPlayersCount: usedPlayerIds.current.size
  });

  const selectRandomPlayer = useCallback(() => {
    if (!players || players.length === 0) {
      console.warn('⚠️ selectRandomPlayer: Nenhum jogador disponível');
      setCurrentPlayer(null);
      return;
    }

    console.log('🎲 Selecionando jogador aleatório...', {
      totalPlayers: players.length,
      usedPlayers: usedPlayerIds.current.size
    });

    // Se todos os jogadores já foram usados, reiniciar
    if (usedPlayerIds.current.size >= players.length) {
      console.log('🔄 Todos os jogadores foram usados, reiniciando...');
      usedPlayerIds.current.clear();
    }

    // Filtrar jogadores não utilizados
    const availablePlayers = players.filter(player => !usedPlayerIds.current.has(player.id));
    
    if (availablePlayers.length === 0) {
      console.warn('⚠️ Nenhum jogador disponível após filtro');
      return;
    }

    // Selecionar jogador aleatório
    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    const selectedPlayer = availablePlayers[randomIndex];

    console.log('✅ Jogador selecionado:', {
      name: selectedPlayer.name,
      id: selectedPlayer.id,
      imageUrl: selectedPlayer.image_url
    });

    // Marcar como usado e atualizar estado
    usedPlayerIds.current.add(selectedPlayer.id);
    setCurrentPlayer(selectedPlayer);
    setPlayerChangeCount(prev => prev + 1);
  }, [players]);

  const handlePlayerImageFixed = useCallback(() => {
    console.log('🖼️ Imagem do jogador corrigida para:', currentPlayer?.name);
  }, [currentPlayer]);

  // Selecionar primeiro jogador quando a lista estiver disponível
  useEffect(() => {
    if (players && players.length > 0 && !currentPlayer) {
      console.log('🚀 Primeira seleção de jogador, total disponível:', players.length);
      selectRandomPlayer();
    }
  }, [players, currentPlayer, selectRandomPlayer]);

  return {
    currentPlayer,
    selectRandomPlayer,
    handlePlayerImageFixed,
    playerChangeCount
  };
};
