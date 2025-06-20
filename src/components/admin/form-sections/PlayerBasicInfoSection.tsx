
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PlayerBasicInfoSectionProps {
  name: string;
  onNameChange: (value: string) => void;
  position: string;
  onPositionChange: (value: string) => void;
  yearHighlight: string;
  onYearHighlightChange: (value: string) => void;
  isLoading: boolean;
}

export const PlayerBasicInfoSection = ({
  name,
  onNameChange,
  position,
  onPositionChange,
  yearHighlight,
  onYearHighlightChange,
  isLoading
}: PlayerBasicInfoSectionProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Jogador *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ex: Fred"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Posição</Label>
          <Input
            id="position"
            value={position}
            onChange={(e) => onPositionChange(e.target.value)}
            placeholder="Ex: Atacante"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearHighlight">Ano de Destaque</Label>
        <Input
          id="yearHighlight"
          value={yearHighlight}
          onChange={(e) => onYearHighlightChange(e.target.value)}
          placeholder="Ex: 2010"
          disabled={isLoading}
        />
      </div>
    </>
  );
};
