import { Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { QuickShareButton } from './QuickShareButton';
import { Achievement } from "@/types/achievements";
import { logger } from "@/utils/logger";

interface SocialShareProps {
  score: number;
  correctGuesses: number;
  gameMode?: string;
  streak?: number;
  achievements?: Achievement[];
  playerName?: string;
  showFullInterface?: boolean;
  guessHistory?: Array<'correct' | 'wrong'>;
}

export const SocialShare = ({
  score,
  correctGuesses,
  gameMode = "Clássico",
  streak = 0,
  achievements = [],
  playerName,
  showFullInterface = true,
  guessHistory = [],
}: SocialShareProps) => {
  const { toast } = useToast();

  // If not showing full interface, return quick share button
  if (!showFullInterface) {
    return (
      <QuickShareButton
        score={score}
        correctGuesses={correctGuesses}
        gameMode={gameMode}
        streak={streak}
        achievements={achievements}
        playerName={playerName}
      />
    );
  }

  const emojiGrid = guessHistory.length > 0
    ? guessHistory.map(r => r === 'correct' ? '🟢' : '🔴').join('') + (streak >= 3 ? ' ⚡' : '')
    : null;

  const shareText = emojiGrid
    ? `🏟️ Lendas do Flu | ${score} pts\n${emojiGrid}\n⚽ Modo ${gameMode} — você consegue superar?\n\nlendasdoflu.com`
    : `🔥 Acabei de fazer ${correctGuesses} acertos seguidos no Lendas do Flu!
⚽ ${score} pontos no modo ${gameMode}
🏆 Você consegue superar?

Teste seus conhecimentos sobre os ídolos tricolores:`;
  
  const shareUrl = "https://lendasdoflu.com/";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({
        title: "Copiado!",
        description: "Texto copiado para a área de transferência",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível copiar",
      });
    }
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=Fluminense,LendasDoFlu,Tricolor`;
    window.open(url, '_blank');
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareOnInstagram = () => {
    copyToClipboard();
    toast({
      title: "📱 Instagram",
      description: "Texto copiado! Cole no seu story ou post do Instagram",
      duration: 4000,
    });
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lendas do Flu',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        logger.debug('Share cancelled or failed', 'SOCIAL_SHARE', err);
      }
    }
  };

  return (
    <div className="bg-card/90 backdrop-blur-sm rounded-lg p-4 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary mb-2">
          🎉 Compartilhe seu resultado!
        </h3>
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          {shareText}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {navigator.share && (
          <Button
            onClick={nativeShare}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 w-full"
          >
            <Share2 size={16} />
            Compartilhar
          </Button>
        )}
        
        <Button
          onClick={copyToClipboard}
          variant="outline"
          className="flex items-center gap-2 w-full"
        >
          <Copy size={16} />
          Copiar Texto
        </Button>
      </div>
    </div>
  );
};
