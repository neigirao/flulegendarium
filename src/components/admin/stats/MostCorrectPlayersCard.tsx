
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { memo } from "react";
import { Trophy } from "lucide-react";

interface CorrectPlayer {
  player_name: string;
  correct_count: number;
}

interface MostCorrectPlayersCardProps {
  players: CorrectPlayer[];
}

export const MostCorrectPlayersCard = memo(({ players }: MostCorrectPlayersCardProps) => {
  console.log('🏆 MostCorrectPlayersCard rendering with players:', players);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Jogadores Mais Acertados
        </CardTitle>
        <CardDescription>Top 10 jogadores com mais acertos</CardDescription>
      </CardHeader>
      <CardContent>
        {!players || players.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Nenhum acerto registrado ainda</p>
            <p className="text-sm">Os dados aparecerão quando os jogadores começarem a acertar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {players.map((player, index) => (
              <div 
                key={player.player_name} 
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    <span className="font-bold text-gray-600 text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{player.player_name}</span>
                    <p className="text-sm text-gray-500">Jogador mais acertado</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-green-600 font-bold text-lg">{player.correct_count}</span>
                  <p className="text-sm text-gray-500">acertos</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {players && players.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 text-center">
              Total de {players.length} jogador{players.length !== 1 ? 'es' : ''} com acertos registrados
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

MostCorrectPlayersCard.displayName = 'MostCorrectPlayersCard';
