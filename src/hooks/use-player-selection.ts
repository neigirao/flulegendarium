
import { useState, useRef, useCallback, useEffect } from "react";
import { Player } from "@/types/guess-game";

export const usePlayerSelection = (players: Player[] | undefined) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const isInitialized = useRef(false);

  // Initialize with first player when players are loaded
  useEffect(() => {
    if (players && players.length > 0 && !isInitialized.current) {
      console.log('🎮 Inicializando com primeiro jogador dos', players.length, 'disponíveis');
      isInitialized.current = true;
      const randomIndex = Math.floor(Math.random() * players.length);
      const selectedPlayer = players[randomIndex];
      console.log('🎯 Jogador selecionado:', selectedPlayer.name);
      setCurrentPlayer(selectedPlayer);
    }
  }, [players]);

  // Select a random player
  const selectRandomPlayer = useCallback(() => {
    if (!players || players.length === 0) {
      console.warn('⚠️ Nenhum jogador disponível para seleção');
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * players.length);
    const selectedPlayer = players[randomIndex];
    console.log('🔄 Novo jogador selecionado:', selectedPlayer.name);
    setCurrentPlayer(selectedPlayer);
  }, [players]);

  // Handle image fixes - just log for now
  const handlePlayerImageFixed = useCallback(() => {
    console.log('🖼️ Imagem corrigida para:', currentPlayer?.name);
  }, [currentPlayer]);

  return {
    currentPlayer,
    selectRandomPlayer,
    handlePlayerImageFixed,
  };
};
