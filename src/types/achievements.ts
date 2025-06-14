
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'streak' | 'time' | 'knowledge' | 'special';
  condition: {
    type: 'score' | 'streak' | 'games_played' | 'accuracy' | 'time' | 'specific_player';
    value: number;
    operator: 'gte' | 'lte' | 'eq';
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
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
  {
    id: 'first_goal',
    name: 'Primeiro Gol',
    description: 'Acerte seu primeiro jogador',
    icon: '⚽',
    category: 'skill',
    condition: { type: 'score', value: 5, operator: 'gte' },
    rarity: 'common'
  },
  {
    id: 'hat_trick',
    name: 'Hat-trick',
    description: 'Acerte 3 jogadores consecutivos',
    icon: '🎩',
    category: 'streak',
    condition: { type: 'streak', value: 3, operator: 'gte' },
    rarity: 'rare'
  },
  {
    id: 'speed_demon',
    name: 'Raio',
    description: 'Acerte um jogador em menos de 5 segundos',
    icon: '⚡',
    category: 'time',
    condition: { type: 'time', value: 5, operator: 'lte' },
    rarity: 'epic'
  },
  {
    id: 'centurion',
    name: 'Centurião',
    description: 'Alcance 100 pontos',
    icon: '💯',
    category: 'skill',
    condition: { type: 'score', value: 100, operator: 'gte' },
    rarity: 'epic'
  },
  {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'Mantenha 100% de acerto em 10 jogos',
    icon: '🎯',
    category: 'skill',
    condition: { type: 'accuracy', value: 100, operator: 'eq' },
    rarity: 'legendary'
  },
  {
    id: 'marathon_runner',
    name: 'Maratonista',
    description: 'Jogue 50 partidas',
    icon: '🏃',
    category: 'knowledge',
    condition: { type: 'games_played', value: 50, operator: 'gte' },
    rarity: 'rare'
  },
  {
    id: 'striker_specialist',
    name: 'Especialista em Atacantes',
    description: 'Acerte 20 atacantes',
    icon: '🥅',
    category: 'knowledge',
    condition: { type: 'specific_player', value: 20, operator: 'gte' },
    rarity: 'rare'
  },
  {
    id: 'legend_hunter',
    name: 'Caçador de Lendas',
    description: 'Alcance 500 pontos',
    icon: '👑',
    category: 'skill',
    condition: { type: 'score', value: 500, operator: 'gte' },
    rarity: 'legendary'
  },
  {
    id: 'unstoppable',
    name: 'Imparável',
    description: 'Mantenha uma sequência de 10 acertos',
    icon: '🔥',
    category: 'streak',
    condition: { type: 'streak', value: 10, operator: 'gte' },
    rarity: 'legendary'
  },
  {
    id: 'tricolor_heart',
    name: 'Coração Tricolor',
    description: 'Complete seu primeiro jogo',
    icon: '💚',
    category: 'special',
    condition: { type: 'games_played', value: 1, operator: 'gte' },
    rarity: 'common'
  }
];
