
import { DecadeInfo, Decade } from "@/types/decade-game";

export const DECADES_INFO: Record<Decade, DecadeInfo> = {
  '1970s': {
    id: '1970s',
    label: 'Anos 70',
    description: 'A era dos grandes craques e do futebol arte',
    period: '1970-1979',
    color: 'bg-accent',
    icon: '🌟'
  },
  '1980s': {
    id: '1980s',
    label: 'Anos 80', 
    description: 'Década de ouro com grandes conquistas',
    period: '1980-1989',
    color: 'bg-primary',
    icon: '🏆'
  },
  '1990s': {
    id: '1990s',
    label: 'Anos 90',
    description: 'Consolidação e grandes ídolos tricolores',
    period: '1990-1999',
    color: 'bg-destructive',
    icon: '⚽'
  },
  '2000s': {
    id: '2000s',
    label: 'Anos 2000',
    description: 'Era moderna com grandes contratações',
    period: '2000-2009',
    color: 'bg-info',
    icon: '🎯'
  },
  '2010s': {
    id: '2010s',
    label: 'Anos 2010',
    description: 'Renascimento tricolor e grandes conquistas',
    period: '2010-2019',
    color: 'bg-secondary',
    icon: '🚀'
  },
  '2020s': {
    id: '2020s',
    label: 'Anos 2020',
    description: 'Era atual com novos talentos e conquistas',
    period: '2020-presente',
    color: 'bg-muted',
    icon: '💫'
  }
};

export const getDecadeInfo = (decade: Decade): DecadeInfo => {
  return DECADES_INFO[decade];
};

export const getAllDecades = (): DecadeInfo[] => {
  return Object.values(DECADES_INFO);
};
