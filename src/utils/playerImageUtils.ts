
interface Player {
  id: string;
  name: string;
  position: string;
  image_url: string;
  fun_fact: string;
  achievements: string[];
  year_highlight: string;
  statistics: {
    gols: number;
    jogos: number;
  };
}

// Trusted URLs for specific players
const playerImagesFallbacks: Record<string, string> = {
  "Germán Cano": "https://tntsports.com.br/__export/1670800795599/sites/esporteinterativo/img/2022/12/11/gettyimages-1447173498_crop1670800794814.jpg",
  "Fred": "https://s2.glbimg.com/9Lbh2qz19LDtffAJQQwP8OYx3II=/0x0:2000x1333/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_bc8228b6673f488aa253bbcb03c80ec5/internal_photos/bs/2022/d/U/aqeGG8S0yAlBPYa4nK3g/agif22071013182553.jpg",
  "Felipe Melo": "https://www.ofutebolero.com.br/__export/1671836222411/sites/elfutbolero/img/2022/12/23/whatsapp_image_2022-12-23_at_18_22_44_crop1671836221785.jpeg",
  "Thiago Silva": "https://assets.goal.com/v3/assets/bltcc7a7ffd2fbf71f5/blt38eff59ed13fff34/60dac1480401cb0ebfa64d18/8aa23e84f5bbad02d6d5dcc9144ae9d8e8c4574e.jpg",
  "Marcelo": "https://pbs.twimg.com/media/Fyvk3Q2XoAIIrij.jpg",
  "Conca": "https://sportbuzz.uol.com.br/media/_versions/conca-fluminense-getty_widelg.jpg",
  "Deco": "https://pbs.twimg.com/media/Fn5QoQGXgAEs8XV.jpg",
  "Romário": "https://sportbuzz.uol.com.br/media/_versions/gettyimages-1151058_widelg.jpg",
  "Ganso": "https://www.estadao.com.br/resizer/1WdpAwkDH08BnCXP-FMkBmIEHe8=/arc-anglerfish-arc2-prod-estadao/public/4L7AWZVKHRAJJCUXNPPX4HL35A.jpg",
  "Fábio": "https://tntsports.com.br/__export/1694550747175/sites/esporteinterativo/img/2023/09/12/fabio-flu.jpg_1216690859.jpg",
  "Nino": "https://s2.glbimg.com/fy5zdRuvzwJuIcAo8v8E0cptPYk=/0x0:2048x1365/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_bc8228b6673f488aa253bbcb03c80ec5/internal_photos/bs/2023/w/E/Ae5qy7QS2EGXzFIY5RQQ/img-2915.jpg",
  "Arias": "https://www.ofutebolero.com.br/__export/1675798714386/sites/elfutbolero/img/2023/02/07/jhon_arias_copy_crop1675798713637.jpg"
};

// Default fallback image
const defaultImage = "https://uploads.metropoles.com/wp-content/uploads/2023/10/31123243/Fluminense-campeao-Libertadores-2023-12.jpg";

// Image cache with expiration time (30 minutes)
interface CachedImage {
  url: string;
  timestamp: number;
}

const CACHE_EXPIRATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const imageCache = new Map<string, CachedImage>();

// Function to clean expired cache entries
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of imageCache.entries()) {
    if (now - value.timestamp > CACHE_EXPIRATION) {
      imageCache.delete(key);
    }
  }
};

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
    timestamp: Date.now()
  });
  
  return imageUrl;
};

// Helper function to preload images with priority
export const preloadPlayerImages = (players: Player[]) => {
  if (!players || players.length === 0) return;
  
  // Intelligently decide how many images to preload based on device performance
  const preloadCount = navigator.hardwareConcurrency
    ? Math.min(Math.max(2, navigator.hardwareConcurrency), 5) // Between 2 and 5 based on CPU cores
    : 3; // Default to 3 if hardwareConcurrency not available
  
  console.log(`Precarregando ${preloadCount} imagens de jogadores`);
  
  // First preload currently needed images with high priority
  const highPriorityImages = players.slice(0, 3).map(player => getReliableImageUrl(player));
  
  highPriorityImages.forEach(src => {
    if (typeof window !== 'undefined') {
      const img = new Image();
      img.src = src;
      img.fetchPriority = 'high';
    }
  });
  
  // Then preload a few more with low priority
  if (players.length > 3) {
    // Use requestIdleCallback if available, otherwise setTimeout
    const schedulePreload = window.requestIdleCallback || ((cb) => setTimeout(cb, 1000));
    
    schedulePreload(() => {
      const lowPriorityImages = players
        .slice(3, 3 + preloadCount)
        .map(player => getReliableImageUrl(player));
      
      lowPriorityImages.forEach(src => {
        if (typeof window !== 'undefined') {
          const img = new Image();
          img.src = src;
          img.fetchPriority = 'low';
        }
      });
    });
  }
};

// Create a lightweight component loader function
export const preloadNextPlayer = (nextPlayer: Player | null) => {
  if (!nextPlayer) return;
  
  const imageUrl = getReliableImageUrl(nextPlayer);
  
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback if available for non-critical preloading
    const requestIdleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
    
    requestIdleCallback(() => {
      const img = new Image();
      img.src = imageUrl;
    });
  }
};

export const playerImagesFallbacksMap = playerImagesFallbacks;
export const defaultPlayerImage = defaultImage;
