
import { useState, useEffect, useCallback } from "react";
import { Player } from "@/types/guess-game";

export const useDirectPlayerSelection = (players: Player[]) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [usedPlayerIds, setUsedPlayerIds] = useState<Set<string>>(new Set());

  console.log('🎯 useDirectPlayerSelection:', {
    playersCount: players?.length || 0,
    currentPlayerName: currentPlayer?.name || 'null',
    usedCount: usedPlayerIds.size
  });

  const selectRandomPlayer = useCallback(() => {
    if (!players || players.length === 0) {
      console.warn('⚠️ Nenhum jogador disponível para seleção');
      setCurrentPlayer(null);
      return;
    }

    console.log('🎲 Selecionando jogador aleatório...');

    // Se todos foram usados, limpar a lista
    let availablePlayers = players.filter(p => !usedPlayerIds.has(p.id));
    
    if (availablePlayers.length === 0) {
      console.log('🔄 Resetando jogadores usados');
      setUsedPlayerIds(new Set());
      availablePlayers = players;
    }

    // Selecionar aleatoriamente
    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    const selectedPlayer = availablePlayers[randomIndex];

    console.log('✅ Jogador selecionado:', selectedPlayer.name);

    // Marcar como usado
    setUsedPlayerIds(prev => new Set([...prev, selectedPlayer.id]));
    setCurrentPlayer(selectedPlayer);
  }, [players, usedPlayerIds]);

  // Selecionar primeiro jogador quando disponível
  useEffect(() => {
    if (players && players.length > 0 && !currentPlayer) {
      console.log('🚀 Selecionando primeiro jogador - total:', players.length);
      selectRandomPlayer();
    }
  }, [players, currentPlayer, selectRandomPlayer]);

  return {
    currentPlayer,
    selectRandomPlayer,
    usedPlayerIds
  };
};
