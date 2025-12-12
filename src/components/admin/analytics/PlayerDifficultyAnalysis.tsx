import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerDifficulty } from "@/services/executiveAnalyticsService";
import { Trophy, Skull, Timer, Target } from "lucide-react";

interface PlayerDifficultyAnalysisProps {
  data: {
    hardest: PlayerDifficulty[];
    easiest: PlayerDifficulty[];
  } | undefined;
  isLoading: boolean;
}

const PlayerRow = ({ player, rank, type }: { 
  player: PlayerDifficulty; 
  rank: number;
  type: 'hard' | 'easy';
}) => (
  <div className="flex items-center justify-between py-3 border-b last:border-b-0">
    <div className="flex items-center gap-3">
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
        type === 'hard' ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700'
      }`}>
        {rank}
      </span>
      <div>
        <p className="font-medium">{player.name}</p>
        <p className="text-xs text-muted-foreground">{player.position}</p>
      </div>
    </div>
    <div className="flex items-center gap-4 text-sm">
      <div className="text-center">
        <div className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          <span className={type === 'hard' ? 'text-destructive' : 'text-green-600'}>
            {player.successRate}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground">acerto</p>
      </div>
      <div className="text-center">
        <div className="flex items-center gap-1">
          <Timer className="w-3 h-3" />
          <span>{player.avgGuessTime}s</span>
        </div>
        <p className="text-xs text-muted-foreground">tempo</p>
      </div>
      <Badge variant="outline" className="text-xs">
        {player.totalAttempts} tentativas
      </Badge>
    </div>
  </div>
);

export const PlayerDifficultyAnalysis = ({ data, isLoading }: PlayerDifficultyAnalysisProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Dificuldade</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Dificuldade</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhum dado disponível
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Análise de Dificuldade de Jogadores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hardest">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hardest" className="flex items-center gap-2">
              <Skull className="w-4 h-4" />
              Mais Difíceis
            </TabsTrigger>
            <TabsTrigger value="easiest" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Mais Fáceis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hardest" className="mt-4">
            {data.hardest.length > 0 ? (
              <div className="space-y-1">
                {data.hardest.map((player, index) => (
                  <PlayerRow 
                    key={player.id} 
                    player={player} 
                    rank={index + 1}
                    type="hard"
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Sem dados suficientes para análise
              </p>
            )}
          </TabsContent>

          <TabsContent value="easiest" className="mt-4">
            {data.easiest.length > 0 ? (
              <div className="space-y-1">
                {data.easiest.map((player, index) => (
                  <PlayerRow 
                    key={player.id} 
                    player={player} 
                    rank={index + 1}
                    type="easy"
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Sem dados suficientes para análise
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
