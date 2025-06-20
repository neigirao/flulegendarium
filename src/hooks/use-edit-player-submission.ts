
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Player, DifficultyLevel } from "@/types/guess-game";

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
    
    console.log('🚀 === INICIANDO EDIÇÃO DO JOGADOR ===');
    console.log('  - Player ID:', player.id);
    console.log('  - Nome atual:', player.name);
    console.log('  - Nome novo:', formData.name);
    console.log('  - Dificuldade atual:', player.difficulty_level);
    console.log('  - Nova dificuldade:', formData.difficultyLevel);

    try {
      let finalImageUrl = formData.imageUrl;

      // Upload de imagem se necessário
      if (formData.uploadMethod === 'file' && formData.image) {
        console.log('📸 Fazendo upload da imagem...');
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${formData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('players')
          .upload(fileName, formData.image);

        if (uploadError) {
          console.error('❌ Erro no upload:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('players')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
        console.log('✅ Upload concluído:', finalImageUrl);
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

      console.log('📊 === PREPARANDO DADOS ===');
      console.log('Statistics preparadas:', statisticsData);
      console.log('Nicknames processados:', nicknamesArray);
      console.log('Achievements processados:', achievementsArray);

      // Fazer a atualização campo por campo para evitar conflitos
      console.log('🔄 Executando UPDATE...');
      
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
        console.error('❌ ERRO NO UPDATE:', updateError);
        console.error('Código:', updateError.code);
        console.error('Mensagem:', updateError.message);
        console.error('Detalhes:', updateError.details);
        throw updateError;
      }

      console.log('✅ UPDATE REALIZADO COM SUCESSO!');
      console.log('📊 Dados atualizados:', updatedPlayer);

      toast({
        title: "Sucesso!",
        description: `Jogador ${formData.name} atualizado com sucesso!`,
      });

      // Recarregar a lista
      onPlayerUpdated();

    } catch (error) {
      console.error('💥 === ERRO GERAL ===');
      console.error('Erro completo:', error);
      
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
