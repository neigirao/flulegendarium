
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

interface PlayerSpecialty {
  player_name: string;
  total_attempts: number;
  correct_attempts: number;
  success_rate: number;
  category: 'strength' | 'weakness' | 'average';
}

export const useUserSpecialties = (userId: string) => {
  const { data: attemptsData = [], isLoading } = useQuery({
    queryKey: ['user-specialties', userId],
    queryFn: async () => {
      console.log('🎯 Buscando especialidades do usuário:', userId);
      
      const { data, error } = await supabase
        .from('game_attempts')
        .select('target_player_name, is_correct, created_at')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erro ao buscar tentativas:', error);
        throw error;
      }
      
      console.log('✅ Tentativas carregadas:', data?.length || 0);
      return data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const specialties = useMemo((): { strengths: PlayerSpecialty[], weaknesses: PlayerSpecialty[] } => {
    if (!attemptsData.length) return { strengths: [], weaknesses: [] };

    // Agrupar tentativas por jogador
    const playerStats = attemptsData.reduce((acc, attempt) => {
      const playerName = attempt.target_player_name;
      if (!playerName) return acc;
      
      if (!acc[playerName]) {
        acc[playerName] = {
          total_attempts: 0,
          correct_attempts: 0
        };
      }
      
      acc[playerName].total_attempts++;
      if (attempt.is_correct) {
        acc[playerName].correct_attempts++;
      }
      
      return acc;
    }, {} as Record<string, { total_attempts: number; correct_attempts: number }>);

    // Converter para array e calcular taxa de sucesso
    const playerSpecialties: PlayerSpecialty[] = Object.entries(playerStats)
      .map(([playerName, stats]) => {
        const successRate = stats.total_attempts > 0 ? 
          (stats.correct_attempts / stats.total_attempts) * 100 : 0;
        
        let category: PlayerSpecialty['category'] = 'average';
        if (successRate >= 80) category = 'strength';
        else if (successRate <= 40) category = 'weakness';
        
        return {
          player_name: playerName,
          total_attempts: stats.total_attempts,
          correct_attempts: stats.correct_attempts,
          success_rate: successRate,
          category
        };
      })
      .filter(player => player.total_attempts >= 3); // Filtrar jogadores com poucos dados

    // Separar pontos fortes e fracos
    const strengths = playerSpecialties
      .filter(player => player.category === 'strength')
      .sort((a, b) => b.success_rate - a.success_rate)
      .slice(0, 10);

    const weaknesses = playerSpecialties
      .filter(player => player.category === 'weakness')
      .sort((a, b) => a.success_rate - b.success_rate)
      .slice(0, 10);

    return { strengths, weaknesses };
  }, [attemptsData]);

  return {
    strengths: specialties.strengths,
    weaknesses: specialties.weaknesses,
    isLoading
  };
};
