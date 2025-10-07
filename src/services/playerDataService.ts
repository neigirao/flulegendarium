
import { supabase } from "@/integrations/supabase/client";
import { getReliableImageUrl } from "@/utils/player-image";
import { PlayerListSchema } from "@/schemas/player.schema";
import { validateSupabaseResponse } from "@/utils/validation";
import { logger } from "@/utils/logger";

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

/**
 * Coleta dados de jogadores da Edge Function e valida
 */
export const collectPlayerData = async (): Promise<Player[]> => {
  logger.info("Invocando Edge Function collect-players-data...");
  const { data, error } = await supabase.functions.invoke('collect-players-data');
  
  if (error) {
    logger.error("Erro retornado pela edge function:", error);
    throw new Error(error.message || "Erro ao chamar a função de coleta de dados");
  }

  if (!data || !data.players) {
    logger.error("Formato de resposta inesperado:", data);
    throw new Error("Resposta da função de coleta de dados em formato inesperado");
  }

  // Valida os dados recebidos
  const validation = validateSupabaseResponse(PlayerListSchema, {
    data: data.players,
    error: null,
  });

  if (!validation.success) {
    logger.error(`Dados de jogadores inválidos: ${JSON.stringify(validation.errors)}`);
    throw new Error("Dados recebidos estão em formato inválido");
  }

  logger.info(`Recebidos ${validation.data.length} jogadores válidos da Edge Function`);
  
  // Garantir que todos os jogadores tenham uma imagem confiável e converter para o tipo Player
  const playersWithImages: Player[] = validation.data.map((player) => ({
    id: player.id,
    name: player.name,
    position: player.position,
    image_url: getReliableImageUrl(player as any),
    fun_fact: player.fun_fact,
    achievements: player.achievements,
    year_highlight: player.year_highlight,
    statistics: {
      gols: player.statistics.gols ?? 0,
      jogos: player.statistics.jogos ?? 0,
    },
  }));
  
  // Atualizar as imagens no banco de dados
  for (const player of playersWithImages) {
    try {
      await supabase
        .from('players')
        .update({ image_url: player.image_url })
        .eq('id', player.id);
    } catch (err) {
      logger.error(`Erro ao atualizar imagem do jogador ${player.name}: ${String(err)}`);
    }
  }
  
  return playersWithImages;
};

export const updatePlayerImage = async (playerId: string, imageUrl: string): Promise<void> => {
  const { error } = await supabase
    .from('players')
    .update({ image_url: imageUrl })
    .eq('id', playerId);
  
  if (error) {
    throw error;
  }
};
