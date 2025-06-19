
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
}

export const usePlayersData = () => {
  console.log("🔄 Iniciando usePlayersData hook...");

  const { data: rawPlayers = [], isLoading, error: playersError } = useQuery({
    queryKey: ['players'],
    queryFn: async (): Promise<DatabasePlayer[]> => {
      try {
        console.log("🔍 Executando query para buscar jogadores...");
        
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .order('name');
        
        if (error) {
          console.error("❌ Erro na query do Supabase:", error);
          throw new Error(`Erro ao buscar jogadores: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          console.warn("⚠️ Query retornou dados vazios");
          return [];
        }

        console.log(`✅ Query executada com sucesso. Jogadores encontrados: ${data.length}`);
        
        // Log dos primeiros jogadores para debug
        if (data.length > 0) {
          console.log("📋 Primeiros 3 jogadores:", data.slice(0, 3).map(p => ({ 
            id: p.id, 
            name: p.name, 
            hasImage: !!p.image_url 
          })));
        }

        return data;
      } catch (err) {
        console.error("💥 Exceção na função queryFn:", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      console.log(`🔄 Tentativa ${failureCount + 1} de buscar jogadores. Erro:`, error?.message);
      
      // Don't retry on 4xx errors  
      if (error?.status >= 400 && error?.status < 500) {
        console.log("❌ Erro 4xx detectado, não tentando novamente");
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Memoize the transformation to prevent unnecessary re-renders
  const players = useMemo((): Player[] => {
    console.log("🔄 Processando dados dos jogadores...", {
      rawPlayersLength: rawPlayers?.length || 0,
      isArray: Array.isArray(rawPlayers)
    });

    if (!Array.isArray(rawPlayers)) {
      console.warn("⚠️ rawPlayers não é um array válido");
      return [];
    }

    if (rawPlayers.length === 0) {
      console.warn("⚠️ rawPlayers está vazio");
      return [];
    }

    try {
      const processedPlayers = rawPlayers.map((player: DatabasePlayer, index: number) => {
        try {
          const enhancedPlayer: Player = {
            id: player.id,
            name: player.name || `Jogador ${index + 1}`,
            position: player.position || 'Posição não informada',
            image_url: player.image_url || '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png',
            year_highlight: player.year_highlight || '',
            fun_fact: player.fun_fact || '',
            achievements: Array.isArray(player.achievements) ? player.achievements : [],
            nicknames: Array.isArray(player.nicknames) ? player.nicknames : [],
            statistics: convertStatistics(player.statistics)
          };
          
          if (index < 3) {
            console.log(`🎯 Jogador ${index + 1} processado:`, {
              name: enhancedPlayer.name,
              hasImage: !!enhancedPlayer.image_url,
              imageUrl: enhancedPlayer.image_url.substring(0, 50) + '...'
            });
          }
          
          return enhancedPlayer;
        } catch (error) {
          console.error(`❌ Erro ao processar jogador ${index}:`, error, player);
          // Return a fallback player instead of breaking the entire array
          return {
            id: player.id || `fallback-${index}`,
            name: `Jogador ${index + 1}`,
            position: 'Posição não informada',
            image_url: '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png',
            year_highlight: '',
            fun_fact: '',
            achievements: [],
            nicknames: [],
            statistics: { gols: 0, jogos: 0 }
          };
        }
      });

      console.log(`✅ Processamento concluído. Total de jogadores válidos: ${processedPlayers.length}`);
      return processedPlayers;
    } catch (error) {
      console.error("❌ Erro crítico no processamento dos jogadores:", error);
      return [];
    }
  }, [rawPlayers]);

  // Enhanced logging
  console.log("📊 Estado final do usePlayersData:", {
    playersCount: players?.length || 0,
    isLoading,
    hasError: !!playersError,
    errorMessage: playersError?.message
  });

  return {
    players: players || [],
    isLoading,
    playersError
  };
};
