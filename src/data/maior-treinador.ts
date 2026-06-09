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
  carioca_vice: 7, rio_sp_vice: 2,
} as const;

export interface ITFScores {
  aproveitamento: number;  // win% × 1pt
  titulos:        number;
  campanhas:      number;
  longevidade:    number;  // jogos × 0.25
}

export interface ITFWeight {
  key: keyof ITFScores;
  label: string;
  short: string;
  color: string;
}

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
  titulos_raw: Partial<Record<keyof typeof TITULO_PONTOS_T, number>>;
  campanhas_raw: Partial<Record<keyof typeof CAMPANHA_PONTOS_T, number>>;
  premios: string[];
  dados_estimados?: boolean;
}

export const ITF_WEIGHTS: ITFWeight[] = [
  { key: 'aproveitamento', label: 'Aproveitamento', short: 'Aprov', color: '#7A0213' },
  { key: 'titulos',        label: 'Títulos',        short: 'Tít',   color: '#C4944A' },
  { key: 'campanhas',      label: 'Campanhas',      short: 'Camp',  color: '#006140' },
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
    legenda: 'O técnico com mais jogos na história do Fluminense. Em três passagens conquistou 3 Cariocas (1951, 1959 e 1973), o Rio-São Paulo 1960, a Copa Rio-Mundial 1952 e mais três títulos regionais — 64,2% de aproveitamento em 482 jogos.',
    titulos_raw: { carioca: 3, rio_sp: 1, copa_rio: 3, mundial: 1 },
    campanhas_raw: { carioca_vice: 2, rio_sp_vice: 1 },
    premios: ['3× Campeão Carioca (1951, 1959, 1973)', 'Campeão Copa Rio-Mundial 1952 (título mundial interclubes)', 'Campeão Torneio Rio-São Paulo 1960', 'Campeão Torneio José de Paula Junior 1952', 'Campeão Copa das Municipalidades 1953', 'Campeão Torneio de Verão Rio 1973', '2× Vice-campeão Carioca (1952, 1953)', 'Vice-campeão Torneio Rio-São Paulo 1954', '64,2% de aproveitamento em 482 jogos'],
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
    legenda: 'Quatro passagens, três Cariocas e o Brasileirão 2012. Abel Braga é o técnico mais identificado com o Fluminense moderno — ninguém dirigiu mais vezes o clube nas últimas duas décadas. 56,7% de aproveitamento em 352 jogos.',
    titulos_raw: { brasileiro: 1, carioca: 3, copa_rio: 1 },
    campanhas_raw: { copa_brasil_vice: 1, libertadores_quartas: 2 },
    premios: ['Campeão Brasileiro 2012 (77 pts, 22V-11E-5D)', '3× Campeão Carioca (2005, 2012, 2022)', 'Vice-campeão Copa do Brasil 2005', 'Quartas de final Libertadores 2012', 'Quartas de final Libertadores 2013', 'Campeão Troféu Luiz Perido 2012', '56,7% de aproveitamento em 352 jogos', 'Técnico com mais passagens pelo Flu na era moderna'],
  },
  {
    id: 'ondino-vieira',
    nome: 'Ondino Vieira',
    apelido: 'O Arquiteto da Era de Ouro',
    periodo: '1938–1950',
    jogos: 302,
    vitorias: 176,
    empates: 61,
    derrotas: 67,
    legenda: 'O maior campeão de títulos da era clássica tricolor. Com 65,0% de aproveitamento em 302 jogos, Ondino Vieira conquistou 3 Cariocas, o Rio-São Paulo 1940, Torneio Extra 1941 e mais quatro torneios regionais — o ciclo vitorioso mais extenso da história do Fluminense.',
    titulos_raw: { carioca: 3, rio_sp: 1, copa_rio: 4 },
    campanhas_raw: {},
    premios: [
      '3× Campeão Carioca (1938, 1940, 1941)',
      'Campeão Torneio Rio-São Paulo 1940',
      'Campeão Torneio Extra 1941',
      'Campeão Torneio Municipal 1948',
      'Campeão Torneio Início 1940 e 1941',
      '65,0% de aproveitamento em 302 jogos',
    ],
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
    legenda: 'Ídolo eterno como jogador, campeão como treinador. Renato Gaúcho conquistou a Copa do Brasil 2007, levou o Flu à final da Libertadores 2008 e retornou em 2025 para mais uma campanha histórica — desta vez no Mundial de Clubes. 6 passagens pelo clube.',
    titulos_raw: { copa_brasil: 1 },
    campanhas_raw: { libertadores_vice: 1, copa_brasil_semi: 1, mundial_semi: 1 },
    premios: ['Campeão Copa do Brasil 2007 (1° título nacional do Flu na competição)', 'Vice-campeão Libertadores 2008 (final vs LDU)', 'Semifinalista Copa do Mundo de Clubes 2025', '52,7% de aproveitamento em 248 jogos · 6 passagens'],
  },
  {
    id: 'fernando-diniz',
    nome: 'Fernando Diniz',
    apelido: 'O Campeão da América',
    periodo: '2019 · 2022–2024',
    jogos: 190,
    vitorias: 92,
    empates: 41,
    derrotas: 57,
    legenda: 'O homem que fez o Fluminense campeão da América. Em 190 jogos e duas passagens, Fernando Diniz conquistou a Copa Libertadores 2023 (2×1 vs Boca no Maracanã), a Recopa Sul-Americana 2024 e o Carioca 2023 — e ainda levou o clube à final do Mundial de Clubes.',
    titulos_raw: { libertadores: 1, recopa: 1, carioca: 1 },
    campanhas_raw: { mundial_vice: 1 },
    premios: ['Campeão Copa Libertadores 2023 (2×1 vs Boca Juniors no Maracanã)', 'Campeão Recopa Sul-Americana 2024', 'Campeão Carioca 2023', 'Vice-campeão Copa do Mundo de Clubes 2023 (vs Manchester City)', '55,6% de aproveitamento em 190 jogos'],
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
    titulos_raw: { carioca: 1, taca_guanabara: 1, copa_rio: 1 },
    campanhas_raw: {},
    premios: ['Campeão Carioca 1964', 'Campeão Taça Guanabara 1966', 'Campeão Torneio Pará-Guanabara 1966', '50% de aproveitamento em 170 jogos'],
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
    titulos_raw: { carioca: 2 },
    campanhas_raw: {},
    premios: ['2× Campeão Carioca (1980 e 1985)', '53,98% de aproveitamento em 155 jogos', '4 passagens pelo Flu (1979–1993)'],
  },
  {
    id: 'silvio-pirilo',
    nome: 'Sílvio Pirilo',
    apelido: 'O Pioneiro Nacional',
    periodo: '1956–1958',
    jogos: 148,
    vitorias: 99,
    empates: 23,
    derrotas: 27,
    legenda: 'Conduziu o Fluminense ao primeiro título nacional da história do clube: o Torneio Rio-São Paulo de 1957. Com 72,1% de aproveitamento em 148 jogos, é o técnico com maior percentual de vitórias da lista.',
    titulos_raw: { rio_sp: 1 },
    campanhas_raw: {},
    premios: ['Campeão Torneio Rio-São Paulo 1957 (1° título nacional do Flu)', '3º lugar Campeonato Carioca 1957', '72,1% de aproveitamento em 148 jogos', 'Primeiro técnico do Flu a ganhar título nacional'],
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
    titulos_raw: { carioca: 1 },
    campanhas_raw: {},
    premios: ['Campeão Carioca 1995 (Flu 3×2 Fla com gol de barriga de Renato)', 'Articulou a base da Copa do Brasil 2007 (3ª passagem, até oitavas)', 'Final histórica do Carioca 95 no Maracanã'],
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
    titulos_raw: {},
    campanhas_raw: {},
    premios: ['135 jogos no comando do Flu (1929–1933)', '52,8% de aproveitamento', 'Pioneiro da estruturação do futebol tricolor'],
  },
  {
    id: 'quincey-taylor',
    nome: 'Quincey Taylor',
    apelido: 'O Professor Inglês',
    periodo: '1917–1918 · 1934–1935',
    jogos: 103,
    vitorias: 59,
    empates: 20,
    derrotas: 24,
    legenda: 'Técnico inglês pioneiro que deu ao Fluminense dois Campeonatos Cariocas (1917 e 1918), encerrando 6 anos de jejum estadual. Na campanha de 1918: 13V-3E-2D. Retornou em 1934-35 para uma segunda passagem de 60 jogos.',
    titulos_raw: { carioca: 2 },
    campanhas_raw: {},
    premios: ['Campeão Carioca 1917 (encerrou 6 anos de jejum)', 'Campeão Carioca 1918 (13V-3E-2D)', '2º técnico estrangeiro com mais jogos na história do Flu', '63,8% de aproveitamento em 103 jogos'],
  },
  {
    id: 'carlomagno',
    nome: 'Carlomagno',
    apelido: 'O Mestre Uruguaio',
    periodo: '1936–1938',
    jogos: 90,
    vitorias: 62,
    empates: 13,
    derrotas: 15,
    legenda: 'Uruguaio que conduziu o Fluminense ao bicampeonato carioca de 1936 e 1937. Na campanha histórica de 1937, o Flu perdeu apenas 1 partida em 22 jogos e marcou 65 gols — com Hércules artilheiro com 22 gols. Em 1938, passou o comando a Ondino Vieira no meio do Carioca.',
    titulos_raw: { carioca: 2, copa_rio: 1 },
    campanhas_raw: {},
    premios: ['Campeão Carioca 1936', 'Campeão Carioca 1937 (1 derrota em 22 jogos, 65 gols)', 'Campeão Torneio Municipal 1938', '73,7% de aproveitamento em 90 jogos'],
  },
  {
    id: 'tele-santana',
    nome: 'Telê Santana',
    apelido: 'O Mestre Tricolor',
    periodo: '1967–1969 · 1987–1989',
    jogos: 98,
    vitorias: 50,
    empates: 21,
    derrotas: 27,
    legenda: 'Ídolo eterno como jogador, Telê Santana também foi campeão como técnico do Fluminense. Em três passagens (1967–1989) conquistou o Carioca 1969 e a Taça Guanabara 1969 — antes de construir sua lenda máxima no São Paulo com duas Libertadores.',
    titulos_raw: { carioca: 1, taca_guanabara: 1 },
    campanhas_raw: {},
    premios: ['Campeão Carioca 1969', 'Campeão Taça Guanabara 1969', '58,2% de aproveitamento em 98 jogos · 3 passagens (1967–1989)', 'Conquistou 2× Libertadores como técnico do São Paulo (1992, 1993)'],
  },
  {
    id: 'gentil-cardoso',
    nome: 'Gentil Cardoso',
    apelido: 'O Magister',
    periodo: '1945–1947',
    jogos: 125,
    vitorias: 72,
    empates: 26,
    derrotas: 27,
    legenda: 'Pioneiro do futebol brasileiro moderno. Ao ser contratado disse "Dêem-me o Ademir que lhes darei o campeonato" — e cumpriu, conquistando o Carioca 1946 com 97 gols em 24 jogos. Revelou o goleiro Castilho e usava megafone nos treinos.',
    titulos_raw: { carioca: 1 },
    campanhas_raw: {},
    premios: ['Campeão Carioca 1946 (97 gols em 24 jogos)', 'Revelou o goleiro Castilho', '64,5% de aproveitamento em 125 jogos', 'Pioneiro: usava megafone nos treinos'],
  },
  {
    id: 'paulo-emilio',
    nome: 'Paulo Emílio',
    apelido: 'O Arquiteto da Máquina',
    // 1975: saiu em meados da temporada (Parreira assumiu após a TG+Carioca)
    // 1990: Taça Rio + Carioca (vice-final). Passagem de 1976 não confirmada — Travaglini foi técnico em 1976.
    periodo: '1975 · 1990',
    jogos: 126,
    vitorias: 64,
    empates: 35,
    derrotas: 27,
    legenda: 'Criador da lendária "Máquina Tricolor" de 1975, com Rivellino, Palhinha e o melhor Fluminense da era. Conquistou a Taça Guanabara em 1975 — a final reuniu 96.035 pagantes no Maracanã. Retornou em 1990 para vencer a Taça Rio.',
    titulos_raw: { taca_guanabara: 1, copa_rio: 1 },
    campanhas_raw: {},
    premios: ['Criador da lendária "Máquina Tricolor" de 1975 com Rivellino e Palhinha', 'Campeão Taça Guanabara 1975 (96.035 pagantes na final contra o América)', 'Campeão Taça Rio 1990 (1º da história do Flu)', '60% de aproveitamento em 126 jogos'],
  },
  {
    id: 'pinheiro',
    nome: 'Pinheiro',
    apelido: 'O Fiel Tricolor',
    periodo: '1971 · 1977 · 1994',
    jogos: 115,
    vitorias: 58,
    empates: 26,
    derrotas: 31,
    legenda: 'Lenda como zagueiro pelo Flu, voltou ao clube como técnico em três passagens. Na primeira (1971), conquistou a Taça Guanabara de forma interina no lugar de Zagallo. Em 1977, somou mais três títulos regionais incluindo o Troféu Teresa Herrera na Espanha.',
    titulos_raw: { taca_guanabara: 1, copa_rio: 3 },
    campanhas_raw: {},
    premios: ['Campeão Taça Guanabara 1971 (interino, 3×1 no Fla com hat-trick de Mickey)', 'Campeão Copa Governador Faria Lima 1977', 'Campeão Copa Vale do Paraíba 1977', 'Campeão Troféu Teresa Herrera 1977 (Espanha)', '58% de aproveitamento em 115 jogos como treinador'],
  },
  {
    id: 'valdir-espinosa',
    nome: 'Valdir Espinosa',
    apelido: 'O Campeão da Libertadores',
    periodo: '1997 · 2000–2001 · 2004',
    jogos: 112,
    vitorias: 53,
    empates: 34,
    derrotas: 25,
    legenda: 'Campeão da Libertadores 1983 e do Mundial de Clubes 1983 pelo Grêmio, Valdir Espinosa teve três passagens pelo Fluminense sem conquistar títulos. Em 2004, o clube qualificou-se para a Copa Sul-Americana sob seu comando.',
    titulos_raw: {},
    campanhas_raw: {},
    premios: ['Classificou o Flu para a Copa Sul-Americana 2004', '57,4% de aproveitamento em 112 jogos', 'Campeão da Libertadores 1983 e Mundial 1983 (pelo Grêmio)'],
  },
];

export function ITF_compute_scores(coach: ITFCoach): ITFScores {
  const aproveitamento = coach.jogos > 0
    ? (coach.vitorias * 3 + coach.empates) / (coach.jogos * 3) * 100
    : 0;

  const titulos = Object.entries(coach.titulos_raw)
    .reduce((sum, [k, n]) => sum + (n || 0) * (TITULO_PONTOS_T[k as keyof typeof TITULO_PONTOS_T] || 0), 0);

  const campanhas = Object.entries(coach.campanhas_raw)
    .reduce((sum, [k, n]) => sum + (n || 0) * (CAMPANHA_PONTOS_T[k as keyof typeof CAMPANHA_PONTOS_T] || 0), 0);

  const longevidade = coach.jogos * 0.25;

  return { aproveitamento, titulos, campanhas, longevidade };
}

export function ITF_compute(coach: ITFCoach): number {
  const s = ITF_compute_scores(coach);
  return s.aproveitamento + s.titulos + s.campanhas + s.longevidade;
}

export const ITF_MAX_SCORES: ITFScores = (() => {
  const all = ITF_COACHES.map(ITF_compute_scores);
  return {
    aproveitamento: Math.max(...all.map(s => s.aproveitamento)),
    titulos:        Math.max(...all.map(s => s.titulos)),
    campanhas:      Math.max(...all.map(s => s.campanhas)),
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

