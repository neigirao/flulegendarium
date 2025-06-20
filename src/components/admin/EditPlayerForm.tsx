
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { Player, DifficultyLevel } from "@/types/guess-game";
import { DifficultySection } from "./form-sections/DifficultySection";
import { ImageUploadSection } from "./form-sections/ImageUploadSection";
import { PlayerBasicInfoSection } from "./form-sections/PlayerBasicInfoSection";
import { PlayerStatisticsSection } from "./form-sections/PlayerStatisticsSection";
import { PlayerDetailsSection } from "./form-sections/PlayerDetailsSection";

interface EditPlayerFormProps {
  player: Player;
  onPlayerUpdated: () => void;
  onCancel: () => void;
}

export const EditPlayerForm = ({ player, onPlayerUpdated, onCancel }: EditPlayerFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(player.name);
  const [imageUrl, setImageUrl] = useState(player.image_url);
  const [image, setImage] = useState<File | null>(null);
  const [nicknames, setNicknames] = useState(player.nicknames?.join(', ') || '');
  const [position, setPosition] = useState(player.position);
  const [yearHighlight, setYearHighlight] = useState(player.year_highlight || '');
  const [funFact, setFunFact] = useState(player.fun_fact || '');
  const [achievements, setAchievements] = useState(player.achievements?.join(', ') || '');
  const [gols, setGols] = useState(player.statistics?.gols || 0);
  const [jogos, setJogos] = useState(player.statistics?.jogos || 0);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>(player.difficulty_level || 'medio');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('url');

  useEffect(() => {
    console.log('🔄 === FORMULÁRIO CARREGADO ===');
    console.log('  - Nome do jogador:', player.name);
    console.log('  - ID do jogador:', player.id);
    console.log('  - Dificuldade original do banco:', player.difficulty_level);
    console.log('  - Tipo da dificuldade original:', typeof player.difficulty_level);
    console.log('  - Dificuldade no state inicial:', difficultyLevel);
  }, [player, difficultyLevel]);

  const handleDifficultyChange = (value: string) => {
    console.log('🔄 === MUDANÇA DE DIFICULDADE ===');
    console.log('  - Dificuldade anterior:', difficultyLevel);
    console.log('  - Nova dificuldade selecionada:', value);
    console.log('  - Tipo da nova dificuldade:', typeof value);
    setDifficultyLevel(value as DifficultyLevel);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
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
    console.log('  - Nome do jogador:', name);
    console.log('  - Dificuldade que será enviada:', difficultyLevel);
    console.log('  - Tipo da dificuldade:', typeof difficultyLevel);

    try {
      let finalImageUrl = imageUrl;

      // Upload de imagem se necessário
      if (uploadMethod === 'file' && image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('players')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('players')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      }

      // Processar dados
      const nicknamesArray = nicknames
        .split(',')
        .map(nick => nick.trim())
        .filter(nick => nick.length > 0);

      const achievementsArray = achievements
        .split(',')
        .map(ach => ach.trim())
        .filter(ach => ach.length > 0);

      // Preparar dados para atualização
      const updateData = {
        name: name.trim(),
        image_url: finalImageUrl,
        nicknames: nicknamesArray,
        position: position.trim(),
        year_highlight: yearHighlight.trim(),
        fun_fact: funFact.trim(),
        achievements: achievementsArray,
        statistics: { gols, jogos },
        difficulty_level: difficultyLevel
      };

      console.log('📊 === DADOS PARA ATUALIZAÇÃO ===');
      console.log('  - Dados completos:', JSON.stringify(updateData, null, 2));

      // Primeira tentativa: UPDATE normal
      console.log('💾 === TENTATIVA 1: UPDATE NORMAL ===');
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
        console.log('  - Dificuldade esperada:', difficultyLevel);
        console.log('  - Match correto?', savedPlayer.difficulty_level === difficultyLevel);
      }

      toast({
        title: "Sucesso!",
        description: `Jogador ${name} atualizado com sucesso! Dificuldade: ${difficultyLevel}`,
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Editar Jogador: {player.name}</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X size={20} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PlayerBasicInfoSection
          name={name}
          onNameChange={setName}
          position={position}
          onPositionChange={setPosition}
          yearHighlight={yearHighlight}
          onYearHighlightChange={setYearHighlight}
          isLoading={isLoading}
        />

        <DifficultySection
          difficultyLevel={difficultyLevel}
          onDifficultyChange={handleDifficultyChange}
          isLoading={isLoading}
          originalDifficulty={player.difficulty_level}
          difficultyScore={player.difficulty_score}
          difficultyConfidence={player.difficulty_confidence}
          totalAttempts={player.total_attempts}
          correctAttempts={player.correct_attempts}
        />

        <ImageUploadSection
          uploadMethod={uploadMethod}
          onUploadMethodChange={setUploadMethod}
          imageUrl={imageUrl}
          onImageUrlChange={setImageUrl}
          onImageFileChange={setImage}
          isLoading={isLoading}
        />

        <PlayerStatisticsSection
          gols={gols}
          onGolsChange={setGols}
          jogos={jogos}
          onJogosChange={setJogos}
          isLoading={isLoading}
        />

        <PlayerDetailsSection
          nicknames={nicknames}
          onNicknamesChange={setNicknames}
          funFact={funFact}
          onFunFactChange={setFunFact}
          achievements={achievements}
          onAchievementsChange={setAchievements}
          isLoading={isLoading}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Atualizando..." : "Atualizar Jogador"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};
