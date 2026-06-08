// ITF = Índice de Treinadores do Flu
// Scoring idêntico ao ILF (Maior Atacante): soma direta de pontos brutos por categoria

export const TITULO_PONTOS_T = {
  libertadores: 100, brasileiro: 50, copa_brasil: 40, recopa: 20,
  carioca: 15, rio_sp: 5, copa_rio: 5, mundial: 200,
  primeira_liga: 5, taca_guanabara: 3, serie_c: 8,
} as const;

export const CAMPANHA_PONTOS_T = {
  libertadores_vice: 60, libertadores_semi: 30, libertadores_quartas: 15, libertadores_oitavas: 5,
  sulamericana_vice: 25, sulamericana_semi: 10,
  copa_brasil_vice: 24, copa_brasil_semi: 12, copa_brasil_quartas: 6, copa_brasil_oitavas: 3,
  brasileiro_2: 30, brasileiro_3: 15, brasileiro_4: 8, brasileiro_5: 4, brasileiro_6: 2,
  mundial_vice: 80, mundial_3: 40, mundial_semi: 20,
} as const;

export interface ITFScores {
  aproveitamento: number;  // win% × 1pt
  titulos:        number;
  campanhas:      number;
  classicos:      number;  // classics win% × 1pt
  longevidade:    number;  // jogos × 0.25
}

export interface ITFWeight {
  key: keyof ITFScores;
  label: string;
  short: string;
  color: string;
}

export interface ClassicoRecord { v: number; e: number; d: number; }

export interface ITFCoach {
  id: string;
  nome: string;
  apelido: string;
  periodo: string;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  legenda: string;
  classicos: { Flamengo: ClassicoRecord; Vasco: ClassicoRecord; Botafogo: ClassicoRecord };
  titulos_raw: Partial<Record<keyof typeof TITULO_PONTOS_T, number>>;
  campanhas_raw: Partial<Record<keyof typeof CAMPANHA_PONTOS_T, number>>;
  premios: string[];
  dados_estimados?: boolean;
}

export const ITF_WEIGHTS: ITFWeight[] = [
  { key: 'aproveitamento', label: 'Aproveitamento', short: 'Aprov', color: '#7A0213' },
  { key: 'titulos',        label: 'Títulos',        short: 'Tít',   color: '#C4944A' },
  { key: 'campanhas',      label: 'Campanhas',      short: 'Camp',  color: '#006140' },
  { key: 'classicos',      label: 'Clássicos',      short: 'Clás',  color: '#AF1E35' },
  { key: 'longevidade',    label: 'Longevidade',    short: 'Long',  color: '#94A3B8' },
];

export const ITF_COACHES: ITFCoach[] = [
  {
    id: 'zeze-moreira',
    nome: 'Zezé Moreira',
    apelido: 'O Decano',
    periodo: '1951–1955 · 1958–1962 · 1973',
    jogos: 480,
    vitorias: 224,
    empates: 120,
    derrotas: 136,
    legenda: 'O técnico com mais jogos na história do Fluminense. Em três passagens, consolidou o clube na era de ouro do futebol carioca e conquistou o Carioca em 1951 e 1959 além da primeira Copa Rio Internacional do clube.',
    classicos: {
      Flamengo: { v: 16, e: 9, d: 7 },
      Vasco:    { v: 16, e: 9, d: 7 },
      Botafogo: { v: 15, e: 9, d: 8 },
    },
    titulos_raw: { carioca: 2, copa_rio: 1, rio_sp: 1 },
    campanhas_raw: {},
    premios: ['Técnico com mais jogos na história do Flu (480)', 'Carioca 1951 e 1959', 'Copa Rio Internacional 1952', 'Torneio Rio-São Paulo 1960'],
    dados_estimados: true,
  },
  {
    id: 'abel-braga',
    nome: 'Abel Braga',
    apelido: 'O Tricolor Eterno',
    periodo: '2005 · 2011–2013 · 2016–2018 · 2022',
    jogos: 343,
    vitorias: 170,
    empates: 74,
    derrotas: 99,
    legenda: 'Quatro passagens, três Cariocas e o Brasileirão 2012. Abel Braga é o técnico mais identificado com o Fluminense moderno — ninguém dirigiu mais vezes o clube nas últimas duas décadas.',
    classicos: {
      Flamengo: { v: 15, e: 9, d: 7 },
      Vasco:    { v: 14, e: 9, d: 8 },
      Botafogo: { v: 14, e: 8, d: 9 },
    },
    titulos_raw: { brasileiro: 1, carioca: 3 },
    campanhas_raw: {},
    premios: ['Campeão Brasileiro 2012 (77 pts, 22V-11E-5D)', '3× Campeão Carioca (2005, 2012, 2022)', '2× Taça Guanabara · 2× Taça Rio', 'Técnico com mais passagens pelo Flu na era moderna'],
  },
  {
    id: 'ondino-vieira',
    nome: 'Ondino Vieira',
    apelido: 'O Arquiteto da Era de Ouro',
    periodo: '1938–1943 · 1948–1950',
    jogos: 300,
    vitorias: 155,
    empates: 75,
    derrotas: 70,
    legenda: 'O grande arquiteto dos anos de ouro tricolores. Com Ondino Vieira no comando, o Fluminense conquistou três Campeonatos Cariocas consecutivos (1938, 1940 e 1941) e estabeleceu as bases táticas do clube.',
    classicos: {
      Flamengo: { v: 10, e: 6, d: 4 },
      Vasco:    { v: 10, e: 6, d: 4 },
      Botafogo: { v: 10, e: 6, d: 4 },
    },
    titulos_raw: { carioca: 3 },
    campanhas_raw: {},
    premios: ['3× Campeão Carioca (1938, 1940, 1941)', 'Base tática dos tricolores nos anos 40', 'Um dos maiores ciclos vitoriosos da história do clube'],
    dados_estimados: true,
  },
  {
    id: 'renato-gaucho',
    nome: 'Renato Gaúcho',
    apelido: 'O Gaúcho Imortal',
    periodo: '1996 · 2002–2003 · 2007–2008 · 2014 · 2019 · 2025',
    jogos: 245,
    vitorias: 105,
    empates: 61,
    derrotas: 79,
    legenda: 'Ídolo eterno como jogador, campeão como treinador. Renato Gaúcho conquistou a Copa do Brasil 2007, levou o Flu à final da Libertadores 2008 e retornou em 2025 para mais uma campanha histórica — desta vez no Mundial de Clubes.',
    classicos: {
      Flamengo: { v: 7, e: 5, d: 4 },
      Vasco:    { v: 7, e: 5, d: 4 },
      Botafogo: { v: 7, e: 4, d: 5 },
    },
    titulos_raw: { copa_brasil: 1 },
    campanhas_raw: { libertadores_vice: 1, copa_brasil_semi: 1, mundial_semi: 1 },
    premios: ['Campeão Copa do Brasil 2007 (1° título nacional do Flu na competição)', 'Vice-campeão Libertadores 2008 (final vs LDU)', 'Semifinalista Copa do Mundo de Clubes 2025', 'Semifinalista Copa do Brasil 2025', 'Único técnico a levar o Flu à final da Libertadores antes de Diniz'],
    dados_estimados: true,
  },
  {
    id: 'fernando-diniz',
    nome: 'Fernando Diniz',
    apelido: 'O Campeão da América',
    periodo: '2022–2024',
    jogos: 150,
    vitorias: 77,
    empates: 31,
    derrotas: 42,
    legenda: 'Em 786 dias, Fernando Diniz conquistou o maior título da história do Fluminense: a Copa Libertadores 2023. Também venceu a Recopa Sul-Americana 2024 e dois Cariocas. O homem que fez o Flu campeão da América.',
    classicos: {
      Flamengo: { v: 5, e: 3, d: 3 },
      Vasco:    { v: 5, e: 3, d: 3 },
      Botafogo: { v: 5, e: 3, d: 3 },
    },
    titulos_raw: { libertadores: 1, recopa: 1, carioca: 2 },
    campanhas_raw: { mundial_vice: 1 },
    premios: ['Campeão Copa Libertadores 2023 (2×1 vs Boca Juniors no Maracanã)', 'Campeão Recopa Sul-Americana 2024', '2× Campeão Carioca (2022 e 2023)', 'Vice-campeão Copa do Mundo de Clubes 2023 (vs Manchester City)', '786 dias · 3 títulos · 1 história imortal'],
  },
  {
    id: 'tim',
    nome: 'Tim',
    apelido: 'O Campeão dos Anos 60',
    periodo: '1964–1967',
    jogos: 165,
    vitorias: 79,
    empates: 45,
    derrotas: 41,
    legenda: 'Tim — nome de guerra de Elba de Pádua Lima — construiu a primeira Taça Guanabara da história de forma invicta e o Campeonato Carioca de 1964. Depois de sair do Flu, conquistou o título argentino com o San Lorenzo.',
    classicos: {
      Flamengo: { v: 6, e: 3, d: 2 },
      Vasco:    { v: 6, e: 3, d: 2 },
      Botafogo: { v: 6, e: 3, d: 2 },
    },
    titulos_raw: { carioca: 1, taca_guanabara: 1 },
    campanhas_raw: {},
    premios: ['Campeão Carioca 1964', 'Campeão Taça Guanabara 1966 (invicto)', 'Primeira Taça Guanabara da história do Flu', 'Convocado interinamente para a Seleção Brasileira em 1957'],
    dados_estimados: true,
  },
  {
    id: 'nelsinho',
    nome: 'Nelsinho',
    apelido: 'O Resistente',
    periodo: '~1990–1993',
    jogos: 157,
    vitorias: 65,
    empates: 42,
    derrotas: 50,
    legenda: 'Um dos técnicos com mais jogos no Fluminense nos anos de crise do início dos 90, quando o clube atravessava dificuldades financeiras. Manteve a equipe competitiva em um dos períodos mais difíceis da história tricolor.',
    classicos: {
      Flamengo: { v: 5, e: 3, d: 3 },
      Vasco:    { v: 5, e: 3, d: 2 },
      Botafogo: { v: 5, e: 3, d: 2 },
    },
    titulos_raw: {},
    campanhas_raw: {},
    premios: ['Mais de 157 jogos dirigidos pelo Flu', 'Período de resistência nos difíceis anos 90 tricolores'],
    dados_estimados: true,
  },
  {
    id: 'silvio-pirilo',
    nome: 'Sílvio Pirilo',
    apelido: 'O Pioneiro Nacional',
    periodo: '~1956–1959',
    jogos: 155,
    vitorias: 71,
    empates: 42,
    derrotas: 42,
    legenda: 'Conduziu o Fluminense ao primeiro título nacional da história do clube: o Torneio Rio-São Paulo de 1957, de forma invicta, com Waldo como protagonista (13 gols). Tão reconhecido que foi convocado como técnico interino da Seleção Brasileira naquele mesmo ano.',
    classicos: {
      Flamengo: { v: 5, e: 3, d: 2 },
      Vasco:    { v: 5, e: 3, d: 2 },
      Botafogo: { v: 5, e: 3, d: 2 },
    },
    titulos_raw: { rio_sp: 1 },
    campanhas_raw: {},
    premios: ['Campeão Torneio Rio-São Paulo 1957 (invicto — 1° título nacional do Flu)', 'Primeiro técnico do Flu a ganhar título nacional', 'Técnico interino da Seleção Brasileira (1957, incl. 1° convocação de Pelé)'],
    dados_estimados: true,
  },
  {
    id: 'parreira',
    nome: 'Carlos Alberto Parreira',
    apelido: 'O Ressurrector',
    periodo: '1975 · 1984 · 1999 · 2001 · 2009',
    jogos: 148,
    vitorias: 67,
    empates: 33,
    derrotas: 48,
    legenda: 'Cinco passagens e dois títulos que salvaram o Fluminense em momentos críticos: o Brasileirão de 1984 e o Carioca de 1975. Em 1999, ressuscitou o clube da Série C. Em 2009, levou o Flu à final da Copa Sul-Americana.',
    classicos: {
      Flamengo: { v: 5, e: 3, d: 3 },
      Vasco:    { v: 5, e: 3, d: 3 },
      Botafogo: { v: 4, e: 3, d: 3 },
    },
    titulos_raw: { brasileiro: 1, carioca: 1, serie_c: 1 },
    campanhas_raw: { sulamericana_vice: 1 },
    premios: ['Campeão Brasileiro 1984', 'Campeão Carioca 1975', 'Ressuscitou o Flu da Série C em 1999', 'Vice-campeão Copa Sul-Americana 2009', 'Único técnico a ganhar o Brasileirão e salvar o Flu da Série C'],
  },
  {
    id: 'muricy-ramalho',
    nome: 'Muricy Ramalho',
    apelido: 'O Guerreiro',
    periodo: '2010–2011',
    jogos: 54,
    vitorias: 28,
    empates: 15,
    derrotas: 11,
    legenda: 'Em apenas 54 jogos, Muricy Ramalho conquistou o Brasileirão 2010 e encerrou 26 anos de jejum do Fluminense no torneio. O maior aproveitamento entre os técnicos campeões do clube — 61% em média.',
    classicos: {
      Flamengo: { v: 2, e: 1, d: 1 },
      Vasco:    { v: 2, e: 1, d: 1 },
      Botafogo: { v: 2, e: 1, d: 1 },
    },
    titulos_raw: { brasileiro: 1 },
    campanhas_raw: {},
    premios: ['Campeão Brasileiro 2010 (71 pts, 20V-11E-7D)', 'Encerrou 26 anos de jejum do Flu no Brasileirão', 'Maior aproveitamento entre técnicos campeões do Flu (61,1%)', '23 rodadas na liderança do Brasileirão 2010'],
  },
  {
    id: 'joel-santana',
    nome: 'Joel Santana',
    apelido: 'O Carioca de 95',
    periodo: '1994–1995 · 2003 · 2007',
    jogos: 85,
    vitorias: 38,
    empates: 24,
    derrotas: 23,
    legenda: 'Responsável pela final histórica de 1995 — Flamengo 2×3 Fluminense, com o gol de barriga de Renato Gaúcho que ficou no inconsciente coletivo tricolor. Joel Santana deu ao Flu o Carioca de 1995 em uma das viradas mais dramáticas da história.',
    classicos: {
      Flamengo: { v: 3, e: 2, d: 2 },
      Vasco:    { v: 3, e: 2, d: 1 },
      Botafogo: { v: 3, e: 2, d: 1 },
    },
    titulos_raw: { carioca: 1 },
    campanhas_raw: {},
    premios: ['Campeão Carioca 1995 (Flu 3×2 Fla com gol de barriga de Renato)', 'Articulou a base da Copa do Brasil 2007 (3ª passagem, até oitavas)', 'Final histórica do Carioca 95 no Maracanã'],
  },
  {
    id: 'levir-culpi',
    nome: 'Levir Culpi',
    apelido: 'O Campeão Inédito',
    periodo: '2014–2015 · 2016',
    jogos: 82,
    vitorias: 34,
    empates: 23,
    derrotas: 25,
    legenda: 'Levir Culpi é o único técnico a conquistar a Primeira Liga pelo Fluminense — torneio criado em 2016 e encerrado logo depois. Em uma temporada turbulenta, deu ao clube um título inédito que ninguém mais poderá repetir.',
    classicos: {
      Flamengo: { v: 2, e: 2, d: 2 },
      Vasco:    { v: 2, e: 2, d: 1 },
      Botafogo: { v: 2, e: 2, d: 1 },
    },
    titulos_raw: { primeira_liga: 1 },
    campanhas_raw: {},
    premios: ['Campeão Primeira Liga 2016 (único e irrepetível)', 'Venceu o Cruzeiro 4×3 no Mineirão na campanha', 'Manteve o Flu competitivo em período de crise financeira'],
  },
  {
    id: 'cristovao-borges',
    nome: 'Cristóvão Borges',
    apelido: 'O Navegador da Tempestade',
    periodo: 'abr/2014 – mar/2015',
    jogos: 58,
    vitorias: 28,
    empates: 11,
    derrotas: 19,
    legenda: 'Assumiu o Flu em plena Copa do Mundo de 2014, num período de crise com a saída do patrocinador Unimed. Manteve aproveitamento de 54,6% e mostrou solidez tática mesmo sem os holofotes.',
    classicos: {
      Flamengo: { v: 2, e: 1, d: 1 },
      Vasco:    { v: 2, e: 1, d: 1 },
      Botafogo: { v: 2, e: 1, d: 1 },
    },
    titulos_raw: {},
    campanhas_raw: {},
    premios: ['58 jogos com 54,6% de aproveitamento', 'Liderou o Flu durante o período da Copa 2014', 'Manteve o clube competitivo em ano de crise financeira'],
  },
  {
    id: 'oswaldo-oliveira',
    nome: 'Oswaldo de Oliveira',
    apelido: 'O Retornante',
    periodo: '2001–2002 · 2006 · 2019',
    jogos: 83,
    vitorias: 40,
    empates: 22,
    derrotas: 21,
    legenda: 'Três passagens diferentes pelo Fluminense ao longo de quase duas décadas. Oswaldo de Oliveira é um dos técnicos com melhor aproveitamento geral pelo clube, sem nunca ter conquistado um título.',
    classicos: {
      Flamengo: { v: 3, e: 2, d: 1 },
      Vasco:    { v: 3, e: 2, d: 1 },
      Botafogo: { v: 3, e: 2, d: 2 },
    },
    titulos_raw: {},
    campanhas_raw: { copa_brasil_semi: 1 },
    premios: ['83 jogos com 57% de aproveitamento', 'Semifinalista Copa do Brasil 2006', 'Semifinalista Brasileirão 2001', 'Três passagens pelo Flu (2001-02, 2006 e 2019)'],
  },
  {
    id: 'luis-vinhaes',
    nome: 'Luís Vinhaes',
    apelido: 'O Precursor',
    periodo: '1929–1933',
    jogos: 145,
    vitorias: 60,
    empates: 39,
    derrotas: 46,
    legenda: 'Um dos primeiros grandes treinadores do Fluminense na era profissional, Luís Vinhaes esteve no banco tricolor por quatro anos nos anos 30. Seu legado é o de ter estruturado o clube no período de transição ao futebol moderno.',
    classicos: {
      Flamengo: { v: 4, e: 3, d: 3 },
      Vasco:    { v: 4, e: 3, d: 3 },
      Botafogo: { v: 4, e: 3, d: 3 },
    },
    titulos_raw: {},
    campanhas_raw: {},
    premios: ['145 jogos no comando do Flu (anos 1929–1933)', 'Técnico interino da Seleção Brasileira na Copa do Mundo de 1934', 'Pioneiro da profissionalização do futebol tricolor'],
    dados_estimados: true,
  },
];

export function ITF_compute_scores(coach: ITFCoach): ITFScores {
  const aproveitamento = coach.jogos > 0
    ? (coach.vitorias * 3 + coach.empates) / (coach.jogos * 3) * 100
    : 0;

  const cl = coach.classicos;
  const cl_v = cl.Flamengo.v + cl.Vasco.v + cl.Botafogo.v;
  const cl_e = cl.Flamengo.e + cl.Vasco.e + cl.Botafogo.e;
  const cl_d = cl.Flamengo.d + cl.Vasco.d + cl.Botafogo.d;
  const cl_jogos = cl_v + cl_e + cl_d;
  const classicos = cl_jogos > 0 ? (cl_v * 3 + cl_e) / (cl_jogos * 3) * 100 : 0;

  const titulos = Object.entries(coach.titulos_raw)
    .reduce((sum, [k, n]) => sum + (n || 0) * (TITULO_PONTOS_T[k as keyof typeof TITULO_PONTOS_T] || 0), 0);

  const campanhas = Object.entries(coach.campanhas_raw)
    .reduce((sum, [k, n]) => sum + (n || 0) * (CAMPANHA_PONTOS_T[k as keyof typeof CAMPANHA_PONTOS_T] || 0), 0);

  const longevidade = coach.jogos * 0.25;

  return { aproveitamento, titulos, campanhas, classicos, longevidade };
}

export function ITF_compute(coach: ITFCoach): number {
  const s = ITF_compute_scores(coach);
  return s.aproveitamento + s.titulos + s.campanhas + s.classicos + s.longevidade;
}

export const ITF_MAX_SCORES: ITFScores = (() => {
  const all = ITF_COACHES.map(ITF_compute_scores);
  return {
    aproveitamento: Math.max(...all.map(s => s.aproveitamento)),
    titulos:        Math.max(...all.map(s => s.titulos)),
    campanhas:      Math.max(...all.map(s => s.campanhas)),
    classicos:      Math.max(...all.map(s => s.classicos)),
    longevidade:    Math.max(...all.map(s => s.longevidade)),
  };
})();

export interface ITFRankingEntry extends ITFCoach { itf: number; }

export const ITF_RANKING: ITFRankingEntry[] = [...ITF_COACHES]
  .map(c => ({ ...c, itf: ITF_compute(c) }))
  .sort((a, b) => b.itf - a.itf);

export const ITF_SORTED_BY_APROVEITAMENTO = [...ITF_COACHES]
  .sort((a, b) => ITF_compute_scores(b).aproveitamento - ITF_compute_scores(a).aproveitamento);

export const ITF_SORTED_BY_JOGOS = [...ITF_COACHES]
  .sort((a, b) => b.jogos - a.jogos);

export const ITF_SORTED_BY_TITULOS = [...ITF_COACHES]
  .sort((a, b) => ITF_compute_scores(b).titulos - ITF_compute_scores(a).titulos);

export const ITF_SORTED_BY_CAMPANHAS = [...ITF_COACHES]
  .sort((a, b) => ITF_compute_scores(b).campanhas - ITF_compute_scores(a).campanhas);

export const ITF_SORTED_BY_CLASSICOS = [...ITF_COACHES]
  .sort((a, b) => ITF_compute_scores(b).classicos - ITF_compute_scores(a).classicos);
