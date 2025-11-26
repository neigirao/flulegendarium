
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Player, DifficultyLevel } from "@/types/guess-game";
import { logger } from "@/utils/logger";

interface UseEditPlayerSubmissionProps {
  player: Player;
  onPlayerUpdated: () => void;
  formData: {
    name: string;
    imageUrl: string;
    image: File | null;
    nicknames: string;
    position: string;
    yearHighlight: string;
    funFact: string;
    achievements: string;
    gols: number;
    jogos: number;
    difficultyLevel: DifficultyLevel;
    uploadMethod: 'file' | 'url';
  };
}

export const useEditPlayerSubmission = ({ 
  player, 
  onPlayerUpdated, 
  formData 
}: UseEditPlayerSubmissionProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, informe o nome do jogador.",
      });
      return;
    }

    setIsLoading(true);
    
    logger.info('Iniciando edição do jogador', 'EditPlayer', {
      playerId: player.id,
      currentName: player.name,
      newName: formData.name,
      currentDifficulty: player.difficulty_level,
      newDifficulty: formData.difficultyLevel
    });

    try {
      let finalImageUrl = formData.imageUrl;

      // Upload de imagem se necessário
      if (formData.uploadMethod === 'file' && formData.image) {
        logger.debug('Fazendo upload da imagem', 'EditPlayer');
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${formData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('players')
          .upload(fileName, formData.image);

        if (uploadError) {
          logger.error('Erro no upload da imagem', 'EditPlayer', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('players')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
        logger.debug('Upload concluído', 'EditPlayer', { url: finalImageUrl });
      }

      // Processar arrays - garantindo que não sejam vazios
      const nicknamesArray = formData.nicknames
        ? formData.nicknames.split(',').map(nick => nick.trim()).filter(nick => nick.length > 0)
        : [];

      const achievementsArray = formData.achievements
        ? formData.achievements.split(',').map(ach => ach.trim()).filter(ach => ach.length > 0)
        : [];

      // Preparar estatísticas como objeto JSON simples
      const statisticsData = {
        gols: Number(formData.gols) || 0,
        jogos: Number(formData.jogos) || 0
      };

      logger.debug('Preparando dados para update', 'EditPlayer', {
        statistics: statisticsData,
        nicknames: nicknamesArray,
        achievements: achievementsArray
      });
      
      const { data: updatedPlayer, error: updateError } = await supabase
        .from('players')
        .update({
          name: formData.name.trim(),
          image_url: finalImageUrl,
          nicknames: nicknamesArray,
          position: formData.position.trim(),
          year_highlight: formData.yearHighlight.trim() || null,
          fun_fact: formData.funFact.trim() || null,
          achievements: achievementsArray,
          statistics: statisticsData,
          difficulty_level: formData.difficultyLevel
        })
        .eq('id', player.id)
        .select()
        .single();

      if (updateError) {
        logger.error('Erro no update do jogador', 'EditPlayer', {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details
        });
        throw updateError;
      }

      logger.info('Jogador atualizado com sucesso', 'EditPlayer', { player: updatedPlayer });

      toast({
        title: "Sucesso!",
        description: `Jogador ${formData.name} atualizado com sucesso!`,
      });

      // Recarregar a lista
      onPlayerUpdated();

    } catch (error) {
      logger.error('Erro geral ao editar jogador', 'EditPlayer', error);
      
      let errorMessage = 'Erro ao atualizar jogador';
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as Error).message;
      }
      
      toast({
        variant: "destructive",
        title: "Erro ao atualizar jogador",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubmit,
  };
};
