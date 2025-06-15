
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Player {
  player_name: string;
  correct_count: number;
}

interface MostCorrectPlayersCardProps {
  players: Player[];
}

export const MostCorrectPlayersCard = ({ players }: MostCorrectPlayersCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Jogadores Mais Acertados</CardTitle>
        <CardDescription>Top 10 jogadores com mais acertos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {players.map((player, index) => (
            <div key={player.player_name} className="flex justify-between items-center p-2 border rounded">
              <span className="font-medium">#{index + 1} {player.player_name}</span>
              <span className="text-green-600 font-bold">{player.correct_count} acertos</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
