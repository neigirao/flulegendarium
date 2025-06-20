
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PlayerStatisticsSectionProps {
  gols: number;
  onGolsChange: (value: number) => void;
  jogos: number;
  onJogosChange: (value: number) => void;
  isLoading: boolean;
}

export const PlayerStatisticsSection = ({
  gols,
  onGolsChange,
  jogos,
  onJogosChange,
  isLoading
}: PlayerStatisticsSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="gols">Gols</Label>
        <Input
          id="gols"
          type="number"
          value={gols}
          onChange={(e) => onGolsChange(Number(e.target.value))}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jogos">Jogos</Label>
        <Input
          id="jogos"
          type="number"
          value={jogos}
          onChange={(e) => onJogosChange(Number(e.target.value))}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};
