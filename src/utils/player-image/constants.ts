export const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 minutes

export const defaultImage = "/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png";

// Base URL do Supabase Storage para imagens de jogadores
export const SUPABASE_STORAGE_URL = "https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players";

// Máximo de tentativas de retry
export const MAX_IMAGE_RETRIES = 2;

// Fallback images for specific players to improve loading reliability
export const playerImagesFallbacks: Record<string, string> = {
  // Jogadores históricos
  "Castilho": "/lovable-uploads/1b089617-8fa2-440f-ab41-5192f292f5f3.png",
  "Rivelino": "/lovable-uploads/20457a11-5436-48c6-906d-82b9451bc16d.png",
  "Deco": "/lovable-uploads/16f7afff-6bba-4b39-a454-daa6c2373151.png",
  "Marcelo": "/lovable-uploads/efaf362c-8726-4049-98bc-ebb26dcdd4e1.png",
  
  // Jogadores atuais
  "Germán Cano": "/lovable-uploads/9ebcfdf2-e75b-4bf5-bee4-6f5a1998ce33.png",
  "Cano": "/lovable-uploads/9ebcfdf2-e75b-4bf5-bee4-6f5a1998ce33.png",
  
  // Jogadores difíceis (frequentemente com problemas de imagem)
  "Telê Santana": `${SUPABASE_STORAGE_URL}/tele-santana.png`,
  "Paulo César Caju": `${SUPABASE_STORAGE_URL}/paulo-cesar-caju.png`,
  "Assis": `${SUPABASE_STORAGE_URL}/assis.png`,
  "Romerito": `${SUPABASE_STORAGE_URL}/romerito.png`,
  "Renato Gaúcho": `${SUPABASE_STORAGE_URL}/renato-gaucho.png`,
  "Washington": `${SUPABASE_STORAGE_URL}/washington.png`,
  "Roger Machado": `${SUPABASE_STORAGE_URL}/roger-machado.png`,
  "Conca": `${SUPABASE_STORAGE_URL}/conca.png`,
  "Fred": `${SUPABASE_STORAGE_URL}/fred.png`,
  "Thiago Silva": `${SUPABASE_STORAGE_URL}/thiago-silva.png`,
};
