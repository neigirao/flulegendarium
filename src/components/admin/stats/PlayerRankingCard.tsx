
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { memo } from "react";
import { User, Trophy } from "lucide-react";
import { InstagramProfile } from "@/components/ui/instagram-profile";

interface RankingPlayer {
  id: string;
  player_name: string;
  score: number;
  user_id: string | null;
  created_at: string;
}

interface PlayerRankingCardProps {
  players: RankingPlayer[];
}

export const PlayerRankingCard = memo(({ players }: PlayerRankingCardProps) => {
  const totalPlayers = players.length;
  const loggedPlayers = players.filter(p => p.user_id).length;
  const guestPlayers = players.filter(p => !p.user_id).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-flu-grena" />
          Ranking de Jogadores
        </CardTitle>
        <CardDescription>
          Top 10 melhores pontuações - {loggedPlayers} logados, {guestPlayers} convidados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Nenhuma pontuação registrada ainda
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {players.map((player, index) => {
              const isGuest = !player.user_id;
              
              return (
                <div key={player.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600 w-6">#{index + 1}</span>
                    <div className="flex items-center gap-2">
                      <InstagramProfile 
                        playerName={player.player_name}
                        showLink={true}
                        avatarSize="sm"
                      />
                      {isGuest ? (
                        <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          <User className="w-3 h-3" />
                          Convidado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs bg-flu-verde/10 text-flu-verde px-2 py-1 rounded-full">
                          <User className="w-3 h-3" />
                          Logado
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-flu-grena font-bold">{player.score} pts</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

PlayerRankingCard.displayName = 'PlayerRankingCard';
