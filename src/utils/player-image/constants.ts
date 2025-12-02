export const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 minutes

export const defaultImage = "/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png";

// Fallback images for specific players to improve loading reliability
export const playerImagesFallbacks: Record<string, string> = {
  // Fred removed - fallback image was incorrect, using database URL instead
  "Castilho": "/lovable-uploads/1b089617-8fa2-440f-ab41-5192f292f5f3.png",
  "Rivelino": "/lovable-uploads/20457a11-5436-48c6-906d-82b9451bc16d.png",
  "Deco": "/lovable-uploads/16f7afff-6bba-4b39-a454-daa6c2373151.png",
  "Marcelo": "/lovable-uploads/efaf362c-8726-4049-98bc-ebb26dcdd4e1.png",
  "Germán Cano": "/lovable-uploads/9ebcfdf2-e75b-4bf5-bee4-6f5a1998ce33.png",
  "Cano": "/lovable-uploads/9ebcfdf2-e75b-4bf5-bee4-6f5a1998ce33.png",
  // Add more fallbacks as needed
};
