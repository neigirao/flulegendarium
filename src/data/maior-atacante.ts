export const TITULO_PONTOS = {
  libertadores: 100, brasileiro: 50, copa_brasil: 40, recopa: 20,
  carioca: 15, rio_sp: 5, copa_rio: 5, mundial: 200, torneio_internacional: 5,
} as const;

export const CAMPANHA_PONTOS = {
  libertadores_vice: 60, libertadores_semi: 30, libertadores_quartas: 15, libertadores_oitavas: 5,
  copa_brasil_vice: 24, copa_brasil_semi: 12, copa_brasil_quartas: 6, copa_brasil_oitavas: 3,
  brasileiro_2: 30, brasileiro_3: 15, brasileiro_4: 8, brasileiro_5: 4, brasileiro_6: 2, brasileiro_7: 1, brasileiro_8: 1,
  mundial_vice: 80, mundial_3: 40, mundial_semi: 20,
} as const;

export const PREMIACAO_PONTOS = {
  rei_america: 35, bola_prata: 25, artilheiro_libertadores: 25,
  melhor_jogador_torneio: 20, artilheiro_nacional: 20, artilheiro_carioca: 20,
  premio_historico_clube: 10,
} as const;

export interface ILFScores {
  producao: number;    // gols × 1pt
  classicos: number;   // classic goal bonus pts
  decisivos: number;   // decisive goal bonus pts
  titulos: number;     // title pts
  campanhas: number;   // campaign phase pts
  longevidade: number; // jogos × 0.25pt
}

export interface ILFWeight {
  key: keyof ILFScores;
  label: string;
  short: string;
  color: string;
}

export interface ILFPlayer {
  id: string; nome: string; apelido: string; periodo: string; posicao: string;
  gols: number; jogos: number; legenda: string;
  classicos: { Flamengo: number; Vasco: number; Botafogo: number };
  decisivos: { finais: number; semis: number; quartas: number; oitavas: number };
  decisivos_por_competicao: { [key: string]: number };
  titulos_raw: Partial<Record<keyof typeof TITULO_PONTOS, number>>;
  campanhas_raw: Partial<Record<keyof typeof CAMPANHA_PONTOS, number>>;
  premiacoes_raw: Partial<Record<keyof typeof PREMIACAO_PONTOS, number>>;
  premios: string[];
  gols_tipos?: ILFGoalTypes;
}

export interface ILFGoalTypes {
  pe?: number;
  cabeca?: number;
  penalti?: number;
  falta?: number;
  bicicleta?: number;
  sem_pulo?: number;
  carrinho?: number;
  olimpico?: number;
  peixinho?: number;
  voleio?: number;
  calcanhar?: number;
  meia_bicicleta?: number;
  peito?: number;
  letra?: number;
  barriga?: number;
  joelho?: number;
  placa?: number;
}

export const ILF_WEIGHTS: ILFWeight[] = [
  { key: 'producao',    label: 'Gols',         short: 'Gols', color: '#7A0213' },
  { key: 'classicos',   label: 'Clássicos',    short: 'Clás', color: '#AF1E35' },
  { key: 'decisivos',   label: 'Decisivos',    short: 'Dec',  color: '#E8B560' },
  { key: 'titulos',     label: 'Títulos',      short: 'Tít',  color: '#C4944A' },
  { key: 'campanhas',   label: 'Campanhas',    short: 'Camp', color: '#006140' },
  { key: 'longevidade', label: 'Longevidade',  short: 'Long', color: '#94A3B8' },
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
    legenda: 'O maior artilheiro da história do Fluminense com 319 gols em 403 jogos. Depois ganhou o Pichichi na Espanha, tornando-se o primeiro brasileiro a conquistar o prêmio.',
    classicos: { Flamengo: 30, Vasco: 26, Botafogo: 22 },
    decisivos: { finais: 2, semis: 2, quartas: 2, oitavas: 0 },
    decisivos_por_competicao: { copa_brasil: 3, libertadores: 3 },
    titulos_raw: { rio_sp: 2, carioca: 1 },
    campanhas_raw: { brasileiro_3: 1 },
    premiacoes_raw: { artilheiro_nacional: 2, artilheiro_carioca: 1 },
    premios: ['Maior artilheiro da história do Flu (319 gols)', 'Artilheiro Rio-SP 1957 e 1960', 'Artilheiro Carioca 1956 (22 gols)', '23 hat-tricks pelo Fluminense', 'Recorde: 62 gols em uma temporada (1959)'],
    gols_tipos: { pe: 276, cabeca: 30, falta: 3, penalti: 3, voleio: 2, calcanhar: 1, meia_bicicleta: 1, peixinho: 1, sem_pulo: 1, letra: 1 },
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
    classicos: { Flamengo: 7, Vasco: 8, Botafogo: 14 },
    decisivos: { finais: 9, semis: 13, quartas: 10, oitavas: 7 },
    decisivos_por_competicao: { libertadores: 9, copa_brasil: 30 },
    titulos_raw: { brasileiro: 2, rio_sp: 1, carioca: 2 },
    campanhas_raw: { libertadores_semi: 1, brasileiro_3: 2, brasileiro_5: 1, brasileiro_6: 1, brasileiro_7: 1 },
    premiacoes_raw: { artilheiro_nacional: 1, melhor_jogador_torneio: 1 },
    premios: ['Maior artilheiro do Flu no séc. XXI (199 gols)', 'Artilheiro do Flu no Brasileirão (102 gols)', 'Maior artilheiro do Flu na Copa do Brasil (37 gols)', 'Campeão Primeira Liga 2016', 'Craque do Brasileirão 2012', 'Gol mais bonito da história dos clubes brasileiros (2012)'],
    gols_tipos: { pe: 102, cabeca: 45, penalti: 41, voleio: 3, bicicleta: 2, carrinho: 2, falta: 2, meia_bicicleta: 1, peito: 1 },
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
    classicos: { Flamengo: 7, Vasco: 4, Botafogo: 3 },
    decisivos: { finais: 5, semis: 5, quartas: 4, oitavas: 3 },
    decisivos_por_competicao: { libertadores: 10, copa_brasil: 7 },
    titulos_raw: { libertadores: 1, recopa: 1, carioca: 2 },
    campanhas_raw: { copa_brasil_semi: 1, mundial_vice: 1, mundial_3: 1, brasileiro_3: 1, brasileiro_5: 1, brasileiro_7: 1 },
    premiacoes_raw: { rei_america: 1, artilheiro_libertadores: 1, artilheiro_nacional: 1, bola_prata: 1 },
    premios: ['Artilheiro da Libertadores 2023 (13 gols)', 'Rei da América 2023', 'Artilheiro do Brasileirão 2022 (26 gols)', 'Artilheiro do Brasil em 2022 (44 gols)', 'Bola de Prata 2022', 'Maior artilheiro do Flu na Libertadores (17 gols)'],
    gols_tipos: { pe: 79, cabeca: 20, penalti: 5, peito: 1, voleio: 1, carrinho: 1, barriga: 1, joelho: 1, placa: 2 },
  },
  {
    id: 'orlando',
    nome: 'Orlando',
    apelido: 'Pingo de Ouro',
    periodo: '1945–1954',
    posicao: 'Ponta-esquerda',
    gols: 186,
    jogos: 310,
    legenda: 'Pingo de Ouro — a alcunha diz tudo. O 3º maior artilheiro da história do Flu encantou as arquibancadas do Maracanã com velocidade, drible e gol na era de ouro dos anos 1940 e 50.',
    classicos: { Flamengo: 26, Vasco: 22, Botafogo: 20 },
    decisivos: { finais: 2, semis: 2, quartas: 1, oitavas: 0 },
    decisivos_por_competicao: { copa_rio: 5 },
    titulos_raw: { carioca: 2, mundial: 1 },
    campanhas_raw: {},
    premiacoes_raw: { artilheiro_carioca: 1 },
    premios: ['3º maior artilheiro histórico do Flu (186 gols)', 'Campeão Mundial Copa Rio Internacional 1952 (Invicto)', 'Artilheiro do Carioca 1946', 'Artilheiro da Copa Rio 1952'],
    gols_tipos: { pe: 163, penalti: 13, cabeca: 6, bicicleta: 4 },
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
    classicos: { Flamengo: 24, Vasco: 20, Botafogo: 18 },
    decisivos: { finais: 0, semis: 0, quartas: 0, oitavas: 0 },
    decisivos_por_competicao: {},
    titulos_raw: { carioca: 5, rio_sp: 1 },
    campanhas_raw: { brasileiro_2: 1 },
    premiacoes_raw: {},
    premios: ['4º maior artilheiro histórico do Flu (165 gols)', '2ª melhor média de gols (0,94 gols/jogo)', '5× Campeão Carioca (1936, 1937, 1938, 1940, 1941)', '2º lugar Torneio dos Campeões 1937', 'Campeão Torneio Rio-São Paulo 1940'],
    gols_tipos: { pe: 125, penalti: 21, falta: 11, cabeca: 8 },
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
    classicos: { Flamengo: 14, Vasco: 12, Botafogo: 10 },
    decisivos: { finais: 2, semis: 3, quartas: 2, oitavas: 0 },
    decisivos_por_competicao: { copa_rio: 3, copa_brasil: 2, libertadores: 2 },
    titulos_raw: { carioca: 2, rio_sp: 2, mundial: 1 },
    campanhas_raw: { brasileiro_3: 1 },
    premiacoes_raw: {},
    premios: ['Um dos que mais jogou pelo Flu (557 jogos — 3ª marca histórica)', 'Jogador mais elegante da história segundo a torcida', '2× Campeão Carioca (1951, 1959)', '2× Campeão Rio-São Paulo (1957, 1960)', 'Campeão Mundial Copa Rio Internacional 1952 (Invicto)'],
    gols_tipos: { pe: 137, cabeca: 16, penalti: 1, falta: 2, bicicleta: 1, carrinho: 1, olimpico: 1, peixinho: 1, sem_pulo: 2 },
  },
  {
    id: 'welfare',
    nome: 'Henry Welfare',
    apelido: 'The Tank',
    periodo: '1913–1924',
    posicao: 'Centro-avante',
    gols: 161,
    jogos: 162,
    legenda: 'Henry Welfare chegou ao Rio em 1913 e construiu o maior legado estrangeiro do Fluminense: 161 gols com a espantosa média de 1 gol por jogo — a melhor de todos os finalistas do Melhor Atacante do Flu.',
    classicos: { Flamengo: 35, Vasco: 18, Botafogo: 28 },
    decisivos: { finais: 0, semis: 0, quartas: 0, oitavas: 0 },
    decisivos_por_competicao: {},
    titulos_raw: { carioca: 3 },
    campanhas_raw: {},
    premiacoes_raw: { artilheiro_carioca: 2, premio_historico_clube: 1 },
    premios: ['Maior artilheiro estrangeiro do Flu (161 gols)', 'Maior artilheiro do Flu no Carioca (123 gols)', '3× Campeão Carioca (1917, 1918, 1919)', 'Artilheiro do Carioca 1914 e 1915', 'Membro Vitalício do Conselho Deliberativo do Flu', 'Melhor média do Melhor Atacante do Flu (~1,00 gol/jogo)'],
    gols_tipos: { pe: 150, cabeca: 9, penalti: 2 },
  },
  {
    id: 'russo',
    nome: 'Russo',
    apelido: 'O Artilheiro Clássico',
    periodo: '1933–1944',
    posicao: 'Centro-avante',
    gols: 155,
    jogos: 259,
    legenda: 'Ao lado de Hércules, Russo dominou o futebol carioca dos anos 30 e 40. Quatro Cariocas e o segundo maior artilheiro estrangeiro da história tricolor.',
    classicos: { Flamengo: 18, Vasco: 16, Botafogo: 14 },
    decisivos: { finais: 0, semis: 0, quartas: 0, oitavas: 0 },
    decisivos_por_competicao: {},
    titulos_raw: { carioca: 4, rio_sp: 1 },
    campanhas_raw: { brasileiro_2: 1 },
    premiacoes_raw: { artilheiro_carioca: 2 },
    premios: ['2º maior artilheiro estrangeiro do Flu (155 gols)', '4× Campeão Carioca (1936, 1937, 1940, 1941)', 'Campeão Rio-São Paulo 1940', '2º lugar Torneio dos Campeões 1937', 'Artilheiro do Carioca em múltiplas edições'],
    gols_tipos: { pe: 128, penalti: 15, cabeca: 9, falta: 3 },
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
    classicos: { Flamengo: 22, Vasco: 15, Botafogo: 20 },
    decisivos: { finais: 0, semis: 0, quartas: 0, oitavas: 0 },
    decisivos_por_competicao: {},
    titulos_raw: { carioca: 3 },
    campanhas_raw: { brasileiro_2: 1 },
    premiacoes_raw: { artilheiro_carioca: 5, premio_historico_clube: 1 },
    premios: ['Artilheiro do Carioca 5× consecutivos (1928–1932)', 'Maior artilheiro das Laranjeiras (~79 gols)', 'Grande Benemérito Atleta do Fluminense (1952)', '3× Campeão Carioca (1936, 1937, 1938)', '2º lugar Torneio dos Campeões 1937'],
    gols_tipos: { pe: 103, cabeca: 10, falta: 9, penalti: 10 },
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
    classicos: { Flamengo: 15, Vasco: 12, Botafogo: 10 },
    decisivos: { finais: 0, semis: 1, quartas: 0, oitavas: 0 },
    decisivos_por_competicao: { libertadores: 1 },
    titulos_raw: { brasileiro: 1, carioca: 3, torneio_internacional: 4 },
    campanhas_raw: { brasileiro_3: 1, brasileiro_6: 1, brasileiro_7: 1 },
    premiacoes_raw: {},
    premios: ['Campeão Brasileiro 1984', 'Tricampeão Carioca (1983, 1984, 1985)', 'Campeão Torneio de Seul 1984', 'Campeão Torneio de Paris 1987', 'Campeão Copa Kirin 1987', 'Campeão Torneio de Kiev 1989', '"Casal 20" com Assis — 179 gols juntos pelo Flu'],
    gols_tipos: { pe: 89, cabeca: 26, carrinho: 1, meia_bicicleta: 1, peixinho: 1, penalti: 1, sem_pulo: 1 },
  },
  {
    id: 'magno',
    nome: 'Magno Alves',
    apelido: 'O Ressurgimento',
    periodo: '1998–2002 · 2016',
    posicao: 'Centro-avante',
    gols: 124,
    jogos: 265,
    legenda: 'O símbolo da ressurreição tricolor. Magno Alves guiou o Flu de volta da Série C em 1999 e foi campeão da Primeira Liga em 2016, tornando-se ídolo em uma das campanhas mais épicas da história do clube.',
    classicos: { Flamengo: 12, Vasco: 10, Botafogo: 8 },
    decisivos: { finais: 1, semis: 2, quartas: 1, oitavas: 0 },
    decisivos_por_competicao: { copa_brasil: 4 },
    titulos_raw: { brasileiro: 1, rio_sp: 1, carioca: 1 },
    campanhas_raw: { copa_brasil_quartas: 1, brasileiro_3: 2, brasileiro_4: 1 },
    premiacoes_raw: { artilheiro_nacional: 1 },
    premios: ['Campeão Brasileiro Série C 1999 (título histórico)', 'Campeão Primeira Liga 2016', 'Campeão Carioca 2002', 'Artilheiro da Série C 1999', 'Símbolo da reconstrução tricolor pós-rebaixamento'],
    gols_tipos: { pe: 105, cabeca: 13, peixinho: 1, penalti: 4, voleio: 1 },
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
    classicos: { Flamengo: 10, Vasco: 8, Botafogo: 7 },
    decisivos: { finais: 0, semis: 1, quartas: 0, oitavas: 0 },
    decisivos_por_competicao: { copa_brasil: 1 },
    titulos_raw: { carioca: 1 },
    campanhas_raw: { copa_brasil_vice: 1, brasileiro_4: 2 },
    premiacoes_raw: {},
    premios: ['Campeão Carioca 1995', 'Vice-campeão Copa do Brasil 1992', 'Artilheiro do ataque tricolor nos anos 1990'],
    gols_tipos: { pe: 81, cabeca: 18, peixinho: 1, penalti: 18 },
  },
  {
    id: 'escurinho',
    nome: 'Escurinho',
    apelido: 'O Guerreiro',
    periodo: '1954–1964',
    posicao: 'Atacante',
    gols: 111,
    jogos: 238,
    legenda: 'Peça fundamental do histórico time do Rio-São Paulo 1957 e 1960, Escurinho formou uma das linhas de ataque mais temidas da era de ouro do Fluminense junto com Telê, Waldo e Pinheiro.',
    classicos: { Flamengo: 14, Vasco: 12, Botafogo: 9 },
    decisivos: { finais: 1, semis: 2, quartas: 1, oitavas: 0 },
    decisivos_por_competicao: { copa_rio: 3, copa_brasil: 1 },
    titulos_raw: { carioca: 2, rio_sp: 2 },
    campanhas_raw: { brasileiro_3: 1 },
    premiacoes_raw: {},
    premios: ['Campeão Rio-São Paulo 1957 e 1960', 'Campeão Carioca 1951 e 1959', 'Integrante do histórico Time dos Guerreiros', '3º lugar Taça Brasil 1960'],
    gols_tipos: { pe: 103, cabeca: 3, sem_pulo: 3, penalti: 1, falta: 1 },
  },
  {
    id: 'jair',
    nome: 'Jair Francisco',
    apelido: 'O Clássico dos 50',
    periodo: '1956–1962',
    posicao: 'Atacante',
    gols: 105,
    jogos: 238,
    legenda: 'Jair Francisco integrou a geração dourada que trouxe o Rio-São Paulo de 1957 e 1960, sendo peça fundamental no ataque tricolor na virada para os anos 1960.',
    classicos: { Flamengo: 13, Vasco: 10, Botafogo: 8 },
    decisivos: { finais: 2, semis: 2, quartas: 1, oitavas: 0 },
    decisivos_por_competicao: { copa_brasil: 1 },
    titulos_raw: { carioca: 1, rio_sp: 2 },
    campanhas_raw: { brasileiro_3: 1 },
    premiacoes_raw: {},
    premios: ['Campeão Rio-São Paulo 1957 e 1960', 'Campeão Carioca 1959', '3º lugar Taça Brasil 1960'],
    gols_tipos: { pe: 103, cabeca: 3, peixinho: 1 },
  },
  {
    id: 'zeze',
    nome: 'Zezé',
    apelido: 'O Pioneiro dos Anos 20',
    periodo: '~1915–1925',
    posicao: 'Atacante',
    gols: 106,
    jogos: 171,
    legenda: 'Um dos grandes artilheiros do Fluminense na era pioneira do futebol carioca. Zezé conquistou quatro Campeonatos Cariocas nos anos 1910 e 1920, deixando sua marca na história tricolor.',
    classicos: { Flamengo: 12, Vasco: 10, Botafogo: 8 },
    decisivos: { finais: 0, semis: 0, quartas: 0, oitavas: 0 },
    decisivos_por_competicao: {},
    titulos_raw: { carioca: 4 },
    campanhas_raw: {},
    premiacoes_raw: {},
    premios: ['4× Campeão Carioca (1917, 1918, 1919, 1924)', 'Um dos maiores artilheiros da era pioneira do Flu'],
    gols_tipos: { pe: 88, penalti: 15, cabeca: 2, falta: 1 },
  },
];

export function ILF_compute_scores(player: ILFPlayer): ILFScores {
  const gols_classicos = player.classicos.Flamengo + player.classicos.Vasco + player.classicos.Botafogo;
  const producao = player.gols;
  const classicos = gols_classicos * 1;
  const decisivos = player.decisivos.finais * 20 + player.decisivos.semis * 10 + player.decisivos.quartas * 2 + player.decisivos.oitavas * 1;
  const titulos = Object.entries(player.titulos_raw)
    .reduce((sum, [k, n]) => sum + (n || 0) * (TITULO_PONTOS[k as keyof typeof TITULO_PONTOS] || 0), 0);
  const campanhas = Object.entries(player.campanhas_raw)
    .reduce((sum, [k, n]) => sum + (n || 0) * (CAMPANHA_PONTOS[k as keyof typeof CAMPANHA_PONTOS] || 0), 0);
  const longevidade = player.jogos * 0.25;
  return { producao, classicos, decisivos, titulos, campanhas, longevidade };
}

export function ILF_compute(player: ILFPlayer): number {
  const s = ILF_compute_scores(player);
  return s.producao + s.classicos + s.decisivos + s.titulos + s.campanhas + s.longevidade;
}

export function ILF_media(player: ILFPlayer): number {
  return player.jogos > 0 ? player.gols / player.jogos : 0;
}

export const ILF_MAX_SCORES: ILFScores = (() => {
  const all = ILF_PLAYERS.map(ILF_compute_scores);
  return {
    producao:    Math.max(...all.map(s => s.producao)),
    classicos:   Math.max(...all.map(s => s.classicos)),
    decisivos:   Math.max(...all.map(s => s.decisivos)),
    titulos:     Math.max(...all.map(s => s.titulos)),
    campanhas:   Math.max(...all.map(s => s.campanhas)),
    longevidade: Math.max(...all.map(s => s.longevidade)),
  };
})();

export interface ILFRankingEntry extends ILFPlayer { ilf: number; }

export const ILF_RANKING: ILFRankingEntry[] = [...ILF_PLAYERS]
  .map(p => ({ ...p, ilf: ILF_compute(p) }))
  .sort((a, b) => b.ilf - a.ilf);

export const ILF_SORTED_BY_GOLS = [...ILF_PLAYERS].sort((a, b) => b.gols - a.gols);

export const ILF_SORTED_BY_JOGOS = [...ILF_PLAYERS].sort((a, b) => b.jogos - a.jogos);

export const ILF_SORTED_BY_CLASSICOS = [...ILF_PLAYERS]
  .map(p => ({ ...p, total: p.classicos.Flamengo + p.classicos.Vasco + p.classicos.Botafogo }))
  .sort((a, b) => b.total - a.total);

export const ILF_SORTED_BY_CAMPANHAS = [...ILF_PLAYERS]
  .sort((a, b) => ILF_compute_scores(b).campanhas - ILF_compute_scores(a).campanhas);

export const ILF_SORTED_BY_DECISIVOS = [...ILF_PLAYERS]
  .sort((a, b) => {
    const da = ILF_compute_scores(a).decisivos;
    const db = ILF_compute_scores(b).decisivos;
    return db - da;
  });
