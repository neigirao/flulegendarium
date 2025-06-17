
import { useState, useRef, useCallback, useEffect } from "react";
import { Player } from "@/types/guess-game";

export const useEnhancedPlayerSelection = (players: Player[] | undefined) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameKey, setGameKey] = useState<string>(Date.now().toString());
  const isInitialized = useRef<boolean>(false);
  const lastSelectedId = useRef<string | null>(null);
  const playerChangeCount = useRef<number>(0);

  // Initialize with first player
  useEffect(() => {
    if (players && players.length > 0 && !isInitialized.current) {
      console.log('🎮 Inicializando seleção de jogadores com', players.length, 'jogadores');
      isInitialized.current = true;
      const randomIndex = Math.floor(Math.random() * players.length);
      const selectedPlayer = players[randomIndex];
      if (selectedPlayer) {
        console.log('🎯 Jogador inicial selecionado:', selectedPlayer.name);
        setCurrentPlayer(selectedPlayer);
        lastSelectedId.current = selectedPlayer.id;
        setGameKey(`game-${Date.now()}-${playerChangeCount.current}`);
      }
    }
  }, [players]);

  // Enhanced player selection with forced refresh
  const selectRandomPlayer = useCallback(() => {
    if (!players || players.length === 0) {
      console.warn('⚠️ Nenhum jogador disponível');
      return;
    }
    
    playerChangeCount.current += 1;
    console.log('🔄 Selecionando novo jogador (tentativa', playerChangeCount.current, ')');
    
    // Generate new game key to force refresh
    const newGameKey = `game-${Date.now()}-${playerChangeCount.current}`;
    
    // Filter to avoid repeating current player
    const availablePlayers = players.filter(player => player.id !== lastSelectedId.current);
    const playersToSelect = availablePlayers.length > 0 ? availablePlayers : players;
    
    const randomIndex = Math.floor(Math.random() * playersToSelect.length);
    const selectedPlayer = playersToSelect[randomIndex];
    
    if (selectedPlayer) {
      console.log('🎯 Novo jogador selecionado:', {
        name: selectedPlayer.name,
        id: selectedPlayer.id,
        gameKey: newGameKey,
        changeCount: playerChangeCount.current
      });
      
      // Force state update with new key
      setGameKey(newGameKey);
      setCurrentPlayer(selectedPlayer);
      lastSelectedId.current = selectedPlayer.id;
    }
  }, [players]);

  // Force refresh - útil para debug
  const forceRefresh = useCallback(() => {
    if (currentPlayer) {
      playerChangeCount.current += 1;
      const newGameKey = `refresh-${Date.now()}-${playerChangeCount.current}`;
      console.log('🔄 Forçando refresh do jogador atual:', currentPlayer.name, 'com key:', newGameKey);
      setGameKey(newGameKey);
    }
  }, [currentPlayer]);

  const handlePlayerImageFixed = useCallback(() => {
    if (currentPlayer) {
      console.log('🖼️ Imagem corrigida para:', currentPlayer.name);
    }
  }, [currentPlayer]);

  return {
    currentPlayer,
    gameKey,
    selectRandomPlayer,
    forceRefresh,
    handlePlayerImageFixed,
    playerChangeCount: playerChangeCount.current
  };
};
