
export interface Player {
  id: string;
  name: string;
  position: string;
  image_url: string;
  year_highlight: string;
  fun_fact: string;
  achievements: string[];
  statistics: {
    gols: number;
    jogos: number;
  };
}

export interface NameProcessingResult {
  processedName: string | null;
  confidence: number;
  matchType?: string;
}
