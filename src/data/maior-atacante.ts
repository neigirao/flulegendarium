export interface ILFScores {
  producao: number;
  titulos: number;
  campanhas: number;
  classicos: number;
  decisivos: number;
  premiacoes: number;
  longevidade: number;
  legado: number;
}

export interface ILFPlayer {
  id: string;
  nome: string;
  apelido: string;
  periodo: string;
  posicao: string;
  gols: number;
  jogos: number;
  legenda: string;
  scores: ILFScores;
  classicos: { Flamengo: number; Vasco: number; Botafogo: number };
  decisivos: { finais: number; semis: number; quartas: number };
  premios: string[];
}

export interface ILFWeight {
  key: keyof ILFScores;
  label: string;
  short: string;
  weight: number;
  color: string;
}

export interface ILFRankingEntry extends ILFPlayer {
  ilf: number;
}

export const ILF_WEIGHTS: ILFWeight[] = [
  { key: 'producao',    label: 'Produção Ofensiva',    short: 'Prod',  weight: 0.25, color: '#7A0213' },
  { key: 'titulos',     label: 'Títulos Conquistados', short: 'Títul', weight: 0.15, color: '#C4944A' },
  { key: 'campanhas',   label: 'Campanhas Históricas', short: 'Camp',  weight: 0.15, color: '#006140' },
  { key: 'classicos',   label: 'Clássicos',            short: 'Clás',  weight: 0.10, color: '#AF1E35' },
  { key: 'decisivos',   label: 'Jogos Decisivos',      short: 'Dec',   weight: 0.10, color: '#E8B560' },
  { key: 'premiacoes',  label: 'Premiações Individuais',short: 'Prêm', weight: 0.10, color: '#0EA5E9' },
  { key: 'longevidade', label: 'Longevidade',           short: 'Long',  weight: 0.05, color: '#94A3B8' },
  { key: 'legado',      label: 'Legado Histórico',      short: 'Leg',   weight: 0.10, color: '#A855F7' },
];

// Dados placeholder — serão substituídos pelo usuário
export const ILF_PLAYERS: ILFPlayer[] = [
  {
    id: 'waldo',
    nome: 'Waldo',
    apelido: 'O Maior Artilheiro',
    periodo: '1957–1973',
    posicao: 'Centro-avante',
    gols: 339,
    jogos: 535,
    legenda: 'O maior artilheiro da história do Fluminense. Waldo marcou uma era no futebol brasileiro com sua eficiência avassaladora.',
    scores: { producao: 100, titulos: 72, campanhas: 65, classicos: 90, decisivos: 78, premiacoes: 60, longevidade: 88, legado: 95 },
    classicos: { Flamengo: 28, Vasco: 22, Botafogo: 19 },
    decisivos: { finais: 12, semis: 18, quartas: 14 },
    premios: ['Artilheiro Carioca ×7', 'Craque do Campeonato Carioca ×3'],
  },
  {
    id: 'fred',
    nome: 'Fred',
    apelido: 'O Ídolo Moderno',
    periodo: '2009–2019',
    posicao: 'Centro-avante',
    gols: 200,
    jogos: 426,
    legenda: 'O maior ídolo da era moderna do Fluminense. Dois Brasileiros, um Carioca e o coração da Nação Tricolor.',
    scores: { producao: 82, titulos: 88, campanhas: 80, classicos: 78, decisivos: 82, premiacoes: 85, longevidade: 90, legado: 92 },
    classicos: { Flamengo: 22, Vasco: 18, Botafogo: 16 },
    decisivos: { finais: 10, semis: 15, quartas: 12 },
    premios: ['Bola de Ouro Brasileiro 2012', 'Artilheiro Brasileiro 2011', 'Ídolo Máximo 2019'],
  },
  {
    id: 'cano',
    nome: 'Germán Cano',
    apelido: 'El Monstruo',
    periodo: '2022–hoje',
    posicao: 'Centro-avante',
    gols: 113,
    jogos: 185,
    legenda: 'Herói da primeira Libertadores. O argentino que virou lenda tricolor ao marcar o gol que mudou a história do Fluminense.',
    scores: { producao: 88, titulos: 95, campanhas: 95, classicos: 72, decisivos: 90, premiacoes: 80, longevidade: 40, legado: 88 },
    classicos: { Flamengo: 15, Vasco: 12, Botafogo: 10 },
    decisivos: { finais: 14, semis: 10, quartas: 8 },
    premios: ['Artilheiro Libertadores 2023', 'Bola de Prata 2022', 'Libertadores 2023'],
  },
  {
    id: 'orlando',
    nome: 'Orlando',
    apelido: 'Pingo de Ouro',
    periodo: '1952–1966',
    posicao: 'Ponta-esquerda',
    gols: 188,
    jogos: 410,
    legenda: 'Pingo de Ouro — a alcunha diz tudo. Velocidade, drible e gol. Um dos maiores pontas da história do futebol brasileiro.',
    scores: { producao: 80, titulos: 70, campanhas: 68, classicos: 82, decisivos: 75, premiacoes: 62, longevidade: 82, legado: 80 },
    classicos: { Flamengo: 24, Vasco: 20, Botafogo: 18 },
    decisivos: { finais: 8, semis: 12, quartas: 10 },
    premios: ['Artilheiro Carioca ×3', 'Craque do Campeonato'],
  },
  {
    id: 'hercules',
    nome: 'Hércules',
    apelido: 'O Potência',
    periodo: '1945–1958',
    posicao: 'Centro-avante',
    gols: 210,
    jogos: 390,
    legenda: 'Um dos centroavantes mais poderosos da história tricolor. Hércules dominou o futebol carioca nos anos 40 e 50.',
    scores: { producao: 85, titulos: 68, campanhas: 62, classicos: 80, decisivos: 70, premiacoes: 55, longevidade: 78, legado: 75 },
    classicos: { Flamengo: 26, Vasco: 21, Botafogo: 17 },
    decisivos: { finais: 9, semis: 14, quartas: 11 },
    premios: ['Artilheiro Carioca ×4', 'Melhor Jogador 1950'],
  },
  {
    id: 'welfare',
    nome: 'Welfare',
    apelido: 'O Pioneiro',
    periodo: '1913–1924',
    posicao: 'Centro-avante',
    gols: 148,
    jogos: 220,
    legenda: 'Um dos primeiros grandes atacantes do Fluminense. Welfare foi artilheiro quando o futebol ainda engatinhava no Brasil.',
    scores: { producao: 75, titulos: 65, campanhas: 60, classicos: 75, decisivos: 65, premiacoes: 45, longevidade: 70, legado: 85 },
    classicos: { Flamengo: 18, Vasco: 0, Botafogo: 14 },
    decisivos: { finais: 7, semis: 10, quartas: 8 },
    premios: ['Artilheiro Carioca ×2'],
  },
  {
    id: 'ezio',
    nome: 'Ézio',
    apelido: 'O Artilheiro dos 70',
    periodo: '1967–1978',
    posicao: 'Centro-avante',
    gols: 162,
    jogos: 310,
    legenda: 'Artilheiro dos anos 70, Ézio foi peça fundamental nas campanhas do Fluminense naquela rica década tricolor.',
    scores: { producao: 78, titulos: 75, campanhas: 78, classicos: 70, decisivos: 72, premiacoes: 58, longevidade: 75, legado: 72 },
    classicos: { Flamengo: 20, Vasco: 16, Botafogo: 14 },
    decisivos: { finais: 8, semis: 11, quartas: 9 },
    premios: ['Artilheiro Carioca ×2', 'Campeão Brasileiro 1970'],
  },
  {
    id: 'washington',
    nome: 'Washington',
    apelido: 'O Pintado',
    periodo: '2003–2007',
    posicao: 'Centro-avante',
    gols: 72,
    jogos: 165,
    legenda: 'O Pintado chegou para uma missão e cumpriu. Washington foi decisivo nas campanhas históricas do Flu.',
    scores: { producao: 65, titulos: 70, campanhas: 72, classicos: 62, decisivos: 68, premiacoes: 60, longevidade: 50, legado: 65 },
    classicos: { Flamengo: 12, Vasco: 10, Botafogo: 8 },
    decisivos: { finais: 6, semis: 9, quartas: 7 },
    premios: ['Artilheiro Carioca 2007', 'Bola de Prata'],
  },
  {
    id: 'preguinho',
    nome: 'Preguinho',
    apelido: 'O Pioneiro da Copa',
    periodo: '1920–1933',
    posicao: 'Ponta-direita',
    gols: 125,
    jogos: 195,
    legenda: 'O primeiro artilheiro do Brasil em Copas do Mundo. Preguinho foi um símbolo do futebol brasileiro nos primórdios.',
    scores: { producao: 70, titulos: 62, campanhas: 58, classicos: 68, decisivos: 60, premiacoes: 50, longevidade: 65, legado: 90 },
    classicos: { Flamengo: 15, Vasco: 0, Botafogo: 12 },
    decisivos: { finais: 5, semis: 8, quartas: 6 },
    premios: ['Artilheiro Copa do Mundo 1930', 'Artilheiro Carioca'],
  },
  {
    id: 'telê',
    nome: 'Telê Santana',
    apelido: 'O Mágico',
    periodo: '1952–1962',
    posicao: 'Meia-atacante',
    gols: 95,
    jogos: 275,
    legenda: 'Antes de ser o treinador mais amado do Brasil, Telê Santana foi um meia-atacante brilhante pelo Fluminense.',
    scores: { producao: 62, titulos: 68, campanhas: 65, classicos: 72, decisivos: 70, premiacoes: 65, longevidade: 72, legado: 88 },
    classicos: { Flamengo: 18, Vasco: 14, Botafogo: 13 },
    decisivos: { finais: 7, semis: 11, quartas: 9 },
    premios: ['Melhor Meia-atacante 1959', 'Artilheiro Carioca'],
  },
  {
    id: 'assis',
    nome: 'Assis',
    apelido: 'O Brilhante',
    periodo: '1978–1987',
    posicao: 'Ponta',
    gols: 88,
    jogos: 240,
    legenda: 'Ídolo tricolor, Assis encantou as arquibancadas com sua técnica e criatividade irresistíveis.',
    scores: { producao: 68, titulos: 72, campanhas: 70, classicos: 65, decisivos: 65, premiacoes: 58, longevidade: 68, legado: 70 },
    classicos: { Flamengo: 16, Vasco: 13, Botafogo: 11 },
    decisivos: { finais: 6, semis: 10, quartas: 8 },
    premios: ['Artilheiro Carioca 1981', 'Craque do Estadual'],
  },
  {
    id: 'renato',
    nome: 'Renato Gaúcho',
    apelido: 'O Rei do Maracanã',
    periodo: '1983–1992',
    posicao: 'Atacante',
    gols: 72,
    jogos: 225,
    legenda: 'O Rei do Maracanã. Renato viveu seus melhores anos no Fluminense, onde marcou para sempre a história tricolor.',
    scores: { producao: 65, titulos: 70, campanhas: 72, classicos: 75, decisivos: 72, premiacoes: 70, longevidade: 65, legado: 85 },
    classicos: { Flamengo: 20, Vasco: 16, Botafogo: 14 },
    decisivos: { finais: 8, semis: 12, quartas: 10 },
    premios: ['Artilheiro Carioca', 'Bola de Ouro Estadual', 'Copa do Brasil 1997'],
  },
  {
    id: 'rivellino',
    nome: 'Rivellino',
    apelido: 'O Maestro',
    periodo: '1975–1978',
    posicao: 'Meia-atacante',
    gols: 28,
    jogos: 95,
    legenda: 'Campeão do Mundo e um dos maiores da história, Rivellino brilhou brevemente mas intensamente pelo Flu.',
    scores: { producao: 55, titulos: 65, campanhas: 60, classicos: 65, decisivos: 68, premiacoes: 85, longevidade: 38, legado: 80 },
    classicos: { Flamengo: 10, Vasco: 8, Botafogo: 7 },
    decisivos: { finais: 4, semis: 7, quartas: 5 },
    premios: ['Copa do Mundo 1970', 'Bola de Ouro 1976'],
  },
  {
    id: 'edinho',
    nome: 'Edinho',
    apelido: 'Filho do Rei',
    periodo: '1979–1989',
    posicao: 'Volante/Atacante',
    gols: 42,
    jogos: 185,
    legenda: 'Filho do Rei e ídolo próprio. Edinho construiu sua história no Fluminense com personalidade e entrega.',
    scores: { producao: 52, titulos: 62, campanhas: 60, classicos: 58, decisivos: 55, premiacoes: 48, longevidade: 62, legado: 65 },
    classicos: { Flamengo: 10, Vasco: 8, Botafogo: 7 },
    decisivos: { finais: 4, semis: 7, quartas: 5 },
    premios: ['Artilheiro Carioca 1982'],
  },
  {
    id: 'ruben',
    nome: 'Rubens',
    apelido: 'O Clássico',
    periodo: '1935–1947',
    posicao: 'Centro-avante',
    gols: 140,
    jogos: 265,
    legenda: 'Um dos melhores centroavantes da era clássica do futebol brasileiro, Rubens dominou as arquibancadas nos anos 40.',
    scores: { producao: 72, titulos: 65, campanhas: 62, classicos: 70, decisivos: 62, premiacoes: 50, longevidade: 68, legado: 70 },
    classicos: { Flamengo: 18, Vasco: 14, Botafogo: 12 },
    decisivos: { finais: 7, semis: 10, quartas: 8 },
    premios: ['Artilheiro Carioca ×2'],
  },
];

export function ILF_compute(player: ILFPlayer): number {
  return ILF_WEIGHTS.reduce((sum, w) => sum + player.scores[w.key] * w.weight, 0);
}

export function ILF_media(player: ILFPlayer): number {
  return player.jogos > 0 ? player.gols / player.jogos : 0;
}

export const ILF_RANKING: ILFRankingEntry[] = [...ILF_PLAYERS]
  .map(p => ({ ...p, ilf: ILF_compute(p) }))
  .sort((a, b) => b.ilf - a.ilf);
