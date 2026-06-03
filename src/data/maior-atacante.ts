export interface ILFScores {
  producao: number;
  titulos: number;
  campanhas: number;
  classicos: number;
  decisivos: number;
  premiacoes: number;
  longevidade: number;
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
  { key: 'producao',    label: 'Produção Ofensiva',     short: 'Prod',  weight: 0.30, color: '#7A0213' },
  { key: 'titulos',     label: 'Títulos Conquistados',  short: 'Títul', weight: 0.15, color: '#C4944A' },
  { key: 'campanhas',   label: 'Campanhas Históricas',  short: 'Camp',  weight: 0.20, color: '#006140' },
  { key: 'classicos',   label: 'Clássicos',             short: 'Clás',  weight: 0.10, color: '#AF1E35' },
  { key: 'decisivos',   label: 'Jogos Decisivos',       short: 'Dec',   weight: 0.10, color: '#E8B560' },
  { key: 'premiacoes',  label: 'Premiações Individuais',short: 'Prêm',  weight: 0.10, color: '#0EA5E9' },
  { key: 'longevidade', label: 'Longevidade',            short: 'Long',  weight: 0.05, color: '#94A3B8' },
];

export const ILF_PLAYERS: ILFPlayer[] = [
  {
    id: 'waldo',
    nome: 'Waldo',
    apelido: 'O Maior Artilheiro',
    periodo: '1954–1961',
    posicao: 'Centro-avante',
    gols: 319,
    jogos: 403,
    legenda: 'O maior artilheiro da história do Fluminense com 319 gols em 403 jogos — e nunca marcou um pênalti. Depois ganhou o Pichichi na Espanha, tornando-se o primeiro brasileiro a conquistar o prêmio.',
    scores: { producao: 100, titulos: 72, campanhas: 70, classicos: 85, decisivos: 75, premiacoes: 90, longevidade: 85 },
    classicos: { Flamengo: 30, Vasco: 26, Botafogo: 22 },
    decisivos: { finais: 14, semis: 20, quartas: 16 },
    premios: ['Maior artilheiro da história do Flu (319 gols)', 'Artilheiro Rio-SP 1957 e 1960', 'Artilheiro Carioca 1956 (22 gols)', 'Pichichi La Liga 1966/67 (Valencia CF)', '23 hat-tricks pelo Fluminense', 'Recorde: 62 gols em uma temporada (1959)'],
  },
  {
    id: 'fred',
    nome: 'Fred',
    apelido: 'O Ídolo da Nação',
    periodo: '2009–2016 · 2020–2022',
    posicao: 'Centro-avante',
    gols: 199,
    jogos: 381,
    legenda: 'Dois Brasileiros, dois Cariocas e 199 gols que marcaram para sempre a história tricolor. Fred é o símbolo máximo da era moderna do Fluminense — e o maior artilheiro do clube no século XXI.',
    scores: { producao: 82, titulos: 90, campanhas: 85, classicos: 90, decisivos: 88, premiacoes: 84, longevidade: 85 },
    classicos: { Flamengo: 7, Vasco: 8, Botafogo: 14 },
    decisivos: { finais: 12, semis: 18, quartas: 14 },
    premios: ['Maior artilheiro do Flu no séc. XXI (199 gols)', 'Artilheiro do Flu no Brasileirão (102 gols)', 'Maior artilheiro do Flu na Copa do Brasil (37 gols)', 'Craque do Brasileirão 2012', 'Gol mais bonito da história dos clubes brasileiros (2012)'],
  },
  {
    id: 'cano',
    nome: 'Germán Cano',
    apelido: 'El Monstruo',
    periodo: '2022–hoje',
    posicao: 'Centro-avante',
    gols: 111,
    jogos: 200,
    legenda: 'O gol na final da Libertadores 2023 colocou seu nome em letras de ouro na história do Fluminense. El Monstruo argentino que se tornou eterno tricolor.',
    scores: { producao: 78, titulos: 98, campanhas: 100, classicos: 72, decisivos: 95, premiacoes: 96, longevidade: 55 },
    classicos: { Flamengo: 7, Vasco: 4, Botafogo: 3 },
    decisivos: { finais: 7, semis: 5, quartas: 6 },
    premios: ['Artilheiro da Libertadores 2023 (13 gols)', 'Rei da América 2023', 'Artilheiro do Brasileirão 2022 (26 gols)', 'Artilheiro do Brasil em 2022 (44 gols)', 'Bola de Prata 2022', 'Maior artilheiro do Flu na Libertadores (17 gols)'],
  },
  {
    id: 'orlando',
    nome: 'Orlando',
    apelido: 'Pingo de Ouro',
    periodo: '1945–1954',
    posicao: 'Ponta-esquerda',
    gols: 184,
    jogos: 310,
    legenda: 'Pingo de Ouro — a alcunha diz tudo. O 3º maior artilheiro da história do Flu encantou as arquibancadas do Maracanã com velocidade, drible e gol na era de ouro dos anos 1940 e 50.',
    scores: { producao: 80, titulos: 68, campanhas: 63, classicos: 85, decisivos: 68, premiacoes: 60, longevidade: 75 },
    classicos: { Flamengo: 26, Vasco: 22, Botafogo: 20 },
    decisivos: { finais: 8, semis: 12, quartas: 9 },
    premios: ['3º maior artilheiro histórico do Flu (184 gols)', 'Artilheiro do Carioca 1946', 'Artilheiro da Copa Rio 1952'],
  },
  {
    id: 'hercules',
    nome: 'Hércules',
    apelido: 'O Potência',
    periodo: '1935–1942',
    posicao: 'Centro-avante',
    gols: 165,
    jogos: 176,
    legenda: 'Cinco Cariocas em sete anos e a segunda melhor média de gols da história do clube — 0,94 por jogo. Hércules foi uma máquina tricolor nas décadas de 30 e 40.',
    scores: { producao: 88, titulos: 82, campanhas: 70, classicos: 82, decisivos: 78, premiacoes: 62, longevidade: 52 },
    classicos: { Flamengo: 24, Vasco: 20, Botafogo: 18 },
    decisivos: { finais: 12, semis: 16, quartas: 12 },
    premios: ['4º maior artilheiro histórico do Flu (165 gols)', '2ª melhor média de gols (0,94 gols/jogo)', '5× Campeão Carioca (1936, 1937, 1938, 1940, 1941)'],
  },
  {
    id: 'tele',
    nome: 'Telê Santana',
    apelido: 'O Mágico',
    periodo: '1951–1960',
    posicao: 'Meia-atacante',
    gols: 162,
    jogos: 557,
    legenda: 'Antes de ser o técnico mais amado do Brasil, Telê Santana passou 557 jogos com a camisa tricolor. O jogador mais elegante da história do clube, segundo a própria torcida.',
    scores: { producao: 55, titulos: 80, campanhas: 75, classicos: 65, decisivos: 70, premiacoes: 58, longevidade: 100 },
    classicos: { Flamengo: 14, Vasco: 12, Botafogo: 10 },
    decisivos: { finais: 10, semis: 16, quartas: 12 },
    premios: ['Um dos que mais jogou pelo Flu (557 jogos — 3ª marca histórica)', 'Jogador mais elegante da história segundo a torcida', 'Técnico da Seleção Brasileira (Copas 1982 e 1986)'],
  },
  {
    id: 'welfare',
    nome: 'Henry Welfare',
    apelido: 'The Tank',
    periodo: '1913–1924',
    posicao: 'Centro-avante',
    gols: 161,
    jogos: 162,
    legenda: 'Henry Welfare chegou ao Rio em 1913 e construiu o maior legado estrangeiro do Fluminense: 161 gols com a espantosa média de 1 gol por jogo — a melhor de todos os finalistas do ILF.',
    scores: { producao: 90, titulos: 75, campanhas: 68, classicos: 95, decisivos: 72, premiacoes: 72, longevidade: 50 },
    classicos: { Flamengo: 35, Vasco: 18, Botafogo: 28 },
    decisivos: { finais: 8, semis: 10, quartas: 8 },
    premios: ['Maior artilheiro estrangeiro do Flu (161 gols)', 'Maior artilheiro do Flu no Carioca (123 gols)', 'Artilheiro do Carioca 1914 e 1915', 'Membro Vitalício do Conselho Deliberativo do Flu', 'Melhor média do ILF (~1,00 gol/jogo)'],
  },
  {
    id: 'russo',
    nome: 'Russo',
    apelido: 'O Artilheiro Clássico',
    periodo: '1933–1944',
    posicao: 'Centro-avante',
    gols: 155,
    jogos: 259,
    legenda: 'Ao lado de Hércules, Russo dominou o futebol carioca dos anos 30 e 40. Cinco Cariocas e o segundo maior artilheiro estrangeiro da história tricolor.',
    scores: { producao: 76, titulos: 82, campanhas: 70, classicos: 68, decisivos: 75, premiacoes: 58, longevidade: 68 },
    classicos: { Flamengo: 18, Vasco: 16, Botafogo: 14 },
    decisivos: { finais: 10, semis: 14, quartas: 11 },
    premios: ['2º maior artilheiro estrangeiro do Flu (155 gols)', '5× Campeão Carioca (1936, 1937, 1938, 1940, 1941)', 'Artilheiro do Carioca em múltiplas edições'],
  },
  {
    id: 'preguinho',
    nome: 'Preguinho',
    apelido: 'O Pioneiro da Copa',
    periodo: '1925–1938',
    posicao: 'Ponta-direita',
    gols: 128,
    jogos: 174,
    legenda: 'Marcou o primeiro gol do Brasil em Copas do Mundo e foi artilheiro do Carioca cinco vezes consecutivas. Preguinho é o elo entre o futebol pioneiro e a grandeza tricolor.',
    scores: { producao: 73, titulos: 62, campanhas: 70, classicos: 82, decisivos: 70, premiacoes: 88, longevidade: 52 },
    classicos: { Flamengo: 22, Vasco: 15, Botafogo: 20 },
    decisivos: { finais: 8, semis: 12, quartas: 9 },
    premios: ['1º gol do Brasil em Copas do Mundo (14/07/1930 vs Iugoslávia)', '1º capitão da Seleção em Mundiais', 'Artilheiro do Carioca 5× consecutivos (1928–1932)', 'Maior artilheiro das Laranjeiras (~79 gols)', 'Grande Benemérito Atleta do Fluminense (1952)'],
  },
  {
    id: 'washington',
    nome: 'Washington',
    apelido: 'Casal 20',
    periodo: '1983–1989',
    posicao: 'Centro-avante',
    gols: 121,
    jogos: 303,
    legenda: 'Metade do icônico "Casal 20" com Assis — a dupla fez 179 gols pelo Flu. Washington foi o centroavante do Brasileiro 1984 e do tricampeonato carioca, uma figura irreverente e eternamente amada.',
    scores: { producao: 62, titulos: 80, campanhas: 78, classicos: 60, decisivos: 72, premiacoes: 52, longevidade: 75 },
    classicos: { Flamengo: 15, Vasco: 12, Botafogo: 10 },
    decisivos: { finais: 8, semis: 12, quartas: 10 },
    premios: ['Campeão Brasileiro 1984', 'Tricampeão Carioca (1983, 1984, 1985)', '"Casal 20" com Assis — 179 gols juntos pelo Flu'],
  },
  {
    id: 'magno',
    nome: 'Magno Alves',
    apelido: 'O Ressurgimento',
    periodo: '1998–2002',
    posicao: 'Centro-avante',
    gols: 124,
    jogos: 265,
    legenda: 'O símbolo da ressurreição tricolor. Magno Alves guiou o Flu de volta da Série C em 1999, tornando-se ídolo em uma das campanhas mais épicas da história do clube.',
    scores: { producao: 60, titulos: 45, campanhas: 75, classicos: 52, decisivos: 62, premiacoes: 48, longevidade: 68 },
    classicos: { Flamengo: 12, Vasco: 10, Botafogo: 8 },
    decisivos: { finais: 5, semis: 8, quartas: 6 },
    premios: ['Artilheiro da Série C 1999 (título histórico)', 'Campeão Carioca 2002', 'Símbolo da reconstrução tricolor pós-rebaixamento'],
  },
  {
    id: 'ezio',
    nome: 'Ézio',
    apelido: 'Super Ézio',
    periodo: '1991–1995',
    posicao: 'Centro-avante',
    gols: 118,
    jogos: 236,
    legenda: 'Super Ézio foi o grande artilheiro tricolor dos anos 1990, referência do ataque em um período de transição, coroando sua passagem com o título Carioca de 1995.',
    scores: { producao: 60, titulos: 38, campanhas: 40, classicos: 48, decisivos: 48, premiacoes: 40, longevidade: 65 },
    classicos: { Flamengo: 10, Vasco: 8, Botafogo: 7 },
    decisivos: { finais: 4, semis: 7, quartas: 5 },
    premios: ['Campeão Carioca 1995', 'Artilheiro do ataque tricolor nos anos 1990'],
  },
  {
    id: 'escurinho',
    nome: 'Escurinho',
    apelido: 'O Guerreiro',
    periodo: '1950–1958',
    posicao: 'Atacante',
    gols: 111,
    jogos: 238,
    legenda: 'Peça fundamental do histórico time do Rio-São Paulo 1957, Escurinho formou uma das linhas de ataque mais temidas da era de ouro do Fluminense junto com Telê, Waldo e Pinheiro.',
    scores: { producao: 55, titulos: 68, campanhas: 65, classicos: 55, decisivos: 62, premiacoes: 44, longevidade: 65 },
    classicos: { Flamengo: 14, Vasco: 12, Botafogo: 9 },
    decisivos: { finais: 6, semis: 10, quartas: 8 },
    premios: ['Campeão Rio-São Paulo 1957', 'Campeão Carioca 1951 e 1959', 'Integrante do histórico Time dos Guerreiros'],
  },
  {
    id: 'jair',
    nome: 'Jair Francisco',
    apelido: 'O Clássico dos 50',
    periodo: '1949–1959',
    posicao: 'Atacante',
    gols: 107,
    jogos: 233,
    legenda: 'Jair Francisco integrou a geração dourada que trouxe o Rio-São Paulo 1957 e conquistou múltiplos títulos cariocas na era mais gloriosa do Fluminense do século XX.',
    scores: { producao: 52, titulos: 70, campanhas: 65, classicos: 52, decisivos: 62, premiacoes: 42, longevidade: 65 },
    classicos: { Flamengo: 13, Vasco: 10, Botafogo: 8 },
    decisivos: { finais: 7, semis: 11, quartas: 8 },
    premios: ['Campeão Rio-São Paulo 1957', 'Campeão Carioca 1951 e 1959', 'Copa Rio 1952'],
  },
  {
    id: 'zeze',
    nome: 'Zezé',
    apelido: 'O Pós-Guerra',
    periodo: '1944–1952',
    posicao: 'Atacante',
    gols: 106,
    jogos: 232,
    legenda: 'Atacante tricolor dos anos 1940 e início dos 50, Zezé conquistou dois Cariocas e a Copa Rio de 1952, sendo parte fundamental do Fluminense no pós-guerra.',
    scores: { producao: 52, titulos: 62, campanhas: 58, classicos: 50, decisivos: 58, premiacoes: 40, longevidade: 62 },
    classicos: { Flamengo: 12, Vasco: 10, Botafogo: 8 },
    decisivos: { finais: 6, semis: 9, quartas: 7 },
    premios: ['Campeão Carioca 1946 e 1951', 'Copa Rio 1952', 'Artilheiro tricolor do pós-guerra'],
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
