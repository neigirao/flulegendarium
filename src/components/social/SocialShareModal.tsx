
import { useState, useRef } from 'react';
import { Share2, Twitter, Instagram, Facebook, Copy, Download, MessageCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ShareCard } from './ShareCard';
import { ShareSuccessToast } from './ShareSuccessToast';
import { Achievement } from "@/types/achievements";
import html2canvas from 'html2canvas';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  correctGuesses: number;
  gameMode?: string;
  streak?: number;
  achievements?: Achievement[];
  playerName?: string;
}

export const SocialShareModal = ({ 
  isOpen, 
  onClose, 
  score, 
  correctGuesses, 
  gameMode = "Clássico",
  streak = 0,
  achievements = [],
  playerName
}: SocialShareModalProps) => {
  const { toast } = useToast();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [lastSharedAchievement, setLastSharedAchievement] = useState<Achievement | undefined>();
  const shareCardRef = useRef<HTMLDivElement>(null);

  const shareText = `🔥 Acabei de fazer ${correctGuesses} acertos seguidos no Lendas do Flu! 
⚽ ${score} pontos no modo ${gameMode}
${streak > 0 ? `🎯 Sequência de ${streak} acertos!` : ''}
${achievements.length > 0 ? `🏆 Nova conquista: ${achievements[0].name}!` : ''}

Você consegue superar? Teste seus conhecimentos sobre os ídolos tricolores:`;
  
  const shareUrl = "https://flulegendarium.lovable.app/";

  const generateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const shareCard = document.getElementById('share-card');
      if (shareCard) {
        const canvas = await html2canvas(shareCard, {
          backgroundColor: null,
          scale: 2,
          width: 400,
          height: 600
        });
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lendas-do-flu-${score}pts.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            toast({
              title: "Imagem salva!",
              description: "Card de compartilhamento baixado com sucesso",
            });
          }
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível gerar a imagem",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
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
    const hashtags = "Fluminense,LendasDoFlu,Tricolor";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashtags}`;
    window.open(url, '_blank');
    
    if (achievements.length > 0) {
      setLastSharedAchievement(achievements[0]);
      setShareSuccess(true);
    }
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareOnInstagram = () => {
    generateImage();
    toast({
      title: "📱 Instagram",
      description: "Imagem baixada! Faça upload no seu story ou post do Instagram",
      duration: 4000,
    });
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lendas do Flu - Meu Resultado',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-flu-grena flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Compartilhar Resultado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share Card Preview */}
          <div id="share-card" className="flex justify-center">
            <ShareCard 
              score={score}
              correctGuesses={correctGuesses}
              gameMode={gameMode}
              streak={streak}
              achievements={achievements}
              playerName={playerName}
            />
          </div>

          {/* Share Options */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold text-gray-700 mb-3">Escolha como compartilhar:</h3>
            </div>

            {/* Primary Actions */}
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
                onClick={generateImage}
                disabled={isGeneratingImage}
                variant="outline"
                className="flex items-center gap-2 border-flu-verde text-flu-verde hover:bg-flu-verde/10"
              >
                <Download size={16} />
                {isGeneratingImage ? "Gerando..." : "Baixar Card"}
              </Button>
            </div>

            {/* Social Platforms */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={shareOnTwitter}
                className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
              >
                <Twitter size={16} />
                Twitter
              </Button>
              
              <Button
                onClick={shareOnWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
              >
                <MessageCircle size={16} />
                WhatsApp
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
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center gap-2"
              >
                <Instagram size={16} />
                Instagram
              </Button>
            </div>

            {/* Copy Text */}
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Copy size={16} />
              Copiar Texto
            </Button>

            {/* Preview Text */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Texto que será compartilhado:</p>
              <p className="text-sm text-gray-800 whitespace-pre-line">{shareText}</p>
            </div>
          </div>

          {achievements.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Conquista Desbloqueada!</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Compartilhe sua conquista "{achievements[0]?.name}" e inspire outros jogadores!
              </p>
            </div>
          )}
        </div>

        <ShareSuccessToast 
          achievement={lastSharedAchievement} 
          trigger={shareSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};
