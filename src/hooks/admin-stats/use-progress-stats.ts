
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

interface ProgressStat {
  step: number;
  count: number;
}

export const useProgressStats = () => {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['admin-sessions'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('game_sessions').select('*');
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('❌ Erro ao buscar sessões:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
    retry: 1
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
      .sort((a, b) => a.step - b.step);
  }, [sessions]);

  return { progressStats, isLoading };
};
