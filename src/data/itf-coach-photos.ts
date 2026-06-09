// ITF = Índice Treinadores do Flu
// IDs usados no CMS (Supabase Storage → bucket "coaches")
// Para cadastrar: vá em Storage > coaches > upload com o nome exato abaixo

const BASE = 'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/coaches';

export const ITF_PHOTOS: Record<string, string> = {
  // Cadastre as fotos no CMS com esses nomes de arquivo:
  // zeze-moreira.jpg      abel-braga.jpg        ondino-vieira.jpg
  // renato-gaucho.jpg     tim.jpg               nelsinho-rosa.jpg
  // silvio-pirilo.jpg     parreira.jpg          tele-santana.jpg
  // muricy-ramalho.jpg    joel-santana.jpg
  // luis-vinhaes.jpg      oswaldo-oliveira.jpg  quincey-taylor.jpg
  // carlomagno.jpg        gentil-cardoso.jpg    paulo-emilio.jpg
  // pinheiro.jpg          valdir-espinosa.jpg

  'zeze-moreira':      `${BASE}/zeze-moreira.jpg`,
  'abel-braga':        'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/player-1781036833537.jpg',
  'ondino-vieira':     `${BASE}/ondino-vieira.jpg`,
  'renato-gaucho':     'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/player-1781037097749.webp',
  'fernando-diniz':    'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/a815a36d-b18b-4380-97e0-da6c86af233c.jpg',
  'tim':               `${BASE}/tim.jpg`,
  'nelsinho-rosa':     `${BASE}/nelsinho-rosa.jpg`,
  'silvio-pirilo':     `${BASE}/silvio-pirilo.jpg`,
  'parreira':          'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/player-1781037531534.webp',
  'tele-santana':      `${BASE}/tele-santana.jpg`,
  'muricy-ramalho':    'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/player-1781037589290.webp',
  'joel-santana':      'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/player-1781037370026.webp',
  'luis-vinhaes':      `${BASE}/luis-vinhaes.jpg`,
  'oswaldo-oliveira':  'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/player-1781036724662.webp',
  'quincey-taylor':    `${BASE}/quincey-taylor.jpg`,
  'carlomagno':        `${BASE}/carlomagno.jpg`,
  'gentil-cardoso':    `${BASE}/gentil-cardoso.jpg`,
  'paulo-emilio':      `${BASE}/paulo-emilio.jpg`,
  'pinheiro':          `${BASE}/pinheiro.jpg`,
  'valdir-espinosa':   'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/player-1781037462070.jpeg',
};
