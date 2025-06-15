
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { useCacheManager } from "./use-cache-manager";

interface PlayerPerformance {
  player_name: string;
  total_attempts: number;
  correct_attempts: number;
  recognition_rate: number;
  difficulty_level: 'Muito Fácil' | 'Fácil' | 'Médio' | 'Difícil' | 'Muito Difícil';
  recent_attempts: number;
  trend_score: number;
}

export const usePlayerPerformance = () => {
  const { getCacheConfig } = useCacheManager();

  const { data: attemptsData = [], isLoading } = useQuery({
    queryKey: ['admin-player-performance'],
    queryFn: async () => {
      console.log('📊 Buscando dados de performance dos jogadores...');
      
      const { data, error } = await supabase
        .from('game_attempts')
        .select('target_player_name, is_correct, created_at')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erro ao buscar tentativas:', error);
        throw error;
      }
      
      console.log('✅ Dados de tentativas carregados:', data?.length || 0);
      return data || [];
    },
    ...getCacheConfig('medium')
  });

  const playerPerformance = useMemo((): PlayerPerformance[] => {
    if (!attemptsData.length) return [];

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Agrupar por jogador
    const playerStats = attemptsData.reduce((acc, attempt) => {
      const playerName = attempt.target_player_name;
      const attemptDate = new Date(attempt.created_at);
      const isRecent = attemptDate >= sevenDaysAgo;
      
      if (!playerName) return acc;
      
      if (!acc[playerName]) {
        acc[playerName] = {
          total_attempts: 0,
          correct_attempts: 0,
          recent_attempts: 0
        };
      }
      
      acc[playerName].total_attempts++;
      if (attempt.is_correct) {
        acc[playerName].correct_attempts++;
      }
      if (isRecent) {
        acc[playerName].recent_attempts++;
      }
      
      return acc;
    }, {} as Record<string, { total_attempts: number; correct_attempts: number; recent_attempts: number }>);

    // Calcular métricas para cada jogador
    return Object.entries(playerStats)
      .map(([name, stats]) => {
        const recognitionRate = stats.total_attempts > 0 ? 
          (stats.correct_attempts / stats.total_attempts) * 100 : 0;
        
        // Determinar nível de dificuldade
        let difficultyLevel: PlayerPerformance['difficulty_level'];
        if (recognitionRate >= 90) difficultyLevel = 'Muito Fácil';
        else if (recognitionRate >= 70) difficultyLevel = 'Fácil';
        else if (recognitionRate >= 50) difficultyLevel = 'Médio';
        else if (recognitionRate >= 30) difficultyLevel = 'Difícil';
        else difficultyLevel = 'Muito Difícil';
        
        // Calcular trend score (tentativas recentes + taxa de acerto)
        const trendScore = stats.recent_attempts * (recognitionRate / 100);
        
        return {
          player_name: name,
          total_attempts: stats.total_attempts,
          correct_attempts: stats.correct_attempts,
          recognition_rate: recognitionRate,
          difficulty_level: difficultyLevel,
          recent_attempts: stats.recent_attempts,
          trend_score: trendScore
        };
      })
      .filter(player => player.total_attempts >= 3) // Filtrar jogadores com poucos dados
      .sort((a, b) => b.total_attempts - a.total_attempts);
  }, [attemptsData]);

  const mostRecognized = useMemo(() => 
    [...playerPerformance]
      .sort((a, b) => b.recognition_rate - a.recognition_rate)
      .slice(0, 10)
  , [playerPerformance]);

  const leastRecognized = useMemo(() => 
    [...playerPerformance]
      .sort((a, b) => a.recognition_rate - b.recognition_rate)
      .slice(0, 10)
  , [playerPerformance]);

  const trendingPlayers = useMemo(() => 
    [...playerPerformance]
      .sort((a, b) => b.recent_attempts - a.recent_attempts)
      .slice(0, 10)
  , [playerPerformance]);

  const averageDifficulty = useMemo(() => {
    if (!playerPerformance.length) return 0;
    const totalRate = playerPerformance.reduce((sum, player) => sum + player.recognition_rate, 0);
    return totalRate / playerPerformance.length;
  }, [playerPerformance]);

  return {
    playerPerformance,
    mostRecognized,
    leastRecognized,
    trendingPlayers,
    averageDifficulty,
    isLoading
  };
};
