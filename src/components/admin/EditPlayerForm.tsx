
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Player } from "@/types/guess-game";
import { DifficultySection } from "./form-sections/DifficultySection";
import { ImageUploadSection } from "./form-sections/ImageUploadSection";
import { PlayerBasicInfoSection } from "./form-sections/PlayerBasicInfoSection";
import { PlayerStatisticsSection } from "./form-sections/PlayerStatisticsSection";
import { PlayerDetailsSection } from "./form-sections/PlayerDetailsSection";
import { useEditPlayerForm } from "@/hooks/use-edit-player-form";
import { useEditPlayerSubmission } from "@/hooks/use-edit-player-submission";

interface EditPlayerFormProps {
  player: Player;
  onPlayerUpdated: () => void;
  onCancel: () => void;
}

export const EditPlayerForm = ({ player, onPlayerUpdated, onCancel }: EditPlayerFormProps) => {
  const formState = useEditPlayerForm(player);
  
  const { isLoading, handleSubmit } = useEditPlayerSubmission({
    player,
    onPlayerUpdated,
    formData: {
      name: formState.name,
      imageUrl: formState.imageUrl,
      image: formState.image,
      nicknames: formState.nicknames,
      position: formState.position,
      yearHighlight: formState.yearHighlight,
      funFact: formState.funFact,
      achievements: formState.achievements,
      gols: formState.gols,
      jogos: formState.jogos,
      difficultyLevel: formState.difficultyLevel,
      uploadMethod: formState.uploadMethod,
    },
  });

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
          name={formState.name}
          onNameChange={formState.setName}
          position={formState.position}
          onPositionChange={formState.setPosition}
          yearHighlight={formState.yearHighlight}
          onYearHighlightChange={formState.setYearHighlight}
          isLoading={isLoading}
        />

        <DifficultySection
          difficultyLevel={formState.difficultyLevel}
          onDifficultyChange={formState.handleDifficultyChange}
          isLoading={isLoading}
          originalDifficulty={player.difficulty_level}
          difficultyScore={player.difficulty_score}
          difficultyConfidence={player.difficulty_confidence}
          totalAttempts={player.total_attempts}
          correctAttempts={player.correct_attempts}
        />

        <ImageUploadSection
          uploadMethod={formState.uploadMethod}
          onUploadMethodChange={formState.setUploadMethod}
          imageUrl={formState.imageUrl}
          onImageUrlChange={formState.setImageUrl}
          onImageFileChange={formState.setImage}
          isLoading={isLoading}
        />

        <PlayerStatisticsSection
          gols={formState.gols}
          onGolsChange={formState.setGols}
          jogos={formState.jogos}
          onJogosChange={formState.setJogos}
          isLoading={isLoading}
        />

        <PlayerDetailsSection
          nicknames={formState.nicknames}
          onNicknamesChange={formState.setNicknames}
          funFact={formState.funFact}
          onFunFactChange={formState.setFunFact}
          achievements={formState.achievements}
          onAchievementsChange={formState.setAchievements}
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
