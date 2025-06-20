
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

      // Processar arrays
      const nicknamesArray = formData.nicknames
        .split(',')
        .map(nick => nick.trim())
        .filter(nick => nick.length > 0);

      const achievementsArray = formData.achievements
        .split(',')
        .map(ach => ach.trim())
        .filter(ach => ach.length > 0);

      // Dados para atualização - FORMATO CORRETO para o banco
      const updateData = {
        name: formData.name.trim(),
        image_url: finalImageUrl,
        nicknames: nicknamesArray,
        position: formData.position.trim(),
        year_highlight: formData.yearHighlight.trim() || null,
        fun_fact: formData.funFact.trim() || null,
        achievements: achievementsArray,
        // CORRIGIDO: statistics deve ser um objeto JSON, não uma estrutura aninhada
        statistics: {
          gols: Number(formData.gols) || 0,
          jogos: Number(formData.jogos) || 0
        },
        difficulty_level: formData.difficultyLevel
      };

      console.log('💾 === DADOS PARA UPDATE (FORMATO CORRETO) ===');
      console.log('Dados completos:', JSON.stringify(updateData, null, 2));
      console.log('Tipo statistics:', typeof updateData.statistics);
      console.log('Conteúdo statistics:', updateData.statistics);

      // Fazer a atualização com .eq() e .select() corretos
      console.log('🔄 Executando UPDATE...');
      const { data: updatedPlayer, error: updateError } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', player.id)
        .select('*')
        .single();

      if (updateError) {
        console.error('❌ ERRO NO UPDATE:', updateError);
        console.error('Código do erro:', updateError.code);
        console.error('Mensagem:', updateError.message);
        console.error('Detalhes:', updateError.details);
        console.error('Hint:', updateError.hint);
        throw updateError;
      }

      console.log('✅ UPDATE REALIZADO COM SUCESSO!');
      console.log('📊 Dados retornados:', updatedPlayer);
      
      if (updatedPlayer) {
        console.log('🔍 === VERIFICAÇÃO FINAL ===');
        console.log('  - Nome salvo:', updatedPlayer.name);
        console.log('  - Dificuldade salva:', updatedPlayer.difficulty_level);
        console.log('  - Statistics salvas:', updatedPlayer.statistics);
      }

      toast({
        title: "Sucesso!",
        description: `Jogador ${formData.name} atualizado com sucesso!`,
      });

      // Aguardar antes de recarregar
      setTimeout(() => {
        onPlayerUpdated();
      }, 500);

    } catch (error) {
      console.error('💥 === ERRO GERAL ===');
      console.error('Erro completo:', error);
      
      let errorMessage = 'Erro desconhecido ao atualizar jogador';
      
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
