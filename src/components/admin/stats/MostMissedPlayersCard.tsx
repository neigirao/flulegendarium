
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { memo } from "react";

interface MissedPlayer {
  player_name: string;
  missed_count: number;
  total_attempts: number;
  miss_rate: string;
}

interface MostMissedPlayersCardProps {
  players: MissedPlayer[];
}

export const MostMissedPlayersCard = memo(({ players }: MostMissedPlayersCardProps) => {
  console.log('MostMissedPlayersCard received players:', players);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Jogadores Mais Difíceis</CardTitle>
        <CardDescription>Top 10 jogadores com mais erros (mín. 3 tentativas)</CardDescription>
      </CardHeader>
      <CardContent>
        {!players || players.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>Nenhum dado disponível ainda</p>
            <p className="text-sm">Dados aparecerão quando houver pelo menos 3 tentativas por jogador</p>
          </div>
        ) : (
          <div className="space-y-2">
            {players.map((player, index) => (
              <div key={player.player_name} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-400 text-sm">#{index + 1}</span>
                  <span className="font-medium">{player.player_name}</span>
                </div>
                <div className="text-right">
                  <div className="text-red-600 font-bold">{player.missed_count} erros</div>
                  <div className="text-sm text-gray-500">{player.miss_rate}% de erro</div>
                  <div className="text-xs text-gray-400">{player.total_attempts} tentativas</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

MostMissedPlayersCard.displayName = 'MostMissedPlayersCard';
