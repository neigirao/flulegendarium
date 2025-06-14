
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
  points: number; // pontos que a conquista dá
  hidden?: boolean; // conquistas secretas
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

export const ACHIEVEMENTS: Achievement[] = [
  // Conquistas básicas
  {
    id: 'first_goal',
    name: 'Primeiro Gol',
    description: 'Acerte seu primeiro jogador',
    icon: '⚽',
    category: 'skill',
    condition: { type: 'score', value: 5, operator: 'gte' },
    rarity: 'common',
    points: 10
  },
  {
    id: 'hat_trick',
    name: 'Hat-trick',
    description: 'Acerte 3 jogadores consecutivos',
    icon: '🎩',
    category: 'streak',
    condition: { type: 'streak', value: 3, operator: 'gte' },
    rarity: 'rare',
    points: 25
  },
  
  // Conquistas por posição
  {
    id: 'goalkeeper_master',
    name: 'Mestre dos Goleiros',
    description: 'Acerte 10 goleiros diferentes',
    icon: '🥅',
    category: 'position',
    condition: { type: 'position_specialist', value: 10, operator: 'gte', extra: 'goalkeeper' },
    rarity: 'epic',
    points: 50
  },
  {
    id: 'striker_specialist',
    name: 'Especialista em Atacantes',
    description: 'Acerte 15 atacantes diferentes',
    icon: '🎯',
    category: 'position',
    condition: { type: 'position_specialist', value: 15, operator: 'gte', extra: 'forward' },
    rarity: 'rare',
    points: 30
  },
  {
    id: 'defender_expert',
    name: 'Expert em Defensores',
    description: 'Acerte 12 defensores diferentes',
    icon: '🛡️',
    category: 'position',
    condition: { type: 'position_specialist', value: 12, operator: 'gte', extra: 'defender' },
    rarity: 'rare',
    points: 30
  },
  
  // Conquistas comportamentais
  {
    id: 'speed_demon',
    name: 'Raio Tricolor',
    description: 'Acerte um jogador em menos de 3 segundos',
    icon: '⚡',
    category: 'time',
    condition: { type: 'time', value: 3, operator: 'lte' },
    rarity: 'epic',
    points: 40
  },
  {
    id: 'persistent_player',
    name: 'Persistente',
    description: 'Continue jogando após 5 erros consecutivos',
    icon: '💪',
    category: 'behavioral',
    condition: { type: 'streak', value: -5, operator: 'lte' },
    rarity: 'rare',
    points: 25
  },
  {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'Mantenha 100% de acerto em 10 jogos',
    icon: '🎯',
    category: 'skill',
    condition: { type: 'accuracy', value: 100, operator: 'eq' },
    rarity: 'legendary',
    points: 100
  },
  
  // Conquistas de conhecimento
  {
    id: 'historian',
    name: 'Historiador Tricolor',
    description: 'Acerte 20 jogadores de épocas passadas',
    icon: '📚',
    category: 'knowledge',
    condition: { type: 'specific_player', value: 20, operator: 'gte', extra: 'historical' },
    rarity: 'epic',
    points: 60
  },
  {
    id: 'modern_expert',
    name: 'Expert Moderno',
    description: 'Acerte 25 jogadores atuais',
    icon: '⭐',
    category: 'knowledge',
    condition: { type: 'specific_player', value: 25, operator: 'gte', extra: 'modern' },
    rarity: 'rare',
    points: 35
  },
  
  // Conquistas especiais e secretas
  {
    id: 'centurion',
    name: 'Centurião',
    description: 'Alcance 100 pontos',
    icon: '💯',
    category: 'skill',
    condition: { type: 'score', value: 100, operator: 'gte' },
    rarity: 'epic',
    points: 50
  },
  {
    id: 'legend_hunter',
    name: 'Caçador de Lendas',
    description: 'Alcance 500 pontos',
    icon: '👑',
    category: 'skill',
    condition: { type: 'score', value: 500, operator: 'gte' },
    rarity: 'legendary',
    points: 150
  },
  {
    id: 'unstoppable',
    name: 'Imparável',
    description: 'Mantenha uma sequência de 15 acertos',
    icon: '🔥',
    category: 'streak',
    condition: { type: 'streak', value: 15, operator: 'gte' },
    rarity: 'legendary',
    points: 120
  },
  {
    id: 'tricolor_heart',
    name: 'Coração Tricolor',
    description: 'Complete seu primeiro jogo',
    icon: '💚',
    category: 'special',
    condition: { type: 'games_played', value: 1, operator: 'gte' },
    rarity: 'common',
    points: 5
  },
  {
    id: 'marathon_runner',
    name: 'Maratonista',
    description: 'Jogue 50 partidas',
    icon: '🏃',
    category: 'knowledge',
    condition: { type: 'games_played', value: 50, operator: 'gte' },
    rarity: 'rare',
    points: 40
  },
  
  // Conquistas secretas
  {
    id: 'night_owl',
    name: 'Coruja Tricolor',
    description: 'Jogue entre 22h e 6h',
    icon: '🦉',
    category: 'behavioral',
    condition: { type: 'time_of_day', value: 1, operator: 'gte', extra: 'night' },
    rarity: 'rare',
    points: 20,
    hidden: true
  },
  {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Jogue entre 5h e 8h',
    icon: '🌅',
    category: 'behavioral',
    condition: { type: 'time_of_day', value: 1, operator: 'gte', extra: 'dawn' },
    rarity: 'rare',
    points: 20,
    hidden: true
  }
];
