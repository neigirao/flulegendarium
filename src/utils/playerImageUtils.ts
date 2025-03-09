
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

// Function to get a reliable image URL with a cache
const imageCache = new Map<string, string>();

// Function to get a reliable image URL
export const getReliableImageUrl = (player: Player): string => {
  // Check cache first
  if (imageCache.has(player.id)) {
    return imageCache.get(player.id)!;
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
  
  // Save to cache
  imageCache.set(player.id, imageUrl);
  
  return imageUrl;
};

// Helper function to preload images
export const preloadPlayerImages = (players: Player[]) => {
  if (!players || players.length === 0) return;
  
  // Preload first 5 player images to improve initial performance
  const imagesToPreload = players.slice(0, 5).map(player => getReliableImageUrl(player));
  
  imagesToPreload.forEach(src => {
    if (typeof window !== 'undefined') {
      const img = new Image();
      img.src = src;
    }
  });
};

export const playerImagesFallbacksMap = playerImagesFallbacks;
export const defaultPlayerImage = defaultImage;
