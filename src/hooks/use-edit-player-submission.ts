
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
    
    console.log('💾 === INICIANDO ATUALIZAÇÃO SIMPLIFICADA ===');
    console.log('  - ID do jogador:', player.id);
    console.log('  - Nome do jogador:', formData.name);
    console.log('  - Dificuldade que será enviada:', formData.difficultyLevel);
    console.log('  - Tipo da dificuldade:', typeof formData.difficultyLevel);

    try {
      let finalImageUrl = formData.imageUrl;

      // Upload de imagem se necessário
      if (formData.uploadMethod === 'file' && formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${formData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('players')
          .upload(fileName, formData.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('players')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      }

      // Processar dados
      const nicknamesArray = formData.nicknames
        .split(',')
        .map(nick => nick.trim())
        .filter(nick => nick.length > 0);

      const achievementsArray = formData.achievements
        .split(',')
        .map(ach => ach.trim())
        .filter(ach => ach.length > 0);

      // Preparar dados para atualização
      const updateData = {
        name: formData.name.trim(),
        image_url: finalImageUrl,
        nicknames: nicknamesArray,
        position: formData.position.trim(),
        year_highlight: formData.yearHighlight.trim(),
        fun_fact: formData.funFact.trim(),
        achievements: achievementsArray,
        statistics: { gols: formData.gols, jogos: formData.jogos },
        difficulty_level: formData.difficultyLevel
      };

      console.log('📊 === DADOS PARA ATUALIZAÇÃO ===');
      console.log('  - Dados completos:', JSON.stringify(updateData, null, 2));

      // Atualização usando UPDATE normal
      console.log('💾 === TENTATIVA: UPDATE NORMAL ===');
      const { error: updateError, data: updatedData } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', player.id)
        .select('*');

      if (updateError) {
        console.error('❌ Erro no update normal:', updateError);
        throw updateError;
      }

      console.log('✅ Update realizado com sucesso');
      console.log('📊 Dados retornados:', updatedData);

      if (updatedData && updatedData.length > 0) {
        const savedPlayer = updatedData[0];
        console.log('🔍 === VERIFICAÇÃO PÓS-ATUALIZAÇÃO ===');
        console.log('  - Dificuldade salva:', savedPlayer.difficulty_level);
        console.log('  - Dificuldade esperada:', formData.difficultyLevel);
        console.log('  - Match correto?', savedPlayer.difficulty_level === formData.difficultyLevel);
      }

      toast({
        title: "Sucesso!",
        description: `Jogador ${formData.name} atualizado com sucesso! Dificuldade: ${formData.difficultyLevel}`,
      });

      onPlayerUpdated();
    } catch (error) {
      console.error('💥 === ERRO GERAL ===');
      console.error('  - Erro completo:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao atualizar jogador. " + (error instanceof Error ? error.message : 'Erro desconhecido'),
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
