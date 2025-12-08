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
      return 'text-yellow-500 bg-yellow-500/10';
    case 'streak':
      return 'text-orange-500 bg-orange-500/10';
    case 'games':
      return 'text-blue-500 bg-blue-500/10';
    case 'speed':
      return 'text-purple-500 bg-purple-500/10';
    case 'accuracy':
      return 'text-green-500 bg-green-500/10';
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
          p-3 rounded-lg border transition-all
          ${isCompleted 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
            : 'bg-card border-border hover:border-primary/30'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100 dark:bg-green-800/30' : colorClass}`}>
            {isCompleted ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Icon className="w-4 h-4" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm truncate ${isCompleted ? 'text-green-700 dark:text-green-400' : ''}`}>
              {title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={progressPercent} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
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
          ? 'bg-gradient-to-r from-green-50 to-green-100/50 border-green-200 dark:from-green-900/20 dark:to-green-800/10 dark:border-green-800' 
          : 'hover:shadow-md hover:border-primary/30'
        }
      `}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`
              p-3 rounded-xl shrink-0
              ${isCompleted ? 'bg-green-100 dark:bg-green-800/30' : colorClass}
            `}>
              {isCompleted ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <Icon className="w-6 h-6" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className={`font-semibold ${isCompleted ? 'text-green-700 dark:text-green-400' : 'text-foreground'}`}>
                  {title}
                </h4>
                <Badge 
                  variant={isCompleted ? 'default' : 'outline'} 
                  className={isCompleted ? 'bg-green-500' : ''}
                >
                  <Trophy className="w-3 h-3 mr-1" />
                  +{rewardPoints} pts
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {description}
              </p>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-foreground'}`}>
                    {currentProgress} / {targetValue}
                  </span>
                </div>
                <Progress 
                  value={progressPercent} 
                  className={`h-2 ${isCompleted ? '[&>div]:bg-green-500' : ''}`}
                />
              </div>
              
              {isCompleted && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
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
