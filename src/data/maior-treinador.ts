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
  longevidade:    number;  // jogos × 1
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
    jogos: 482,
    vitorias: 277,
    empates: 98,
    derrotas: 107,
    legenda: 'O técnico com mais jogos na história do Fluminense. Em três passagens conquistou 3 Cariocas (1951, 1959 e 1973), o Rio-São Paulo 1960 e mais quatro títulos regionais — 64,2% de aproveitamento em 482 jogos.',
    classicos: {
      Flamengo: { v: 16, e: 9, d: 7 },
      Vasco:    { v: 16, e: 9, d: 7 },
      Botafogo: { v: 15, e: 9, d: 8 },
    },
    titulos_raw: { carioca: 3, rio_sp: 1, copa_rio: 4 },
    campanhas_raw: {},
    premios: ['3× Campeão Carioca (1951, 1959, 1973)', 'Campeão Torneio Rio-São Paulo 1960', 'Campeão Torneio José de Paula Junior 1952', 'Campeão Copa Rio-Mundial 1952', 'Campeão Copa das Municipalidades 1953', 'Campeão Torneio de Verão Rio 1973', '64,2% de aproveitamento em 482 jogos'],
    dados_estimados: true,
  },
  {
    id: 'abel-braga',
    nome: 'Abel Braga',
    apelido: 'O Tricolor Eterno',
    periodo: '2005 · 2011–2013 · 2016–2018 · 2022',
    jogos: 352,
    vitorias: 174,
    empates: 77,
    derrotas: 101,
    legenda: 'Quatro passagens, três Cariocas e o Brasileirão 2012. Abel Braga é o técnico mais identificado com o Fluminense moderno — ninguém dirigiu mais vezes o clube nas últimas duas décadas. 57,1% de aproveitamento em 352 jogos.',
    classicos: {
      Flamengo: { v: 15, e: 9, d: 7 },
      Vasco:    { v: 14, e: 9, d: 8 },
      Botafogo: { v: 14, e: 8, d: 9 },
    },
    titulos_raw: { brasileiro: 1, carioca: 3, copa_rio: 1 },
    campanhas_raw: {},
    premios: ['Campeão Brasileiro 2012 (77 pts, 22V-11E-5D)', '3× Campeão Carioca (2005, 2012, 2022)', 'Campeão Troféu Luiz Perido 2012', '57,1% de aproveitamento em 352 jogos', 'Técnico com mais passagens pelo Flu na era moderna'],
  },
  {
    id: 'ondino-vieira',
    nome: 'Ondino Vieira',
    apelido: 'O Arquiteto da Era de Ouro',
    periodo: '1938–1950',
    jogos: 304,
    vitorias: 176,
    empates: 61,
    derrotas: 67,
    legenda: 'O maior campeão de títulos da era clássica tricolor. Com 64,6% de aproveitamento em 304 jogos, Ondino Vieira conquistou 3 Cariocas, o Rio-São Paulo 1940, Torneio Extra 1941 e mais quatro torneios regionais — o ciclo vitorioso mais extenso da história do Fluminense.',
    classicos: {
      Flamengo: { v: 12, e: 5, d: 5 },
      Vasco:    { v: 12, e: 5, d: 5 },
      Botafogo: { v: 12, e: 4, d: 5 },
    },
    titulos_raw: { carioca: 3, rio_sp: 1, copa_rio: 4 },
    campanhas_raw: {},
    premios: [
      '3× Campeão Carioca (1938, 1940, 1941)',
      'Campeão Torneio Rio-São Paulo 1940',
      'Campeão Torneio Extra 1941',
      'Campeão Torneio Municipal 1948',
      'Campeão Torneio Início 1940 e 1941',
      '64,6% de aproveitamento em 304 jogos',
    ],
    dados_estimados: true,
  },
  {
    id: 'renato-gaucho',
    nome: 'Renato Gaúcho',
    apelido: 'O Gaúcho Imortal',
    periodo: '1996 · 2002–2003 · 2007–2008 · 2014 · 2019 · 2024–2025',
    jogos: 248,
    vitorias: 110,
    empates: 62,
    derrotas: 76,
    legenda: 'Ídolo eterno como jogador, campeão como treinador. Renato Gaúcho conquistou a Copa do Brasil 2007, levou o Flu à final da Libertadores 2008 e retornou em 2025 para mais uma campanha histórica — desta vez no Mundial de Clubes. 7 passagens pelo clube.',
    classicos: {
      Flamengo: { v: 7, e: 5, d: 4 },
      Vasco:    { v: 7, e: 5, d: 4 },
      Botafogo: { v: 7, e: 4, d: 5 },
    },
    titulos_raw: { copa_brasil: 1 },
    campanhas_raw: { libertadores_vice: 1, copa_brasil_semi: 1, mundial_semi: 1 },
    premios: ['Campeão Copa do Brasil 2007 (1° título nacional do Flu na competição)', 'Vice-campeão Libertadores 2008 (final vs LDU)', 'Semifinalista Copa do Mundo de Clubes 2025', '52,7% de aproveitamento em 248 jogos · 7 passagens'],
  },
  {
    id: 'fernando-diniz',
    nome: 'Fernando Diniz',
    apelido: 'O Campeão da América',
    periodo: '2019 · 2022–2024',
    jogos: 188,
    vitorias: 91,
    empates: 41,
    derrotas: 56,
    legenda: 'O homem que fez o Fluminense campeão da América. Em 188 jogos e duas passagens, Fernando Diniz conquistou a Copa Libertadores 2023 (2×1 vs Boca no Maracanã), a Recopa Sul-Americana 2024 e o Carioca 2023 — e ainda levou o clube à final do Mundial de Clubes.',
    classicos: {
      // Total confirmado: V=7 E=10 D=19 em ~35 jogos (30% aproveit.) — CNN Brasil/Goal.com
      Flamengo: { v: 4, e: 3, d: 5 },
      Vasco:    { v: 2, e: 4, d: 6 },
      Botafogo: { v: 1, e: 3, d: 8 },
    },
    titulos_raw: { libertadores: 1, recopa: 1, carioca: 1 },
    campanhas_raw: { mundial_vice: 1 },
    premios: ['Campeão Copa Libertadores 2023 (2×1 vs Boca Juniors no Maracanã)', 'Campeão Recopa Sul-Americana 2024', 'Campeão Carioca 2023', 'Vice-campeão Copa do Mundo de Clubes 2023 (vs Manchester City)', '55,6% de aproveitamento em 190 jogos · 30% em clássicos'],
  },
  {
    id: 'tim',
    nome: 'Tim',
    apelido: 'O Campeão dos Anos 60',
    periodo: '1964–1967',
    jogos: 170,
    vitorias: 70,
    empates: 45,
    derrotas: 55,
    legenda: 'Tim — nome de guerra de Elba de Pádua Lima — conquistou o Carioca 1964, a Taça Guanabara 1966 e o Torneio Pará-Guanabara 1966 em 170 jogos pelo Fluminense. 50% de aproveitamento em uma era de alta competitividade.',
    classicos: {
      Flamengo: { v: 5, e: 4, d: 3 },
      Vasco:    { v: 5, e: 4, d: 3 },
      Botafogo: { v: 5, e: 3, d: 4 },
    },
    titulos_raw: { carioca: 1, taca_guanabara: 1, copa_rio: 1 },
    campanhas_raw: {},
    premios: ['Campeão Carioca 1964', 'Campeão Taça Guanabara 1966', 'Campeão Torneio Pará-Guanabara 1966', '50% de aproveitamento em 170 jogos'],
    dados_estimados: true,
  },
  {
    id: 'nelsinho-rosa',
    nome: 'Nelsinho',
    apelido: 'O Campeão dos Anos 80',
    periodo: '1979–1993',
    jogos: 155,
    vitorias: 69,
    empates: 44,
    derrotas: 42,
    legenda: 'Quatro passagens pelo Fluminense entre 1979 e 1993, com dois Cariocas conquistados (1980 e 1985). Nelsinho foi o técnico da era de transição tricolor, mantendo o clube competitivo nas décadas de 80 e início dos 90.',
    classicos: {
      Flamengo: { v: 5, e: 3, d: 3 },
      Vasco:    { v: 5, e: 3, d: 2 },
      Botafogo: { v: 5, e: 3, d: 2 },
    },
    titulos_raw: { carioca: 2 },
    campanhas_raw: {},
    premios: ['2× Campeão Carioca (1980 e 1985)', '53,98% de aproveitamento em 155 jogos', '4 passagens pelo Flu (1979–1993)'],
  },
  {
    id: 'silvio-pirilo',
    nome: 'Sílvio Pirilo',
    apelido: 'O Pioneiro Nacional',
    periodo: '1956–1958',
    jogos: 149,
    vitorias: 99,
    empates: 23,
    derrotas: 27,
    legenda: 'Conduziu o Fluminense ao primeiro título nacional da história do clube: o Torneio Rio-São Paulo de 1957. Com 71,6% de aproveitamento em 149 jogos, é o técnico com maior percentual de vitórias da lista.',
    classicos: {
      Flamengo: { v: 5, e: 3, d: 2 },
      Vasco:    { v: 5, e: 3, d: 2 },
      Botafogo: { v: 5, e: 3, d: 2 },
    },
    titulos_raw: { rio_sp: 1 },
    campanhas_raw: {},
    premios: ['Campeão Torneio Rio-São Paulo 1957 (1° título nacional do Flu)', '71,6% de aproveitamento em 149 jogos — maior da lista', 'Primeiro técnico do Flu a ganhar título nacional'],
    dados_estimados: true,
  },
  {
    id: 'parreira',
    nome: 'Carlos Alberto Parreira',
    apelido: 'O Ressurrector',
    periodo: '1972 · 1975 · 1984 · 1999–2001 · 2009',
    jogos: 144,
    vitorias: 65,
    empates: 32,
    derrotas: 47,
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
    periodo: '2016',
    jogos: 52,
    vitorias: 22,
    empates: 15,
    derrotas: 15,
    legenda: 'Em uma única passagem de 52 jogos em 2016, Levir Culpi conquistou a Copa Sul-Minas-Rio — título regional inédito para o Fluminense. 51,9% de aproveitamento em um período de crise financeira no clube.',
    classicos: {
      // Confirmados: Fla 0-0 (mar) + 2-1 (jun); Vas 0-1 (abr); Bot 1-1 (mar) + 0-1 (abr)
      Flamengo: { v: 2, e: 2, d: 1 },
      Vasco:    { v: 1, e: 1, d: 2 },
      Botafogo: { v: 1, e: 2, d: 2 },
    },
    titulos_raw: { copa_rio: 1 },
    campanhas_raw: {},
    premios: ['Campeão Copa Sul-Minas-Rio 2016', '51,9% de aproveitamento em 52 jogos'],
  },
  {
    id: 'cristovao-borges',
    nome: 'Cristóvão Borges',
    apelido: 'O Navegador da Tempestade',
    periodo: '2014–2015',
    jogos: 58,
    vitorias: 28,
    empates: 11,
    derrotas: 19,
    legenda: 'Assumiu o Flu em plena Copa do Mundo de 2014, num período de crise com a saída do patrocinador Unimed. 54,6% de aproveitamento em 58 jogos — sem títulos, mas com solidez tática no momento mais turbulento do clube.',
    classicos: {
      Flamengo: { v: 2, e: 1, d: 1 },
      Vasco:    { v: 2, e: 1, d: 1 },
      Botafogo: { v: 2, e: 1, d: 1 },
    },
    titulos_raw: {},
    campanhas_raw: {},
    premios: ['54,6% de aproveitamento em 58 jogos', 'Liderou o Flu durante a Copa do Mundo de 2014', 'Sem títulos conquistados'],
  },
  {
    id: 'oswaldo-oliveira',
    nome: 'Oswaldo de Oliveira',
    apelido: 'O Retornante',
    periodo: '2001–2002 · 2006 · 2019',
    jogos: 85,
    vitorias: 40,
    empates: 24,
    derrotas: 21,
    legenda: 'Três passagens pelo Fluminense ao longo de quase duas décadas (2001–2019). Oswaldo de Oliveira manteve 56,5% de aproveitamento em 85 jogos sem jamais conquistar um título — um dos maiores índices entre técnicos sem taças no clube.',
    classicos: {
      Flamengo: { v: 3, e: 2, d: 1 },
      Vasco:    { v: 3, e: 2, d: 1 },
      Botafogo: { v: 3, e: 2, d: 2 },
    },
    titulos_raw: {},
    campanhas_raw: { copa_brasil_semi: 1 },
    premios: ['85 jogos com 56,5% de aproveitamento', 'Semifinalista Copa do Brasil 2006', 'Três passagens pelo Flu (2001-02, 2006 e 2019)'],
  },
  {
    id: 'luis-vinhaes',
    nome: 'Luís Vinhaes',
    apelido: 'O Precursor',
    periodo: '1929–1933',
    jogos: 135,
    vitorias: 62,
    empates: 28,
    derrotas: 45,
    legenda: 'Um dos primeiros grandes treinadores do Fluminense na era profissional. Luís Vinhaes esteve no banco tricolor entre 1929 e 1933 — 52,8% de aproveitamento em 135 jogos no período de consolidação do futebol carioca.',
    classicos: {
      Flamengo: { v: 4, e: 2, d: 3 },
      Vasco:    { v: 4, e: 2, d: 3 },
      Botafogo: { v: 4, e: 2, d: 3 },
    },
    titulos_raw: {},
    campanhas_raw: {},
    premios: ['135 jogos no comando do Flu (1929–1933)', '52,8% de aproveitamento', 'Pioneiro da estruturação do futebol tricolor'],
    dados_estimados: true,
  },
  {
    id: 'quincey-taylor',
    nome: 'Quincey Taylor',
    apelido: 'O Professor Inglês',
    periodo: '1917–1918 · 1934–1935',
    jogos: 103,
    vitorias: 60,
    empates: 15,
    derrotas: 28,
    legenda: 'Técnico inglês pioneiro que deu ao Fluminense dois Campeonatos Cariocas (1917 e 1918), encerrando 6 anos de jejum estadual. Na campanha de 1918: 13V-3E-2D. Retornou em 1934-35 para uma segunda passagem de 60 jogos.',
    classicos: {
      Flamengo: { v: 4, e: 2, d: 2 },
      Vasco:    { v: 4, e: 1, d: 3 },
      Botafogo: { v: 4, e: 2, d: 2 },
    },
    titulos_raw: { carioca: 2 },
    campanhas_raw: {},
    premios: ['Campeão Carioca 1917 (encerrou 6 anos de jejum)', 'Campeão Carioca 1918 (13V-3E-2D)', '2º técnico estrangeiro com mais jogos na história do Flu', '63% de aproveitamento em 103 jogos'],
    dados_estimados: true,
  },
  {
    id: 'carlomagno',
    nome: 'Carlomagno',
    apelido: 'O Mestre Uruguaio',
    periodo: '1936–1938',
    jogos: 90,
    vitorias: 60,
    empates: 12,
    derrotas: 18,
    legenda: 'Uruguaio que conduziu o Fluminense ao bicampeonato carioca de 1936 e 1937. Na campanha histórica de 1937, o Flu perdeu apenas 1 partida em 22 jogos e marcou 65 gols — com Hércules artilheiro com 22 gols. Em 1938, passou o comando a Ondino Vieira no meio do Carioca.',
    classicos: {
      Flamengo: { v: 4, e: 1, d: 1 },
      Vasco:    { v: 3, e: 2, d: 2 },
      Botafogo: { v: 4, e: 1, d: 2 },
    },
    titulos_raw: { carioca: 2, copa_rio: 1 },
    campanhas_raw: {},
    premios: ['Campeão Carioca 1936', 'Campeão Carioca 1937 (1 derrota em 22 jogos, 65 gols)', 'Campeão Torneio Municipal 1938', '~72% de aproveitamento em ~90 jogos'],
    dados_estimados: true,
  },
  {
    id: 'gentil-cardoso',
    nome: 'Gentil Cardoso',
    apelido: 'O Magister',
    periodo: '1945–1947',
    jogos: 67,
    vitorias: 44,
    empates: 7,
    derrotas: 16,
    legenda: 'Pioneiro do futebol brasileiro moderno. Ao ser contratado disse "Dêem-me o Ademir que lhes darei o campeonato" — e cumpriu, conquistando o Carioca 1946 com 97 gols em 24 jogos. Revelou o goleiro Castilho e usava megafone nos treinos.',
    classicos: {
      Flamengo: { v: 4, e: 2, d: 2 },
      Vasco:    { v: 3, e: 2, d: 3 },
      Botafogo: { v: 4, e: 1, d: 2 },
    },
    titulos_raw: { carioca: 1 },
    campanhas_raw: {},
    premios: ['Campeão Carioca 1946 (97 gols em 24 jogos)', 'Revelou o goleiro Castilho', '69% de aproveitamento em 67 jogos', 'Pioneiro: usava megafone nos treinos'],
    dados_estimados: true,
  },
  {
    id: 'paulo-emilio',
    nome: 'Paulo Emílio',
    apelido: 'O Arquiteto da Máquina',
    // 1975: saiu em meados da temporada (Parreira assumiu após a TG+Carioca)
    // 1990: Taça Rio + Carioca (vice-final). Passagem de 1976 não confirmada — Travaglini foi técnico em 1976.
    periodo: '1975 · 1990',
    jogos: 68,
    vitorias: 38,
    empates: 12,
    derrotas: 18,
    legenda: 'Criador da lendária "Máquina Tricolor" de 1975, com Rivellino, Palhinha e o melhor Fluminense da era. Conquistou Carioca e Taça Guanabara em 1975 — a final da TG reuniu 96.035 pagantes no Maracanã. Retornou em 1990 para vencer a Taça Rio.',
    classicos: {
      Flamengo: { v: 3, e: 2, d: 2 },
      Vasco:    { v: 2, e: 2, d: 3 },
      Botafogo: { v: 3, e: 2, d: 2 },
    },
    titulos_raw: { carioca: 1, taca_guanabara: 1, copa_rio: 1 },
    campanhas_raw: {},
    premios: ['Campeão Carioca 1975 — a lendária "Máquina Tricolor" com Rivellino', 'Campeão Taça Guanabara 1975 (96.035 pagantes na final contra o América)', 'Campeão Taça Rio 1990 (1º da história do Flu)', '~63% de aproveitamento em ~68 jogos'],
    dados_estimados: true,
  },
  {
    id: 'pinheiro',
    nome: 'Pinheiro',
    apelido: 'O Fiel Tricolor',
    periodo: '1971 · 3 passagens até 1994',
    jogos: 119,
    vitorias: 57,
    empates: 22,
    derrotas: 40,
    legenda: 'Lenda como zagueiro em 605 jogos pelo Flu, voltou ao clube como técnico em três passagens. Na primeira (1971), conquistou a Taça Guanabara de forma interina no lugar de Zagallo, derrotando o Flamengo por 3×1 com hat-trick de Mickey.',
    classicos: {
      Flamengo: { v: 3, e: 3, d: 4 },
      Vasco:    { v: 3, e: 3, d: 4 },
      Botafogo: { v: 3, e: 3, d: 3 },
    },
    titulos_raw: { taca_guanabara: 1 },
    campanhas_raw: {},
    premios: ['Campeão Taça Guanabara 1971 (interino, 3×1 no Fla com hat-trick de Mickey)', '605 jogos como zagueiro — ídolo que virou técnico', '54% de aproveitamento em 119 jogos como treinador'],
    dados_estimados: true,
  },
  {
    id: 'valdir-espinosa',
    nome: 'Valdir Espinosa',
    apelido: 'O Campeão da Libertadores',
    periodo: '1997 · 2000–2001 · 2004',
    jogos: 111,
    vitorias: 45,
    empates: 22,
    derrotas: 44,
    legenda: 'Campeão da Libertadores 1983 e do Mundial de Clubes 1983 pelo Grêmio, Valdir Espinosa teve três passagens pelo Fluminense sem conquistar títulos. Em 2004, o clube qualificou-se para a Copa Sul-Americana sob seu comando.',
    classicos: {
      Flamengo: { v: 3, e: 2, d: 4 },
      Vasco:    { v: 3, e: 3, d: 4 },
      Botafogo: { v: 2, e: 3, d: 4 },
    },
    titulos_raw: {},
    campanhas_raw: {},
    premios: ['Classificou o Flu para a Copa Sul-Americana 2004', '47% de aproveitamento em 111 jogos', 'Campeão da Libertadores 1983 e Mundial 1983 (pelo Grêmio)'],
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

  const longevidade = coach.jogos * 1;

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
