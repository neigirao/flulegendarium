
import { Player } from "@/services/playerDataService";
import { PlayerCard } from "./PlayerCard";

interface PlayerListProps {
  players: Player[];
  onImageUpdate: (playerId: string, newImageUrl: string) => void;
}

export const PlayerList = ({ players, onImageUpdate }: PlayerListProps) => {
  if (players.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Jogadores Coletados</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {players.map((player) => (
          <PlayerCard 
            key={player.id} 
            player={player} 
            onImageUpdate={onImageUpdate}
          />
        ))}
      </div>
    </div>
  );
};
