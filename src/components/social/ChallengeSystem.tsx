import { useState, memo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Swords, Link2, Copy, Check, Share2, Trophy } from 'lucide-react';

interface ChallengeData {
  challengerId: string;
  challengerName: string;
  score: number;
  gameMode: 'adaptive' | 'decade';
  difficulty?: string;
  timestamp: number;
}

export const generateChallengeLink = (data: Omit<ChallengeData, 'timestamp'>): string => {
  const challengeData: ChallengeData = {
    ...data,
    timestamp: Date.now(),
  };
  
  const encoded = btoa(JSON.stringify(challengeData));
  return `${window.location.origin}/social?challenge=${encoded}`;
};

export const decodeChallengeLink = (encoded: string): ChallengeData | null => {
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
};

interface ChallengeSystemProps {
  lastScore?: number;
  gameMode?: 'adaptive' | 'decade';
  difficulty?: string;
}

export const ChallengeSystem = memo(({ lastScore, gameMode = 'adaptive', difficulty }: ChallengeSystemProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [challengeLink, setChallengeLink] = useState<string | null>(null);

  const handleGenerateChallenge = () => {
    if (!lastScore && lastScore !== 0) {
      toast({
        title: "Jogue primeiro!",
        description: "Complete um jogo para desafiar seus amigos.",
        variant: "destructive",
      });
      return;
    }

    const link = generateChallengeLink({
      challengerId: user?.id || 'guest',
      challengerName: user?.user_metadata?.full_name || 'Tricolor Anônimo',
      score: lastScore,
      gameMode,
      difficulty,
    });

    setChallengeLink(link);
  };

  const handleCopyLink = async () => {
    if (!challengeLink) return;

    try {
      await navigator.clipboard.writeText(challengeLink);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "Envie para seus amigos e veja quem consegue superar sua pontuação!",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (!challengeLink) return;

    const shareText = `🏆 Eu fiz ${lastScore} pontos no Lendas do Flu! Consegue me superar? Aceite o desafio:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Desafio Lendas do Flu',
          text: shareText,
          url: challengeLink,
        });
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-primary" />
          <span>Desafiar Amigo</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Desafie seus amigos a superar sua pontuação! Gere um link único e compartilhe.
        </p>
        
        {lastScore !== undefined && (
          <div className="flex items-center justify-center gap-2 p-4 bg-primary/10 rounded-lg">
            <Trophy className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-primary">{lastScore} pontos</span>
            <Badge variant="outline">{gameMode === 'adaptive' ? 'Adaptativo' : 'Por Década'}</Badge>
          </div>
        )}
        
        {!challengeLink ? (
          <Button 
            onClick={handleGenerateChallenge} 
            className="w-full"
            disabled={lastScore === undefined}
          >
            <Link2 className="w-4 h-4 mr-2" />
            Gerar Link de Desafio
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input 
                value={challengeLink} 
                readOnly 
                className="text-xs"
              />
              <Button 
                size="icon" 
                variant="outline"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <Button 
              onClick={handleNativeShare} 
              className="w-full"
              variant="default"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar Desafio
            </Button>
          </div>
        )}

        {!user && (
          <p className="text-xs text-muted-foreground text-center">
            💡 Faça login para salvar seus desafios e acompanhar quem aceitou!
          </p>
        )}
      </CardContent>
    </Card>
  );
});

ChallengeSystem.displayName = 'ChallengeSystem';
