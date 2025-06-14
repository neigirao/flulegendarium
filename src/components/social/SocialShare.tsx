import { Share2, Twitter, Instagram, Facebook, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { QuickShareButton } from './QuickShareButton';
import { Achievement } from "@/types/achievements";

interface SocialShareProps {
  score: number;
  correctGuesses: number;
  gameMode?: string;
  streak?: number;
  achievements?: Achievement[];
  playerName?: string;
  showFullInterface?: boolean;
}

export const SocialShare = ({ 
  score, 
  correctGuesses, 
  gameMode = "Clássico",
  streak = 0,
  achievements = [],
  playerName,
  showFullInterface = true
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

  const shareText = `🔥 Acabei de fazer ${correctGuesses} acertos seguidos no Lendas do Flu! 
⚽ ${score} pontos no modo ${gameMode}
🏆 Você consegue superar? 

Teste seus conhecimentos sobre os ídolos tricolores:`;
  
  const shareUrl = "https://flulegendarium.lovable.app/";

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
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-flu-grena mb-2">
          🎉 Compartilhe seu resultado!
        </h3>
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          {shareText}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {navigator.share && (
          <Button
            onClick={nativeShare}
            className="bg-flu-grena hover:bg-flu-grena/90 text-white flex items-center gap-2"
          >
            <Share2 size={16} />
            Compartilhar
          </Button>
        )}
        
        <Button
          onClick={copyToClipboard}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Copy size={16} />
          Copiar
        </Button>
        
        <Button
          onClick={shareOnTwitter}
          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
        >
          <Twitter size={16} />
          Twitter
        </Button>
        
        <Button
          onClick={shareOnFacebook}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Facebook size={16} />
          Facebook
        </Button>
        
        <Button
          onClick={shareOnInstagram}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center gap-2 col-span-2"
        >
          <Instagram size={16} />
          Instagram Story
        </Button>
      </div>
    </div>
  );
};
