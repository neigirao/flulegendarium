import { memo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Swords, CheckCircle, XCircle, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateChallengeLink } from './ChallengeSystem';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ChallengeData {
  challengerId: string;
  challengerName: string;
  score: number;
  gameMode: 'adaptive' | 'decade';
  difficulty?: string;
  timestamp: number;
}

interface ChallengeResultProps {
  yourScore: number;
  gameMode: 'adaptive' | 'decade';
  difficulty?: string;
  onDismiss: () => void;
}

export const ChallengeResult = memo(({ yourScore, gameMode, difficulty, onDismiss }: ChallengeResultProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('active_challenge');
    if (stored) {
      try {
        setChallenge(JSON.parse(stored));
      } catch {
        // Invalid data
      }
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.removeItem('active_challenge');
    onDismiss();
  };

  const handleShareRevenge = async () => {
    const revengeLink = generateChallengeLink({
      challengerId: user?.id || 'guest',
      challengerName: user?.user_metadata?.full_name || 'Tricolor Anônimo',
      score: yourScore,
      gameMode,
      difficulty,
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Revanche no Lendas do Flu',
          text: challenge 
            ? `🏆 ${yourScore > challenge.score ? 'Ganhei!' : 'Quase!'} Fiz ${yourScore} pontos contra os ${challenge.score} do ${challenge.challengerName}. Consegue mais?`
            : `🏆 Fiz ${yourScore} pontos no Lendas do Flu!`,
          url: revengeLink,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(revengeLink);
          toast({ title: 'Link copiado!', description: 'Envie para seus amigos!' });
        }
      }
    } else {
      await navigator.clipboard.writeText(revengeLink);
      toast({ title: 'Link copiado!', description: 'Envie para seus amigos!' });
    }
  };

  if (!challenge) return null;

  const won = yourScore > challenge.score;
  const tied = yourScore === challenge.score;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-4"
    >
      <Card className={`border-2 ${won ? 'border-green-500 bg-green-50' : tied ? 'border-yellow-500 bg-yellow-50' : 'border-red-500 bg-red-50'}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Swords className="w-5 h-5" />
            <span>Resultado do Desafio</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            {/* Your Score */}
            <div className="flex-1 text-center p-3 bg-background rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Você</p>
              <p className="text-2xl font-bold text-primary">{yourScore}</p>
            </div>
            
            {/* VS */}
            <div className="flex flex-col items-center">
              {won ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : tied ? (
                <Trophy className="w-8 h-8 text-yellow-500" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
              <span className="text-xs text-muted-foreground mt-1">VS</span>
            </div>
            
            {/* Challenger Score */}
            <div className="flex-1 text-center p-3 bg-background rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1 truncate">{challenge.challengerName}</p>
              <p className="text-2xl font-bold text-muted-foreground">{challenge.score}</p>
            </div>
          </div>
          
          <div className="text-center">
            <Badge 
              variant={won ? 'default' : 'secondary'}
              className={won ? 'bg-green-500' : tied ? 'bg-yellow-500' : 'bg-red-500'}
            >
              {won ? '🎉 Você Venceu!' : tied ? '🤝 Empate!' : '😅 Quase lá!'}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="flex-1"
            >
              Fechar
            </Button>
            <Button 
              onClick={handleShareRevenge}
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {won ? 'Provocar!' : 'Revanche!'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

ChallengeResult.displayName = 'ChallengeResult';
