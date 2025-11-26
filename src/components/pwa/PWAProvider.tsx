import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { logger } from '@/utils/logger';

interface PWAContextType {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  installApp: () => Promise<void>;
  updateAvailable: boolean;
  reloadApp: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

interface PWAProviderProps {
  children: ReactNode;
}

export const PWAProvider = ({ children }: PWAProviderProps) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    logger.debug('PWA Provider inicializando', 'PWA');

    // Verificar se está instalado
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isIOS);
      
      if (isStandalone || isIOS) {
        logger.info('App está instalado', 'PWA');
      }
    };

    // Listener para status online/offline
    const handleOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      logger.info(`Status de conexão: ${online ? 'online' : 'offline'}`, 'PWA');
    };

    // Listener para beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      logger.info('beforeinstallprompt capturado', 'PWA');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listener para updates do service worker
    const handleServiceWorkerUpdate = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          logger.info('Service Worker atualizado', 'PWA');
          setUpdateAvailable(true);
        });

        navigator.serviceWorker.ready.then((registration) => {
          registration.addEventListener('updatefound', () => {
            logger.info('Atualização encontrada', 'PWA');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  logger.info('Nova versão instalada', 'PWA');
                  setUpdateAvailable(true);
                }
              });
            }
          });
        });
      }
    };

    checkInstallStatus();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    handleServiceWorkerUpdate();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const installApp = async () => {
    logger.info('Tentando instalar app', 'PWA');
    
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        logger.info(`Resultado da instalação: ${outcome}`, 'PWA');
        
        if (outcome === 'accepted') {
          setIsInstallable(false);
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (error) {
        logger.error('Erro na instalação', 'PWA', error);
        throw error;
      }
    } else {
      logger.warn('Prompt de instalação não disponível', 'PWA');
      throw new Error('Instalação não disponível');
    }
  };

  const reloadApp = () => {
    logger.info('Recarregando app', 'PWA');
    window.location.reload();
  };

  const value: PWAContextType = {
    isInstalled,
    isInstallable,
    isOnline,
    installApp,
    updateAvailable,
    reloadApp,
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA deve ser usado dentro de PWAProvider');
  }
  return context;
};