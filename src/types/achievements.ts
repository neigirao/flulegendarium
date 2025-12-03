
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'streak' | 'time' | 'knowledge' | 'special' | 'position' | 'behavioral';
  condition: {
    type: 'score' | 'streak' | 'games_played' | 'accuracy' | 'time' | 'specific_player' | 'position_specialist' | 'time_of_day' | 'consecutive_days';
    value: number;
    operator: 'gte' | 'lte' | 'eq';
    extra?: string; // for position, time_range, etc.
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  hidden?: boolean;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress: number;
  max_progress: number;
  created_at: string;
}

// Conquistas temáticas do Fluminense
export const ACHIEVEMENTS: Achievement[] = [
  // =====================
  // CONQUISTAS BÁSICAS
  // =====================
  {
    id: 'coracao_tricolor',
    name: 'Coração Tricolor',
    description: 'Complete seu primeiro jogo - como um verdadeiro torcedor!',
    icon: '💚',
    category: 'special',
    condition: { type: 'games_played', value: 1, operator: 'gte' },
    rarity: 'common',
    points: 5
  },
  {
    id: 'primeiro_campeao',
    name: 'Primeiro Campeão',
    description: 'Acerte seu primeiro jogador - como o primeiro título carioca de 1906',
    icon: '⭐',
    category: 'skill',
    condition: { type: 'score', value: 5, operator: 'gte' },
    rarity: 'common',
    points: 10
  },
  {
    id: 'hat_trick_tricolor',
    name: 'Hat-trick Tricolor',
    description: 'Acerte 3 jogadores consecutivos - como os grandes atacantes',
    icon: '🎩',
    category: 'streak',
    condition: { type: 'streak', value: 3, operator: 'gte' },
    rarity: 'rare',
    points: 25
  },

  // =====================
  // CONQUISTAS DE SEQUÊNCIA (TÍTULOS)
  // =====================
  {
    id: 'titulo_em_casa',
    name: 'Título em Casa',
    description: 'Sequência de 10 acertos - como os títulos no Maracanã',
    icon: '🏟️',
    category: 'streak',
    condition: { type: 'streak', value: 10, operator: 'gte' },
    rarity: 'epic',
    points: 50
  },
  {
    id: 'lenda_viva',
    name: 'Lenda Viva',
    description: 'Sequência de 15 acertos - digno dos maiores ídolos',
    icon: '👑',
    category: 'streak',
    condition: { type: 'streak', value: 15, operator: 'gte' },
    rarity: 'legendary',
    points: 120
  },

  // =====================
  // CONQUISTAS DE PONTUAÇÃO (TÍTULOS HISTÓRICOS)
  // =====================
  {
    id: 'heroi_copacabana',
    name: 'Herói de Copacabana',
    description: 'Alcance 100 pontos - como a final da Libertadores 2023',
    icon: '🌟',
    category: 'skill',
    condition: { type: 'score', value: 100, operator: 'gte' },
    rarity: 'epic',
    points: 50
  },
  {
    id: 'campeao_america',
    name: 'Campeão da América',
    description: 'Alcance 500 pontos - como a gloriosa Libertadores!',
    icon: '🏆',
    category: 'skill',
    condition: { type: 'score', value: 500, operator: 'gte' },
    rarity: 'legendary',
    points: 150
  },

  // =====================
  // CONQUISTAS POR POSIÇÃO (ÍDOLOS)
  // =====================
  {
    id: 'muralha_tricolor',
    name: 'Muralha Tricolor',
    description: 'Acerte 10 goleiros - homenagem a Castilho, Félix e Fábio',
    icon: '🥅',
    category: 'position',
    condition: { type: 'position_specialist', value: 10, operator: 'gte', extra: 'goalkeeper' },
    rarity: 'epic',
    points: 50
  },
  {
    id: 'artilheiro_tricolor',
    name: 'Artilheiro Tricolor',
    description: 'Acerte 15 atacantes - Fred, Romário, Orlando...',
    icon: '🔥',
    category: 'position',
    condition: { type: 'position_specialist', value: 15, operator: 'gte', extra: 'forward' },
    rarity: 'rare',
    points: 30
  },
  {
    id: 'zagueiro_raiz',
    name: 'Zagueiro Raiz',
    description: 'Acerte 12 defensores - a tradição defensiva tricolor',
    icon: '🛡️',
    category: 'position',
    condition: { type: 'position_specialist', value: 12, operator: 'gte', extra: 'defender' },
    rarity: 'rare',
    points: 30
  },

  // =====================
  // CONQUISTAS DE TEMPO
  // =====================
  {
    id: 'raio_laranjeiras',
    name: 'Raio das Laranjeiras',
    description: 'Acerte um jogador em menos de 3 segundos',
    icon: '⚡',
    category: 'time',
    condition: { type: 'time', value: 3, operator: 'lte' },
    rarity: 'epic',
    points: 40
  },

  // =====================
  // CONQUISTAS DE CONHECIMENTO HISTÓRICO
  // =====================
  {
    id: 'historiador_tricolor',
    name: 'Historiador Tricolor',
    description: 'Acerte 20 jogadores de antes de 2000',
    icon: '📚',
    category: 'knowledge',
    condition: { type: 'specific_player', value: 20, operator: 'gte', extra: 'historical' },
    rarity: 'epic',
    points: 60
  },
  {
    id: 'expert_moderno',
    name: 'Expert Moderno',
    description: 'Acerte 25 jogadores do século XXI',
    icon: '✨',
    category: 'knowledge',
    condition: { type: 'specific_player', value: 25, operator: 'gte', extra: 'modern' },
    rarity: 'rare',
    points: 35
  },

  // =====================
  // CONQUISTAS DE DEDICAÇÃO
  // =====================
  {
    id: 'guerreiro_laranjeiras',
    name: 'Guerreiro das Laranjeiras',
    description: 'Jogue 50 partidas - dedicação tricolor',
    icon: '🦅',
    category: 'knowledge',
    condition: { type: 'games_played', value: 50, operator: 'gte' },
    rarity: 'rare',
    points: 40
  },
  {
    id: 'filho_do_maraca',
    name: 'Filho do Maracanã',
    description: 'Jogue 100 partidas - a casa é nossa!',
    icon: '🏟️',
    category: 'knowledge',
    condition: { type: 'games_played', value: 100, operator: 'gte' },
    rarity: 'legendary',
    points: 100
  },

  // =====================
  // CONQUISTAS DE EXCELÊNCIA
  // =====================
  {
    id: 'maquina_tricolor',
    name: 'Máquina Tricolor',
    description: '100% de acerto em 10 jogos - como o time "Máquina" dos anos 70',
    icon: '💪',
    category: 'skill',
    condition: { type: 'accuracy', value: 100, operator: 'eq' },
    rarity: 'legendary',
    points: 100
  },

  // =====================
  // CONQUISTAS SECRETAS (COMPORTAMENTAIS)
  // =====================
  {
    id: 'coruja_laranjeiras',
    name: 'Coruja das Laranjeiras',
    description: 'Jogue entre 22h e 6h - jogos noturnos no Maracanã',
    icon: '🦉',
    category: 'behavioral',
    condition: { type: 'time_of_day', value: 1, operator: 'gte', extra: 'night' },
    rarity: 'rare',
    points: 20,
    hidden: true
  },
  {
    id: 'madrugador_tricolor',
    name: 'Madrugador Tricolor',
    description: 'Jogue entre 5h e 8h - treino cedo como profissional',
    icon: '🌅',
    category: 'behavioral',
    condition: { type: 'time_of_day', value: 1, operator: 'gte', extra: 'dawn' },
    rarity: 'rare',
    points: 20,
    hidden: true
  },
  {
    id: 'persistente_tricolor',
    name: 'Persistente Tricolor',
    description: 'Continue jogando após 5 erros consecutivos - raça tricolor!',
    icon: '💪',
    category: 'behavioral',
    condition: { type: 'streak', value: -5, operator: 'lte' },
    rarity: 'rare',
    points: 25
  }
];
