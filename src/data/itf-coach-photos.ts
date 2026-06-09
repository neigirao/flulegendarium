// ITF = Índice Treinadores do Flu
// IDs usados no CMS (Supabase Storage → bucket "coaches")

const BASE = 'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/coaches';

export const ITF_PHOTOS: Record<string, string> = {
  'zeze-moreira':      'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/player-1781039054309.webp',
  'abel-braga':        'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/player-1781036833537.jpg',
  'renato-gaucho':     'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/player-1781037097749.webp',
  'fernando-diniz':    'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/a815a36d-b18b-4380-97e0-da6c86af233c.jpg',
  'nelsinho-rosa':     `${BASE}/nelsinho-rosa.jpg`,
  'parreira':          'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/player-1781037531534.webp',
  'tele-santana':      `${BASE}/tele-santana.jpg`,
  'muricy-ramalho':    'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/player-1781037589290.webp',
  'joel-santana':      'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/player-1781037370026.webp',
  'oswaldo-oliveira':  'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/player-1781036724662.webp',
  'carlomagno':        `${BASE}/carlomagno.jpg`,
  'gentil-cardoso':    `${BASE}/gentil-cardoso.jpg`,
  'pinheiro':          `${BASE}/pinheiro.jpg`,
  'valdir-espinosa':   'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/player-1781037462070.jpeg',
};
