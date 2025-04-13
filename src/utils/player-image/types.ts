
export interface Player {
  id: string;
  name: string;
  position: string;
  image_url: string;
  fun_fact: string;
  achievements: string[];
  year_highlight: string;
  statistics: {
    gols: number;
    jogos: number;
  };
}

export interface CachedImage {
  url: string;
  timestamp: number;
  loaded: boolean;
}
