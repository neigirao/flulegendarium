// ITF = Índice Treinadores do Flu
// IDs usados no CMS (Supabase Storage → bucket "coaches")
// Para cadastrar: vá em Storage > coaches > upload com o nome exato abaixo

const BASE = 'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/coaches';

export const ITF_PHOTOS: Record<string, string> = {
  // Cadastre as fotos no CMS com esses nomes de arquivo:
  // zeze-moreira.jpg
  // abel-braga.jpg
  // ondino-vieira.jpg
  // renato-gaucho.jpg
  // fernando-diniz.jpg
  // tim.jpg
  // nelsinho-rosa.jpg
  // silvio-pirilo.jpg
  // parreira.jpg
  // levir-culpi.jpg
  // muricy-ramalho.jpg
  // joel-santana.jpg
  // cristovao-borges.jpg
  // luis-vinhaes.jpg
  // oswaldo-oliveira.jpg

  'zeze-moreira':      `${BASE}/zeze-moreira.jpg`,
  'abel-braga':        `${BASE}/abel-braga.jpg`,
  'ondino-vieira':     `${BASE}/ondino-vieira.jpg`,
  'renato-gaucho':     `${BASE}/renato-gaucho.jpg`,
  'fernando-diniz':    'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/a815a36d-b18b-4380-97e0-da6c86af233c.jpg',
  'tim':               `${BASE}/tim.jpg`,
  'nelsinho-rosa':     `${BASE}/nelsinho-rosa.jpg`,
  'silvio-pirilo':     `${BASE}/silvio-pirilo.jpg`,
  'parreira':          `${BASE}/parreira.jpg`,
  'levir-culpi':       `${BASE}/levir-culpi.jpg`,
  'muricy-ramalho':    `${BASE}/muricy-ramalho.jpg`,
  'joel-santana':      `${BASE}/joel-santana.jpg`,
  'cristovao-borges':  `${BASE}/cristovao-borges.jpg`,
  'luis-vinhaes':      `${BASE}/luis-vinhaes.jpg`,
  'oswaldo-oliveira':  `${BASE}/oswaldo-oliveira.jpg`,
};
