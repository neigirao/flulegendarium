
import { useState, useEffect, useCallback } from "react";
import { Player } from "@/types/guess-game";

export const useDirectPlayerSelection = (players: Player[]) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [usedPlayerIds, setUsedPlayerIds] = useState<Set<string>>(new Set());

  console.log('🎯 useDirectPlayerSelection - ESTADO ATUAL:', {
    playersRecebidos: players ? players.length : 'undefined',
    playersArray: players,
    currentPlayerName: currentPlayer?.name || 'null',
    currentPlayerId: currentPlayer?.id || 'null',
    usedCount: usedPlayerIds.size,
    timestamp: new Date().toISOString()
  });

  const selectRandomPlayer = useCallback(() => {
    console.log('🎲 INICIANDO selectRandomPlayer');
    console.log('🎲 Players disponíveis:', players ? players.length : 'undefined');
    console.log('🎲 Players array completo:', players);

    if (!players) {
      console.error('❌ ERRO: players é undefined/null');
      setCurrentPlayer(null);
      return;
    }

    if (!Array.isArray(players)) {
      console.error('❌ ERRO: players não é um array:', typeof players, players);
      setCurrentPlayer(null);
      return;
    }

    if (players.length === 0) {
      console.error('❌ ERRO: array players está vazio');
      setCurrentPlayer(null);
      return;
    }

    console.log('✅ Array válido com', players.length, 'jogadores');

    // Se todos foram usados, limpar a lista
    let availablePlayers = players.filter(p => !usedPlayerIds.has(p.id));
    console.log('🔍 Jogadores disponíveis após filtro:', availablePlayers.length);
    
    if (availablePlayers.length === 0) {
      console.log('🔄 Resetando jogadores usados');
      setUsedPlayerIds(new Set());
      availablePlayers = players;
    }

    // Selecionar aleatoriamente
    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    const selectedPlayer = availablePlayers[randomIndex];

    console.log('✅ Jogador selecionado:', {
      name: selectedPlayer.name,
      id: selectedPlayer.id,
      image_url: selectedPlayer.image_url,
      index: randomIndex,
      totalAvailable: availablePlayers.length
    });

    // Marcar como usado
    setUsedPlayerIds(prev => new Set([...prev, selectedPlayer.id]));
    setCurrentPlayer(selectedPlayer);
    
    console.log('🎯 Estado atualizado - novo currentPlayer:', selectedPlayer.name);
  }, [players, usedPlayerIds]);

  // Selecionar primeiro jogador quando disponível
  useEffect(() => {
    console.log('🚀 useEffect disparado:', {
      hasPlayers: !!(players && players.length > 0),
      playersLength: players?.length,
      hasCurrentPlayer: !!currentPlayer,
      currentPlayerName: currentPlayer?.name
    });

    if (players && players.length > 0 && !currentPlayer) {
      console.log('🚀 Condições atendidas - selecionando primeiro jogador');
      console.log('🚀 Players recebidos no useEffect:', players.slice(0, 3).map(p => ({ name: p.name, id: p.id })));
      selectRandomPlayer();
    } else {
      console.log('🚀 Condições NÃO atendidas:', {
        temPlayers: !!(players && players.length > 0),
        semCurrentPlayer: !currentPlayer
      });
    }
  }, [players, currentPlayer, selectRandomPlayer]);

  console.log('🎯 useDirectPlayerSelection RETORNANDO:', {
    currentPlayer: currentPlayer ? { name: currentPlayer.name, id: currentPlayer.id } : null,
    usedPlayerIds: usedPlayerIds.size
  });

  return {
    currentPlayer,
    selectRandomPlayer,
    usedPlayerIds
  };
};
