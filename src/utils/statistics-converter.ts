
import { Json } from "@/integrations/supabase/types";

export interface PlayerStatistics {
  gols: number;
  jogos: number;
}

export function convertStatistics(statistics: Json | null | undefined): PlayerStatistics {
  // Default values
  const defaultStats: PlayerStatistics = { gols: 0, jogos: 0 };
  
  // Handle null or undefined
  if (!statistics) {
    console.warn('Statistics is null or undefined, using default values');
    return defaultStats;
  }
  
  // Handle string (should be JSON string)
  if (typeof statistics === 'string') {
    try {
      const parsed = JSON.parse(statistics);
      return validateStatisticsObject(parsed, defaultStats);
    } catch (error) {
      console.error('Failed to parse statistics string:', statistics, error);
      return defaultStats;
    }
  }
  
  // Handle object
  if (typeof statistics === 'object' && statistics !== null) {
    return validateStatisticsObject(statistics, defaultStats);
  }
  
  // Handle other types (number, boolean, etc.)
  console.warn('Unexpected statistics type:', typeof statistics, statistics);
  return defaultStats;
}

function validateStatisticsObject(obj: any, defaultStats: PlayerStatistics): PlayerStatistics {
  if (!obj || typeof obj !== 'object') {
    return defaultStats;
  }
  
  const gols = typeof obj.gols === 'number' && !isNaN(obj.gols) ? obj.gols : 0;
  const jogos = typeof obj.jogos === 'number' && !isNaN(obj.jogos) ? obj.jogos : 0;
  
  return {
    gols: Math.max(0, gols), // Ensure non-negative
    jogos: Math.max(0, jogos) // Ensure non-negative
  };
}
