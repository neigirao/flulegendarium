import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { memo } from "react";
import { Trophy } from "lucide-react";
import { InstagramProfile } from "@/components/ui/instagram-profile";
import { PodiumRankCompact } from "@/components/ui/podium-rank";

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
  const loggedPlayers = players.filter(p => p.user_id).length;
  const guestPlayers = players.filter(p => !p.user_id).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Trophy className="w-5 h-5 text-primary" />
          Ranking de Jogadores
        </CardTitle>
        <CardDescription className="font-body">
          Top 10 melhores pontuações - {loggedPlayers} logados, {guestPlayers} convidados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground font-body">
            Nenhuma pontuação registrada ainda
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {players.map((player, index) => (
              <PodiumRankCompact
                key={player.id}
                rank={index + 1}
                playerName={player.player_name}
                score={player.score}
                isGuest={!player.user_id}
                showAnimation={false}
                avatarSlot={
                  <InstagramProfile 
                    playerName={player.player_name}
                    showLink={true}
                    avatarSize="sm"
                  />
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

PlayerRankingCard.displayName = 'PlayerRankingCard';
