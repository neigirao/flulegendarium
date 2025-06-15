
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { memo } from "react";

interface RankingPlayer {
  id: string;
  player_name: string;
  score: number;
}

interface PlayerRankingCardProps {
  players: RankingPlayer[];
}

export const PlayerRankingCard = memo(({ players }: PlayerRankingCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Jogadores</CardTitle>
        <CardDescription>Top 10 melhores pontuações</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {players.map((player, index) => (
            <div key={player.id} className="flex justify-between items-center p-2 border rounded">
              <span className="font-medium">#{index + 1} {player.player_name}</span>
              <span className="text-flu-grena font-bold">{player.score} pts</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

PlayerRankingCard.displayName = 'PlayerRankingCard';
