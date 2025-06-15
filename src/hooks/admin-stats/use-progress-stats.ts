
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

interface ProgressStat {
  step: number;
  count: number;
}

export const useProgressStats = () => {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['admin-progress-stats'],
    queryFn: async () => {
      try {
        console.log('📈 Buscando estatísticas de progresso otimizadas...');
        
        const { data, error } = await supabase
          .from('game_sessions')
          .select('total_correct')
          .not('total_correct', 'is', null)
          .order('total_correct');
        
        if (error) {
          console.error('❌ Erro ao buscar sessões:', error);
          return [];
        }
        
        console.log('✅ Sessões carregadas:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('❌ Erro nas estatísticas de progresso:', error);
        return [];
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutos de cache
    gcTime: 6 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const progressStats = useMemo((): ProgressStat[] => {
    if (!sessions || sessions.length === 0) {
      return [];
    }
    
    const stepCounts: Record<number, number> = sessions.reduce((acc, session) => {
      const step = session.total_correct || 0;
      acc[step] = (acc[step] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return Object.entries(stepCounts)
      .map(([step, count]) => ({ step: parseInt(step), count }))
      .sort((a, b) => a.step - b.step)
      .slice(0, 20); // Limitar para melhor performance
  }, [sessions]);

  return { progressStats, isLoading };
};
