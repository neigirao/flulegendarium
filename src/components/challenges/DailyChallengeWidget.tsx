import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailyChallengesModule } from '@/hooks/use-daily-challenges-module';
import { ChallengeCard } from './ChallengeCard';
import { Calendar, ChevronRight, Trophy, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface DailyChallengeWidgetProps {
  compact?: boolean;
  maxChallenges?: number;
  showHeader?: boolean;
}

export const DailyChallengeWidget = memo(({ 
  compact = false, 
  maxChallenges = 3,
  showHeader = true 
}: DailyChallengeWidgetProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { challenges, isLoading } = useDailyChallengesModule();

  const displayedChallenges = challenges.slice(0, maxChallenges);
  const completedCount = challenges.filter(c => c.progress?.is_completed).length;
  const totalRewards = challenges
    .filter(c => c.progress?.is_completed)
    .reduce((sum, c) => sum + (c.reward_points || 0), 0);

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 text-center">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground mb-2">
            Faça login para participar dos desafios diários!
          </p>
          <Button size="sm" variant="outline" onClick={() => navigate('/auth')}>
            Entrar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
        )}
        <CardContent className={compact ? 'p-3' : 'p-4'}>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">
            Nenhum desafio ativo no momento.
          </p>
          <p className="text-sm text-muted-foreground/70">
            Volte mais tarde para novos desafios!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-primary" />
              Desafios Diários
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {completedCount}/{challenges.length}
              </Badge>
              {totalRewards > 0 && (
                <Badge className="bg-primary text-xs">
                  <Trophy className="w-3 h-3 mr-1" />
                  +{totalRewards}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className={compact ? 'p-3 pt-0' : 'p-4 pt-0'}>
        <div className="space-y-2">
          {displayedChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              id={challenge.id}
              title={challenge.title}
              description={challenge.description}
              challengeType={challenge.challenge_type}
              targetValue={challenge.target_value}
              currentProgress={challenge.progress?.current_progress || 0}
              rewardPoints={challenge.reward_points || 0}
              isCompleted={challenge.progress?.is_completed || false}
              compact={compact}
            />
          ))}
        </div>
        
        {challenges.length > maxChallenges && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-3 text-muted-foreground"
            onClick={() => navigate('/desafios')}
          >
            Ver todos os desafios
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
});

DailyChallengeWidget.displayName = 'DailyChallengeWidget';
