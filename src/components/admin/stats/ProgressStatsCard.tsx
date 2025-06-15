
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { memo } from "react";

interface ProgressStat {
  step: number;
  count: number;
}

interface ProgressStatsCardProps {
  stats: ProgressStat[];
}

export const ProgressStatsCard = memo(({ stats }: ProgressStatsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso dos Jogadores</CardTitle>
        <CardDescription>Quantas pessoas chegaram até X jogadores corretos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stats.map((stat) => (
            <div key={stat.step} className="flex justify-between items-center p-2 border rounded">
              <span className="font-medium">{stat.step} jogador(es) correto(s)</span>
              <span className="text-blue-600 font-bold">{stat.count} pessoa(s)</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

ProgressStatsCard.displayName = 'ProgressStatsCard';
