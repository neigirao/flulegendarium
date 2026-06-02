const BASE = 'https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players';

/**
 * Mapeamento estático de fotos para os 15 candidatos do ILF.
 * Chave = id do ILFPlayer. Para adicionar uma foto basta incluir a entrada.
 * Jogadores sem entrada mostram as iniciais no Portrait.
 */
export const ILF_PHOTOS: Record<string, string> = {
  fred:       `${BASE}/fred.png`,
  cano:       '/lovable-uploads/9ebcfdf2-e75b-4bf5-bee4-6f5a1998ce33.png',
  tele:       `${BASE}/tele-santana.png`,
  washington: `${BASE}/washington.png`,
  hercules:   `${BASE}/player-1774721850154.png`,
  magno:      `${BASE}/5a7cb452-302b-4db1-9e65-b247740dbef8.jpg`,
  // Jogadores a seguir: adicione a URL quando as fotos forem cadastradas no sistema
  // waldo:      `${BASE}/waldo.png`,
  // orlando:    `${BASE}/orlando.png`,
  // welfare:    `${BASE}/henry-welfare.png`,
  // russo:      `${BASE}/russo.png`,
  // preguinho:  `${BASE}/preguinho.png`,
  // ezio:       `${BASE}/ezio.png`,
  // escurinho:  `${BASE}/escurinho.png`,
  // jair:       `${BASE}/jair-francisco.png`,
  // zeze:       `${BASE}/zeze.png`,
};
