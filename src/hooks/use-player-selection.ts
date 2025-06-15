
import { useState, useRef, useCallback, useEffect } from "react";
import { Player } from "@/types/guess-game";

export const usePlayerSelection = (players: Player[] | undefined) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const isInitialized = useRef<boolean>(false);
  const lastSelectedId = useRef<string | null>(null);

  // Initialize with first player when players are loaded
  useEffect(() => {
    if (players && players.length > 0 && !isInitialized.current) {
      console.log('🎮 Inicializando com primeiro jogador dos', players.length, 'disponíveis');
      isInitialized.current = true;
      const randomIndex = Math.floor(Math.random() * players.length);
      const selectedPlayer = players[randomIndex];
      if (selectedPlayer) {
        console.log('🎯 Jogador selecionado:', selectedPlayer.name);
        setCurrentPlayer(selectedPlayer);
        lastSelectedId.current = selectedPlayer.id;
      }
    }
  }, [players]);

  // Select a random player (avoiding the current one if possible)
  const selectRandomPlayer = useCallback(() => {
    if (!players || players.length === 0) {
      console.warn('⚠️ Nenhum jogador disponível para seleção');
      return;
    }
    
    console.log('🔄 Iniciando seleção de novo jogador...');
    
    // Se há apenas um jogador, seleciona ele mesmo
    if (players.length === 1) {
      const selectedPlayer = players[0];
      console.log('🎯 Único jogador disponível selecionado:', selectedPlayer.name);
      setCurrentPlayer(selectedPlayer);
      lastSelectedId.current = selectedPlayer.id;
      return;
    }
    
    // Filtra jogadores para evitar repetir o atual
    const availablePlayers = players.filter(player => player.id !== lastSelectedId.current);
    const playersToSelect = availablePlayers.length > 0 ? availablePlayers : players;
    
    const randomIndex = Math.floor(Math.random() * playersToSelect.length);
    const selectedPlayer = playersToSelect[randomIndex];
    
    if (selectedPlayer) {
      console.log('🔄 Novo jogador selecionado:', selectedPlayer.name, '(anterior:', lastSelectedId.current, ')');
      setCurrentPlayer(selectedPlayer);
      lastSelectedId.current = selectedPlayer.id;
    }
  }, [players]);

  // Handle image fixes - just log for now
  const handlePlayerImageFixed = useCallback(() => {
    if (currentPlayer) {
      console.log('🖼️ Imagem corrigida para:', currentPlayer.name);
    }
  }, [currentPlayer]);

  return {
    currentPlayer,
    selectRandomPlayer,
    handlePlayerImageFixed,
  };
};
