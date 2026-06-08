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
  // nelsinho-baptista.jpg
  // silvio-pirilo.jpg
  // parreira.jpg
  // levir-culpi.jpg
  // paulo-autuori.jpg
  // muricy-ramalho.jpg
  // joel-santana.jpg
  // cristovao-borges.jpg
  // luis-vinhaes.jpg
  // oswaldo-oliveira.jpg

  'zeze-moreira':      `${BASE}/zeze-moreira.jpg`,
  'abel-braga':        `${BASE}/abel-braga.jpg`,
  'ondino-vieira':     `${BASE}/ondino-vieira.jpg`,
  'renato-gaucho':     `${BASE}/renato-gaucho.jpg`,
  'fernando-diniz':    `${BASE}/fernando-diniz.jpg`,
  'tim':               `${BASE}/tim.jpg`,
  'nelsinho-baptista': `${BASE}/nelsinho-baptista.jpg`,
  'silvio-pirilo':     `${BASE}/silvio-pirilo.jpg`,
  'parreira':          `${BASE}/parreira.jpg`,
  'levir-culpi':       `${BASE}/levir-culpi.jpg`,
  'paulo-autuori':     `${BASE}/paulo-autuori.jpg`,
  'muricy-ramalho':    `${BASE}/muricy-ramalho.jpg`,
  'joel-santana':      `${BASE}/joel-santana.jpg`,
  'cristovao-borges':  `${BASE}/cristovao-borges.jpg`,
  'luis-vinhaes':      `${BASE}/luis-vinhaes.jpg`,
  'oswaldo-oliveira':  `${BASE}/oswaldo-oliveira.jpg`,
};
