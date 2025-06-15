
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { memo } from "react";

interface CorrectPlayer {
  player_name: string;
  correct_count: number;
}

interface MostCorrectPlayersCardProps {
  players: CorrectPlayer[];
}

export const MostCorrectPlayersCard = memo(({ players }: MostCorrectPlayersCardProps) => {
  console.log('MostCorrectPlayersCard received players:', players);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Jogadores Mais Acertados</CardTitle>
        <CardDescription>Top 10 jogadores com mais acertos</CardDescription>
      </CardHeader>
      <CardContent>
        {!players || players.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>Nenhum dado disponível ainda</p>
            <p className="text-sm">Dados aparecerão quando houver tentativas registradas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {players.map((player, index) => (
              <div key={player.player_name} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-400 text-sm">#{index + 1}</span>
                  <span className="font-medium">{player.player_name}</span>
                </div>
                <span className="text-green-600 font-bold">{player.correct_count} acertos</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

MostCorrectPlayersCard.displayName = 'MostCorrectPlayersCard';
