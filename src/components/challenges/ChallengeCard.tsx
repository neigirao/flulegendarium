import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Target, Trophy, Zap, Star, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChallengeCardProps {
  id: string;
  title: string;
  description: string;
  challengeType: string;
  targetValue: number;
  currentProgress: number;
  rewardPoints: number;
  isCompleted: boolean;
  compact?: boolean;
}

const getChallengeIcon = (type: string) => {
  switch (type) {
    case 'score':
      return Trophy;
    case 'streak':
      return Flame;
    case 'games':
      return Target;
    case 'speed':
      return Zap;
    case 'accuracy':
      return Star;
    default:
      return Target;
  }
};

const getChallengeColor = (type: string) => {
  switch (type) {
    case 'score':
      return 'text-warning bg-warning/10';
    case 'streak':
      return 'text-warning bg-warning/10';
    case 'games':
      return 'text-info bg-info/10';
    case 'speed':
      return 'text-accent-foreground bg-accent/20';
    case 'accuracy':
      return 'text-success bg-success/10';
    default:
      return 'text-primary bg-primary/10';
  }
};

export const ChallengeCard = memo(({ 
  id,
  title, 
  description, 
  challengeType,
  targetValue, 
  currentProgress, 
  rewardPoints,
  isCompleted,
  compact = false 
}: ChallengeCardProps) => {
  const Icon = getChallengeIcon(challengeType);
  const colorClass = getChallengeColor(challengeType);
  const progressPercent = Math.min((currentProgress / targetValue) * 100, 100);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`
          p-3 rounded-lg border transition-all touch-target
          ${isCompleted 
            ? 'bg-success/10 border-success/30' 
            : 'bg-card border-border hover:border-primary/30'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isCompleted ? 'bg-success/20' : colorClass}`}>
            {isCompleted ? (
              <CheckCircle className="w-4 h-4 text-success" />
            ) : (
              <Icon className="w-4 h-4" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className={`font-display text-sm truncate ${isCompleted ? 'text-success' : 'text-foreground'}`}>
              {title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={progressPercent} className="h-1.5 flex-1" />
              <span className="font-body text-xs text-muted-foreground whitespace-nowrap">
                {currentProgress}/{targetValue}
              </span>
            </div>
          </div>
          
          <Badge variant={isCompleted ? 'default' : 'secondary'} className="text-xs">
            +{rewardPoints}
          </Badge>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`
        overflow-hidden transition-all
        ${isCompleted 
          ? 'bg-success/5 border-success/30' 
          : 'hover:shadow-md hover:border-primary/30'
        }
      `}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`
              p-3 rounded-xl shrink-0
              ${isCompleted ? 'bg-success/20' : colorClass}
            `}>
              {isCompleted ? (
                <CheckCircle className="w-6 h-6 text-success" />
              ) : (
                <Icon className="w-6 h-6" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className={`font-display text-display-sm ${isCompleted ? 'text-success' : 'text-foreground'}`}>
                  {title}
                </h4>
                <Badge 
                  variant={isCompleted ? 'default' : 'outline'} 
                  className={isCompleted ? 'bg-success text-success-foreground' : ''}
                >
                  <Trophy className="w-3 h-3 mr-1" />
                  +{rewardPoints} pts
                </Badge>
              </div>
              
              <p className="font-body text-sm text-muted-foreground mb-3">
                {description}
              </p>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between font-body text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className={`font-medium ${isCompleted ? 'text-success' : 'text-foreground'}`}>
                    {currentProgress} / {targetValue}
                  </span>
                </div>
                <Progress 
                  value={progressPercent} 
                  className={`h-2 ${isCompleted ? '[&>div]:bg-success' : ''}`}
                />
              </div>
              
              {isCompleted && (
                <p className="font-body text-xs text-success mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Desafio concluído!
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

ChallengeCard.displayName = 'ChallengeCard';
