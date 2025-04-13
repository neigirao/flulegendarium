
import { Player } from './types';
import { imageCache } from './cache';
import { getReliableImageUrl } from './imageUtils';
import { defaultImage, playerImagesFallbacks } from './constants';

// Enhanced preloading system with better sequencing
export const preloadPlayerImages = (players: Player[]) => {
  if (!players || players.length === 0) return;
  
  // Determine how many images to preload based on device capabilities
  const preloadCount = Math.min(
    Math.max(5, navigator.hardwareConcurrency ? navigator.hardwareConcurrency * 2 : 6),
    10
  );
  
  console.log(`Precarregando ${preloadCount} imagens de jogadores de forma sequencial`);
  
  // Sequential preloading with a more robust approach
  const preloadSequentially = (index = 0) => {
    if (index >= preloadCount || index >= players.length) return;
    
    const player = players[index];
    const imageUrl = getReliableImageUrl(player);
    const img = new Image();
    
    // Set high priority for first 3 images, low for the rest
    img.fetchPriority = index < 3 ? 'high' : 'low';
    
    // Load next image when this one completes or errors
    const loadNextImage = () => {
      // Mark as loaded in cache
      const cached = imageCache.get(player.id);
      if (cached) {
        imageCache.set(player.id, { ...cached, loaded: true });
      }
      
      // Start loading next image with a small delay to prevent browser throttling
      setTimeout(() => preloadSequentially(index + 1), 100);
    };
    
    img.onload = loadNextImage;
    img.onerror = () => {
      console.warn(`Falha ao pré-carregar imagem para ${player.name}`);
      // Try fallback image if available
      if (playerImagesFallbacks[player.name]) {
        const fallbackImg = new Image();
        fallbackImg.src = playerImagesFallbacks[player.name];
        fallbackImg.onload = loadNextImage;
        fallbackImg.onerror = loadNextImage; // Continue chain even if fallback fails
      } else {
        loadNextImage(); // Continue to next image
      }
    };
    
    img.src = imageUrl; // Start loading
  };
  
  // Begin sequential preloading
  preloadSequentially();
  
  // Also preload a few essential fallback images in parallel for emergency use
  [defaultImage, ...Object.values(playerImagesFallbacks).slice(0, 3)].forEach(url => {
    const img = new Image();
    img.src = url;
    img.fetchPriority = 'low';
  });
};

// Improved next player preloading with better error handling
export const preloadNextPlayer = (nextPlayer: Player | null) => {
  if (!nextPlayer) return;
  
  const imageUrl = getReliableImageUrl(nextPlayer);
  
  // Only preload if not already in cache and loaded
  const cached = imageCache.get(nextPlayer.id);
  if (cached && cached.loaded) {
    return; // Already loaded, no need to preload again
  }
  
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback for non-critical preloading, but with timeout
    const requestIdleCallback = window.requestIdleCallback || 
      ((cb) => setTimeout(cb, Math.random() * 200 + 100)); // Random delay between 100-300ms
    
    requestIdleCallback(() => {
      const img = new Image();
      img.fetchPriority = 'low';
      
      img.onload = () => {
        console.log(`Imagem do próximo jogador (${nextPlayer.name}) pré-carregada com sucesso`);
        const cached = imageCache.get(nextPlayer.id);
        if (cached) {
          imageCache.set(nextPlayer.id, { ...cached, loaded: true });
        }
      };
      
      img.onerror = () => {
        console.warn(`Falha ao pré-carregar próximo jogador (${nextPlayer.name})`);
        // Try fallback if available
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

// Utility function to prepare the next batch of players
export const prepareNextBatch = (allPlayers: Player[], currentPlayer: Player | null, batchSize = 3) => {
  if (!allPlayers || allPlayers.length <= 1 || !currentPlayer) return;
  
  // Find current player index
  const currentIndex = allPlayers.findIndex(p => p.id === currentPlayer.id);
  if (currentIndex === -1) return;
  
  // Get next batch avoiding current player
  const nextBatch: Player[] = [];
  let offset = 1;
  
  while (nextBatch.length < batchSize && offset < allPlayers.length) {
    const nextIndex = (currentIndex + offset) % allPlayers.length;
    nextBatch.push(allPlayers[nextIndex]);
    offset++;
  }
  
  // Preload this batch in background
  if (nextBatch.length > 0) {
    console.log(`Preparando próximo lote de ${nextBatch.length} jogadores em background`);
    
    // Delay slightly to prioritize current image loading
    setTimeout(() => {
      nextBatch.forEach((player, index) => {
        // Stagger the loading to prevent browser throttling
        setTimeout(() => {
          const imageUrl = getReliableImageUrl(player);
          const img = new Image();
          img.fetchPriority = 'low';
          img.src = imageUrl;
        }, index * 150); // 150ms delay between each image
      });
    }, 500); // 500ms initial delay
  }
};
