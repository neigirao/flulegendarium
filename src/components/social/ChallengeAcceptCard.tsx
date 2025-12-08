import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Swords, Trophy, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChallengeData {
  challengerId: string;
  challengerName: string;
  score: number;
  gameMode: 'adaptive' | 'decade';
  difficulty?: string;
  timestamp: number;
}

interface ChallengeAcceptCardProps {
  challenge: ChallengeData;
  onDismiss: () => void;
}

export const ChallengeAcceptCard = memo(({ challenge, onDismiss }: ChallengeAcceptCardProps) => {
  const navigate = useNavigate();

  const handleAcceptChallenge = () => {
    // Store challenge in session to show comparison after game
    sessionStorage.setItem('active_challenge', JSON.stringify(challenge));
    
    const route = challenge.gameMode === 'adaptive' 
      ? '/quiz-adaptativo' 
      : '/quiz-decada';
    
    navigate(route);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
    >
      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Swords className="w-5 h-5 text-primary animate-pulse" />
            <span>Você foi desafiado!</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
            <div>
              <p className="font-medium">{challenge.challengerName}</p>
              <p className="text-sm text-muted-foreground">quer ver se você supera...</p>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-xl font-bold text-primary">{challenge.score}</span>
              <span className="text-sm text-muted-foreground">pts</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 justify-center">
            <Badge variant="outline">
              <Target className="w-3 h-3 mr-1" />
              {challenge.gameMode === 'adaptive' ? 'Modo Adaptativo' : 'Modo Por Década'}
            </Badge>
            {challenge.difficulty && (
              <Badge variant="secondary">
                {challenge.difficulty}
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onDismiss}
              className="flex-1"
            >
              Depois
            </Button>
            <Button 
              onClick={handleAcceptChallenge}
              className="flex-1"
            >
              Aceitar Desafio
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

ChallengeAcceptCard.displayName = 'ChallengeAcceptCard';
