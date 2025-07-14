import { Calendar, Target, Trophy, Clock } from 'lucide-react';
import { FluCard } from '@/components/ui/flu-card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Badge } from '@/components/ui/badge';

interface DailyChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    challenge_type: 'daily' | 'weekly' | 'special';
    target_value: number;
    target_metric: string;
    reward_points: number;
    end_date: string;
    current_progress?: number;
    is_completed?: boolean;
  };
}

export const DailyChallengeCard = ({ challenge }: DailyChallengeCardProps) => {
  const progress = challenge.current_progress || 0;
  const progressPercentage = Math.min((progress / challenge.target_value) * 100, 100);
  
  const getTypeIcon = () => {
    switch (challenge.challenge_type) {
      case 'daily': return <Calendar className="w-4 h-4" />;
      case 'weekly': return <Target className="w-4 h-4" />;
      case 'special': return <Trophy className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeColor = () => {
    switch (challenge.challenge_type) {
      case 'daily': return 'bg-primary text-primary-foreground';
      case 'weekly': return 'bg-secondary text-secondary-foreground';
      case 'special': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTimeRemaining = () => {
    const endDate = new Date(challenge.end_date);
    const now = new Date();
    const diffInHours = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h restantes`;
    const diffInDays = Math.ceil(diffInHours / 24);
    return `${diffInDays}d restantes`;
  };

  return (
    <FluCard className={`p-4 transition-all duration-300 hover:shadow-lg ${
      challenge.is_completed 
        ? 'bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/50' 
        : 'hover:bg-gradient-to-br hover:from-background hover:to-primary/5'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge className={getTypeColor()}>
            {getTypeIcon()}
            <span className="ml-1 capitalize">{challenge.challenge_type}</span>
          </Badge>
          {challenge.is_completed && (
            <Trophy className="w-4 h-4 text-yellow-500" />
          )}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {getTimeRemaining()}
        </div>
      </div>

      <h4 className="font-semibold text-sm mb-2">{challenge.title}</h4>
      <p className="text-xs text-muted-foreground mb-4">{challenge.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ProgressRing 
            progress={progressPercentage} 
            size="sm"
            className="text-primary"
          />
          <div>
            <div className="text-sm font-medium">
              {progress} / {challenge.target_value}
            </div>
            <div className="text-xs text-muted-foreground capitalize">
              {challenge.target_metric.replace('_', ' ')}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-semibold text-accent">
            +{challenge.reward_points}
          </div>
          <div className="text-xs text-muted-foreground">pontos</div>
        </div>
      </div>
    </FluCard>
  );
};