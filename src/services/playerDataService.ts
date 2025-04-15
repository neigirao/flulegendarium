
import { supabase } from "@/lib/supabase";
import { getReliableImageUrl } from "@/utils/player-image";

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

export const collectPlayerData = async (): Promise<Player[]> => {
  console.log("Invocando Edge Function collect-players-data...");
  const { data, error } = await supabase.functions.invoke('collect-players-data');
  
  if (error) {
    console.error("Erro retornado pela edge function:", error);
    throw new Error(error.message || "Erro ao chamar a função de coleta de dados");
  }

  if (!data || !data.players) {
    console.error("Formato de resposta inesperado:", data);
    throw new Error("Resposta da função de coleta de dados em formato inesperado");
  }

  console.log(`Recebidos ${data.players.length} jogadores da Edge Function`);
  
  // Garantir que todos os jogadores tenham uma imagem confiável
  const playersWithImages = data.players.map((player: Player) => ({
    ...player,
    image_url: getReliableImageUrl(player)
  }));
  
  // Atualizar as imagens no banco de dados
  for (const player of playersWithImages) {
    try {
      await supabase
        .from('players')
        .update({ image_url: player.image_url })
        .eq('id', player.id);
    } catch (err) {
      console.error(`Erro ao atualizar imagem do jogador ${player.name}:`, err);
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
