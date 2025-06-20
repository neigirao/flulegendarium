
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
    console.log('  - Dificuldade atual no banco:', player.difficulty_level);
    console.log('  - Nova dificuldade selecionada:', formData.difficultyLevel);

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

      // Processar arrays
      const nicknamesArray = formData.nicknames
        .split(',')
        .map(nick => nick.trim())
        .filter(nick => nick.length > 0);

      const achievementsArray = formData.achievements
        .split(',')
        .map(ach => ach.trim())
        .filter(ach => ach.length > 0);

      // Dados para atualização - estrutura simples e direta
      const updateData = {
        name: formData.name.trim(),
        image_url: finalImageUrl,
        nicknames: nicknamesArray,
        position: formData.position.trim(),
        year_highlight: formData.yearHighlight.trim() || null,
        fun_fact: formData.funFact.trim() || null,
        achievements: achievementsArray,
        statistics: {
          gols: Number(formData.gols) || 0,
          jogos: Number(formData.jogos) || 0
        },
        difficulty_level: formData.difficultyLevel
      };

      console.log('💾 === DADOS PARA UPDATE ===');
      console.log('Dados completos:', JSON.stringify(updateData, null, 2));
      console.log('Tipo da difficulty_level:', typeof updateData.difficulty_level);
      console.log('Valor da difficulty_level:', updateData.difficulty_level);

      // Fazer a atualização
      console.log('🔄 Executando UPDATE...');
      const { data: updatedPlayer, error: updateError } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', player.id)
        .select('*')
        .single();

      if (updateError) {
        console.error('❌ ERRO NO UPDATE:', updateError);
        console.error('Detalhes do erro:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        throw updateError;
      }

      console.log('✅ UPDATE REALIZADO COM SUCESSO!');
      console.log('📊 Dados retornados do banco:', updatedPlayer);
      
      if (updatedPlayer) {
        console.log('🔍 === VERIFICAÇÃO FINAL ===');
        console.log('  - ID:', updatedPlayer.id);
        console.log('  - Nome salvo:', updatedPlayer.name);
        console.log('  - Dificuldade salva no banco:', updatedPlayer.difficulty_level);
        console.log('  - Dificuldade esperada:', formData.difficultyLevel);
        console.log('  - ✅ Dificuldade correta?', updatedPlayer.difficulty_level === formData.difficultyLevel);
      }

      toast({
        title: "Sucesso!",
        description: `Jogador ${formData.name} atualizado com sucesso!`,
      });

      // Aguardar um pouco antes de chamar onPlayerUpdated para garantir que o banco foi atualizado
      setTimeout(() => {
        onPlayerUpdated();
      }, 500);

    } catch (error) {
      console.error('💥 === ERRO GERAL ===');
      console.error('Erro completo:', error);
      
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        errorMessage = error.message;
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
