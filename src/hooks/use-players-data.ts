
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/guess-game";
import { convertStatistics } from "@/utils/statistics-converter";
import { useMemo } from "react";

interface DatabasePlayer {
  id: string;
  name: string | null;
  position: string | null;
  image_url: string;
  year_highlight: string | null;
  fun_fact: string | null;
  achievements: string[] | null;
  nicknames: string[] | null;
  statistics: any;
  difficulty_level: string | null;
  difficulty_score: number | null;
  difficulty_confidence: number | null;
  total_attempts: number | null;
  correct_attempts: number | null;
  average_guess_time: number | null;
}

export const usePlayersData = () => {
  const { data: rawPlayers = [], isLoading, error: playersError } = useQuery({
    queryKey: ['players'],
    queryFn: async (): Promise<DatabasePlayer[]> => {
      try {
        console.log("🔍 === CARREGANDO DADOS DOS JOGADORES ===");
        
        const { data, error } = await supabase
          .from('players')
          .select(`
            id,
            name,
            position,
            image_url,
            year_highlight,
            fun_fact,
            achievements,
            nicknames,
            statistics,
            difficulty_level,
            difficulty_score,
            difficulty_confidence,
            total_attempts,
            correct_attempts,
            average_guess_time
          `);
        
        if (error) {
          console.error("❌ Erro ao buscar jogadores:", error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.warn("⚠️ Nenhum jogador encontrado no banco");
          return [];
        }

        console.log(`✅ Jogadores carregados do banco: ${data.length}`);
        
        // Log detalhado dos dados brutos do banco
        console.log("📊 === DADOS BRUTOS DO BANCO ===");
        data.forEach((player, index) => {
          console.log(`${index + 1}. ID: ${player.id}`);
          console.log(`   Nome: ${player.name}`);
          console.log(`   Dificuldade RAW: "${player.difficulty_level}" (tipo: ${typeof player.difficulty_level})`);
          console.log(`   ---`);
        });
        
        // Log da distribuição de dificuldades
        const difficultyCount: Record<string, number> = {};
        data.forEach(player => {
          const difficulty = player.difficulty_level || 'sem_dificuldade';
          difficultyCount[difficulty] = (difficultyCount[difficulty] || 0) + 1;
        });
        console.log("📈 Distribuição de dificuldades (dados brutos):", difficultyCount);
        
        return data;
      } catch (err) {
        console.error("💥 Exceção ao buscar jogadores:", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors  
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });

  // Memoize the transformation to prevent unnecessary re-renders
  const players = useMemo((): Player[] => {
    if (!rawPlayers || rawPlayers.length === 0) return [];

    console.log("🔄 === PROCESSANDO JOGADORES ===");
    
    const processedPlayers = rawPlayers.map((player: DatabasePlayer) => {
      const enhancedPlayer: Player = {
        id: player.id,
        name: player.name || 'Nome não informado',
        position: player.position || 'Posição não informada',
        image_url: player.image_url || '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png',
        year_highlight: player.year_highlight || '',
        fun_fact: player.fun_fact || '',
        achievements: Array.isArray(player.achievements) ? player.achievements : [],
        nicknames: Array.isArray(player.nicknames) ? player.nicknames : [],
        statistics: convertStatistics(player.statistics),
        difficulty_level: player.difficulty_level as any || 'medio',
        difficulty_score: player.difficulty_score || 50,
        difficulty_confidence: player.difficulty_confidence || 0,
        total_attempts: player.total_attempts || 0,
        correct_attempts: player.correct_attempts || 0,
        average_guess_time: player.average_guess_time || 30000
      };
      
      console.log(`🎯 Jogador processado: "${enhancedPlayer.name}"`);
      console.log(`   Dificuldade original: "${player.difficulty_level}"`);
      console.log(`   Dificuldade processada: "${enhancedPlayer.difficulty_level}"`);
      console.log(`   ---`);
      
      return enhancedPlayer;
    });

    // Log final da distribuição após processamento
    const finalDifficultyCount: Record<string, number> = {};
    processedPlayers.forEach(player => {
      const difficulty = player.difficulty_level || 'sem_dificuldade';
      finalDifficultyCount[difficulty] = (finalDifficultyCount[difficulty] || 0) + 1;
    });
    console.log("📈 Distribuição final de dificuldades (após processamento):", finalDifficultyCount);

    return processedPlayers;
  }, [rawPlayers]);

  console.log("🔄 Hook usePlayersData - Players:", players?.length || 0, "Loading:", isLoading, "Error:", !!playersError);

  return {
    players,
    isLoading,
    playersError
  };
};
