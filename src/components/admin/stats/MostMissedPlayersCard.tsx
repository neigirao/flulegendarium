
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MissedPlayer {
  player_name: string;
  missed_count: number;
  total_attempts: number;
  miss_rate: string;
}

interface MostMissedPlayersCardProps {
  players: MissedPlayer[];
}

export const MostMissedPlayersCard = ({ players }: MostMissedPlayersCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Jogadores Mais Difíceis</CardTitle>
        <CardDescription>Top 10 jogadores com mais erros</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {players.map((player, index) => (
            <div key={player.player_name} className="flex justify-between items-center p-2 border rounded">
              <span className="font-medium">#{index + 1} {player.player_name}</span>
              <span className="text-red-600 font-bold">{player.missed_count} erros ({player.miss_rate}%)</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
