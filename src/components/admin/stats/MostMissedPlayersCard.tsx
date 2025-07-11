
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { memo } from "react";
import { AlertTriangle } from "lucide-react";

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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Jogadores Mais Difíceis
        </CardTitle>
        <CardDescription>Top 10 jogadores com mais erros (mín. 3 tentativas)</CardDescription>
      </CardHeader>
      <CardContent>
        {!players || players.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Nenhum dado disponível ainda</p>
            <p className="text-sm">Dados aparecerão quando houver pelo menos 3 tentativas por jogador</p>
          </div>
        ) : (
          <div className="space-y-3">
            {players.map((player, index) => (
              <div 
                key={player.player_name} 
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                    <span className="font-bold text-red-600 text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{player.player_name}</span>
                    <p className="text-sm text-gray-500">Jogador mais difícil</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-red-600 font-bold text-lg">{player.missed_count}</div>
                  <div className="text-sm text-gray-500">{player.miss_rate}% de erro</div>
                  <div className="text-xs text-gray-400">{player.total_attempts} tentativas</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {players && players.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 text-center">
              Total de {players.length} jogador{players.length !== 1 ? 'es' : ''} com dados de erro disponíveis
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

MostMissedPlayersCard.displayName = 'MostMissedPlayersCard';
