
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PlayerDetailsSectionProps {
  nicknames: string;
  onNicknamesChange: (value: string) => void;
  funFact: string;
  onFunFactChange: (value: string) => void;
  achievements: string;
  onAchievementsChange: (value: string) => void;
  isLoading: boolean;
}

export const PlayerDetailsSection = ({
  nicknames,
  onNicknamesChange,
  funFact,
  onFunFactChange,
  achievements,
  onAchievementsChange,
  isLoading
}: PlayerDetailsSectionProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="nicknames">Apelidos</Label>
        <Textarea
          id="nicknames"
          value={nicknames}
          onChange={(e) => onNicknamesChange(e.target.value)}
          placeholder="Ex: Fred, Frederico, Chaves Guedes (separar por vírgula)"
          disabled={isLoading}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="funFact">Curiosidade</Label>
        <Textarea
          id="funFact"
          value={funFact}
          onChange={(e) => onFunFactChange(e.target.value)}
          placeholder="Curiosidade sobre o jogador"
          disabled={isLoading}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="achievements">Conquistas</Label>
        <Textarea
          id="achievements"
          value={achievements}
          onChange={(e) => onAchievementsChange(e.target.value)}
          placeholder="Ex: Campeão Brasileiro 2010, Campeão Carioca 2012 (separar por vírgula)"
          disabled={isLoading}
          rows={3}
        />
      </div>
    </>
  );
};
