
import { Player } from './types';
import { playerImagesFallbacks, defaultImage, CACHE_EXPIRATION } from './constants';
import { imageCache, cleanExpiredCache } from './cache';

// Function to get a reliable image URL
export const getReliableImageUrl = (player: Player): string => {
  // Clean expired cache entries periodically
  if (Math.random() < 0.1) { // 10% chance to clean on each call
    cleanExpiredCache();
  }
  
  // Check cache first
  const cached = imageCache.get(player.id);
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRATION) {
    return cached.url;
  }
  
  let imageUrl = player.image_url;
  
  // Try to find exact match
  if (playerImagesFallbacks[player.name]) {
    imageUrl = playerImagesFallbacks[player.name];
  } 
  // Try to find partial match
  else {
    for (const [key, url] of Object.entries(playerImagesFallbacks)) {
      if (player.name.includes(key) || key.includes(player.name)) {
        imageUrl = url;
        break;
      }
    }
  }
  
  // Check if URL is valid
  if (!imageUrl || 
      !(imageUrl.startsWith('http') || imageUrl.startsWith('https'))) {
    imageUrl = defaultImage;
  }
  
  // Save to cache with timestamp
  imageCache.set(player.id, {
    url: imageUrl,
    timestamp: Date.now(),
    loaded: false
  });
  
  return imageUrl;
};
