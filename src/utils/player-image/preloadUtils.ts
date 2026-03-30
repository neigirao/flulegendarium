
import { Player } from './types';
import { imageCache } from './cache';
import { getReliableImageUrl } from './imageUtils';
import { defaultImage, playerImagesFallbacks } from './constants';
import { logger } from '@/utils/logger';

export const preloadPlayerImages = (players: Player[]) => {
  if (!players || players.length === 0) return;
  
  const preloadCount = Math.min(
    Math.max(3, navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4),
    8
  );
  
  logger.debug(`Precarregando ${preloadCount} imagens de jogadores de forma sequencial`, 'PLAYER_IMAGE');
  
  const preloadSequentially = (index = 0) => {
    if (index >= preloadCount || index >= players.length) return;
    
    const player = players[index];
    const imageUrl = getReliableImageUrl(player);
    const img = new Image();
    
    img.fetchPriority = index < 3 ? 'high' : 'low';
    
    const loadNextImage = () => {
      const cached = imageCache.get(player.id);
      if (cached) {
        imageCache.set(player.id, { ...cached, loaded: true });
      }
      
      setTimeout(() => preloadSequentially(index + 1), 100);
    };
    
    img.onload = loadNextImage;
    img.onerror = () => {
      logger.warn(`Falha ao pré-carregar imagem para ${player.name}`, 'PLAYER_IMAGE');
      if (playerImagesFallbacks[player.name]) {
        const fallbackImg = new Image();
        fallbackImg.src = playerImagesFallbacks[player.name];
        fallbackImg.onload = loadNextImage;
        fallbackImg.onerror = loadNextImage;
      } else {
        loadNextImage();
      }
    };
    
    img.src = imageUrl;
  };
  
  preloadSequentially();
  
  // Preload default images with lower priority
  const imagesToPreload = [defaultImage, ...Object.values(playerImagesFallbacks).slice(0, 2)];
  imagesToPreload.forEach(url => {
    const img = new Image();
    img.src = url;
    img.fetchPriority = 'low';
  });
};

export const preloadNextPlayer = (nextPlayer: Player | null) => {
  if (!nextPlayer) return;
  
  const imageUrl = getReliableImageUrl(nextPlayer);
  
  const cached = imageCache.get(nextPlayer.id);
  if (cached && cached.loaded) {
    return;
  }
  
  if (typeof window !== 'undefined') {
    const requestIdleCallback = window.requestIdleCallback || 
      ((cb) => setTimeout(cb, Math.random() * 200 + 100));
    
    requestIdleCallback(() => {
      const img = new Image();
      img.fetchPriority = 'low';
      
      img.onload = () => {
        logger.debug(`Imagem do próximo jogador (${nextPlayer.name}) pré-carregada com sucesso`, 'PLAYER_IMAGE');
        const cached = imageCache.get(nextPlayer.id);
        if (cached) {
          imageCache.set(nextPlayer.id, { ...cached, loaded: true });
        }
      };
      
      img.onerror = () => {
        logger.warn(`Falha ao pré-carregar próximo jogador (${nextPlayer.name})`, 'PLAYER_IMAGE');
        if (playerImagesFallbacks[nextPlayer.name]) {
          const fallbackImg = new Image();
          fallbackImg.src = playerImagesFallbacks[nextPlayer.name];
          fallbackImg.fetchPriority = 'low';
        }
      };
      
      img.src = imageUrl;
    });
  }
};

export const prepareNextBatch = (allPlayers: Player[], currentPlayer: Player | null, batchSize = 2) => {
  if (!allPlayers || allPlayers.length <= 1 || !currentPlayer) return;
  
  const currentIndex = allPlayers.findIndex(p => p.id === currentPlayer.id);
  if (currentIndex === -1) return;
  
  const nextBatch: Player[] = [];
  let offset = 1;
  
  while (nextBatch.length < batchSize && offset < allPlayers.length) {
    const nextIndex = (currentIndex + offset) % allPlayers.length;
    nextBatch.push(allPlayers[nextIndex]);
    offset++;
  }
  
  if (nextBatch.length > 0) {
    logger.debug(`Preparando próximo lote de ${nextBatch.length} jogadores em background`, 'PLAYER_IMAGE');
    
    setTimeout(() => {
      nextBatch.forEach((player, index) => {
        setTimeout(() => {
          const imageUrl = getReliableImageUrl(player);
          const img = new Image();
          img.fetchPriority = 'low';
          img.src = imageUrl;
        }, index * 200);
      });
    }, 800);
  }
};