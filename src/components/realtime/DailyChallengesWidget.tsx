import { Target, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FluCard } from '@/components/ui/flu-card';
import { DailyChallengeCard } from './DailyChallengeCard';
import { useDailyChallenges } from '@/hooks/realtime';

export const DailyChallengesWidget = () => {
  const { challenges, isLoading } = useDailyChallenges();

  if (isLoading) {
    return (
      <FluCard className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/2"></div>
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-muted rounded"></div>
          ))}
        </div>
      </FluCard>
    );
  }

  const activeChallenges = challenges.filter(c => !c.is_completed).slice(0, 2);

  return (
    <FluCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Desafios Ativos</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-xs">
          Ver todos
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      <div className="space-y-3">
        {activeChallenges.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhum desafio ativo no momento</p>
            <p className="text-xs mt-1">Novos desafios chegam em breve!</p>
          </div>
        ) : (
          activeChallenges.map((challenge) => (
            <DailyChallengeCard key={challenge.id} challenge={challenge} />
          ))
        )}
      </div>
    </FluCard>
  );
};