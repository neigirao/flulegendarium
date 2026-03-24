import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Download, Share, Plus, MoreVertical, Smartphone, Monitor, Tablet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { logger } from '@/utils/logger';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export const PWAInstallPrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');
  const [isInstallable, setIsInstallable] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    logger.debug('PWA Install Prompt inicializando', 'PWAInstall');
    
    // Detectar plataforma
    const detectPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setPlatform('ios');
      } else if (/android/.test(userAgent)) {
        setPlatform('android');
      } else {
        setPlatform('desktop');
      }
    };

    detectPlatform();

    // Listener para beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      logger.info('beforeinstallprompt evento capturado', 'PWAInstall');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Verificar se já está instalado
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        logger.info('App já está instalado', 'PWAInstall');
        return true;
      }
      if ((window.navigator as unknown as { standalone?: boolean }).standalone === true) {
        logger.info('App já está instalado (iOS)', 'PWAInstall');
        return true;
      }
      return false;
    };

    // Mostrar prompt após 2 segundos se não estiver instalado e for mobile
    const showPromptTimer = setTimeout(() => {
      if (!checkIfInstalled() && isMobile) {
        logger.debug('Mostrando prompt após 2 segundos (mobile)', 'PWAInstall');
        setIsVisible(true);
      } else if (!isMobile) {
        logger.debug('Não exibindo para desktop', 'PWAInstall');
      }
    }, 8000);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(showPromptTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInstall = async () => {
    logger.info('Tentando instalação', 'PWAInstall');
    
    if (deferredPrompt) {
      logger.info('Usando API nativa', 'PWAInstall');
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        logger.info(`Resultado da instalação: ${outcome}`, 'PWAInstall');
        
        if (outcome === 'accepted') {
          setIsVisible(false);
        }
        setDeferredPrompt(null);
      } catch (error) {
        logger.error('Erro na instalação', 'PWAInstall', error);
        setShowInstructions(true);
      }
    } else {
      logger.debug('Mostrando instruções manuais', 'PWAInstall');
      setShowInstructions(true);
    }
  };

  const getInstallInstructions = () => {
    switch (platform) {
      case 'ios':
        return {
          icon: <Smartphone className="w-8 h-8 text-blue-500" />,
          title: 'Instalar no iPhone/iPad',
          steps: [
            'Toque no botão de compartilhar na barra inferior',
            'Role para baixo e toque em "Adicionar à Tela de Início"',
            'Toque em "Adicionar" para confirmar'
          ],
          illustration: <Share className="w-6 h-6" />
        };
      
      case 'android':
        return {
          icon: <Smartphone className="w-8 h-8 text-green-500" />,
          title: 'Instalar no Android',
          steps: [
            'Toque no menu (⋮) no canto superior direito',
            'Selecione "Adicionar à tela inicial" ou "Instalar app"',
            'Toque em "Instalar" para confirmar'
          ],
          illustration: <MoreVertical className="w-6 h-6" />
        };
      
      default:
        return {
          icon: <Monitor className="w-8 h-8 text-purple-500" />,
          title: 'Instalar no Desktop',
          steps: [
            'Clique no ícone de instalação na barra de endereços',
            'Ou vá no menu do navegador > "Instalar Lendas do Flu"',
            'Clique em "Instalar" para confirmar'
          ],
          illustration: <Download className="w-6 h-6" />
        };
    }
  };

  const instructions = getInstallInstructions();

  if (!isVisible) return null;

  return (
    <>
      {/* Prompt Principal */}
      <Card className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 bg-white/95 backdrop-blur-sm border-primary/20 shadow-xl animate-slideIn">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-primary">Instalar App</div>
                <Badge variant="secondary" className="text-xs">PWA</Badge>
              </div>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(false)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">
            Instale o Lendas do Flu para uma experiência mais rápida e offline!
          </p>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleInstall}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark"
            >
              {isInstallable ? (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Instalar Agora
                </>
              ) : (
                <>
                  <Share className="w-4 h-4 mr-2" />
                  Como Instalar
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setIsVisible(false)}
              className="border-primary/20"
            >
              Mais Tarde
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
            <div className="flex gap-1">
              {['📱', '🚀', '📡'].map((emoji, i) => (
                <span key={i}>{emoji}</span>
              ))}
            </div>
            <span>Funciona offline • Mais rápido • Como um app nativo</span>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Instruções */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {instructions.icon}
              {instructions.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center justify-center mb-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  {instructions.illustration}
                </div>
              </div>
              
              <ol className="space-y-3">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="flex gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowInstructions(false)}
                variant="outline"
                className="flex-1"
              >
                Entendi
              </Button>
              
              <Button 
                onClick={() => {
                  setShowInstructions(false);
                  setIsVisible(false);
                }}
                className="flex-1 bg-gradient-to-r from-primary to-secondary"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};