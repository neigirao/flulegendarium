import React, { useState } from 'react';
import { Share2, Copy, Camera, Instagram, MessageCircle, Check, QrCode } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FluCard } from '@/components/ui/flu-card';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { Badge } from '@/components/ui/badge';

interface ShareSystem2Props {
  trigger?: React.ReactNode;
  score: number;
  correctGuesses: number;
  gameMode?: string;
  streak?: number;
  achievements?: any[];
  playerName?: string;
}

export const ShareSystem2 = ({ 
  trigger, 
  score = 0,
  correctGuesses = 0,
  gameMode = "Clássico",
  streak = 0,
  achievements = [],
  playerName
}: ShareSystem2Props) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const accuracy = correctGuesses > 0 ? Math.round((correctGuesses / (correctGuesses + 1)) * 100) : 0;
  
  const shareText = `🏆 Lendas do Flu - Resultado Tricolor!

📊 ${score} pontos conquistados
🎯 ${accuracy}% de precisão 
🔥 ${streak} acertos consecutivos
⚽ Modo ${gameMode}

🤔 Você consegue me superar no conhecimento tricolor?
Teste seus conhecimentos: ${window.location.origin}

#LendasDoFlu #Fluminense #QuizTricolor #NenseNaVeia`;

  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    instagram: 'https://www.instagram.com/',
    stories: 'https://www.instagram.com/stories/camera/',
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(shareText)}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success('Texto copiado! Cole em qualquer lugar 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar texto');
    }
  };

  const generateShareImage = async () => {
    setIsGeneratingImage(true);
    try {
      const element = document.getElementById('share-card');
      if (!element) return;

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      // Download da imagem
      const link = document.createElement('a');
      link.download = `lendas-do-flu-${score}pts.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast.success('Imagem gerada! Compartilhe nas suas redes 📸');
    } catch (error) {
      toast.error('Erro ao gerar imagem');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleShare = (platform: string) => {
    const url = shareUrls[platform as keyof typeof shareUrls];
    
    if (platform === 'instagram' || platform === 'stories') {
      // Para Instagram, primeiro gera a imagem e copia o texto
      generateShareImage();
      copyToClipboard();
      toast.success(`Imagem salva! Abra o ${platform === 'stories' ? 'Stories' : 'Instagram'} e cole o texto 📱`);
      setTimeout(() => {
        window.open(url, '_blank');
      }, 1000);
    } else {
      window.open(url, '_blank', 'width=600,height=400');
      toast.success(`Compartilhando no ${platform}! 🚀`);
    }
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu resultado no Lendas do Flu',
          text: shareText,
          url: window.location.origin,
        });
        toast.success('Compartilhado com sucesso! 🎉');
      } catch (error) {
        // User cancelled or error occurred
      }
    }
  };

  const defaultTrigger = (
    <Button variant="default" className="gap-2 bg-flu-grena hover:bg-flu-grena/90">
      <Share2 className="w-4 h-4" />
      Compartilhar Resultado
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-flu-grena">
            <Share2 className="w-5 h-5" />
            Compartilhar Resultado 2.0
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Card de Preview para Compartilhamento */}
          <div id="share-card">
            <FluCard variant="tricolor" size="sm" className="relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-flu-grena via-flu-verde to-flu-branco"></div>
              </div>
              
              <div className="relative p-6 text-center">
                <div className="mb-4">
                  <h3 className="text-2xl font-black text-flu-grena mb-1">🏆 Lendas do Flu</h3>
                  <p className="text-sm text-gray-600">Quiz Oficial Tricolor</p>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white/80 rounded-lg p-3">
                    <div className="text-3xl font-black text-flu-grena">{score}</div>
                    <div className="text-sm text-gray-600">pontos conquistados</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-flu-verde/20 rounded-lg p-2">
                      <div className="font-bold text-flu-verde">{accuracy}%</div>
                      <div className="text-xs text-gray-600">precisão</div>
                    </div>
                    <div className="bg-flu-grena/20 rounded-lg p-2">
                      <div className="font-bold text-flu-grena">{streak}</div>
                      <div className="text-xs text-gray-600">sequência</div>
                    </div>
                  </div>
                  
                  {playerName && (
                    <Badge variant="outline" className="text-xs">
                      por {playerName}
                    </Badge>
                  )}
                </div>
                
                <div className="mt-4 text-xs text-gray-500">
                  flulegendarium.lovable.app
                </div>
              </div>
            </FluCard>
          </div>

          {/* Opções de Compartilhamento */}
          <div className="space-y-4">
            {/* Compartilhamento Rápido */}
            {navigator.share && (
              <Button
                onClick={shareViaWebShare}
                className="w-full bg-flu-grena hover:bg-flu-grena/90"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar Agora
              </Button>
            )}

            {/* Redes Sociais */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Redes Sociais:</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center gap-2 hover:bg-green-50 hover:border-green-500"
                >
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">WhatsApp</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleShare('instagram')}
                  className="flex items-center gap-2 hover:bg-pink-50 hover:border-pink-500"
                >
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <span className="text-sm">Instagram</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleShare('stories')}
                  className="flex items-center gap-2 hover:bg-purple-50 hover:border-purple-500"
                >
                  <Camera className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Stories</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-500"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="text-sm">X (Twitter)</span>
                </Button>
              </div>
            </div>

            {/* Ferramentas */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Ferramentas:</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="w-full justify-start gap-3"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? 'Texto Copiado!' : 'Copiar Texto Completo'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={generateShareImage}
                  disabled={isGeneratingImage}
                  className="w-full justify-start gap-3"
                >
                  <Camera className="w-4 h-4" />
                  {isGeneratingImage ? 'Gerando...' : 'Baixar Imagem'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};