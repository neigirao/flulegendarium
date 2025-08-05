import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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
    console.log('🔧 PWA Provider: Inicializando...');

    // Verificar se está instalado
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isIOS);
      
      if (isStandalone || isIOS) {
        console.log('📱 PWA Provider: App está instalado');
      }
    };

    // Listener para status online/offline
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      console.log(`🌐 PWA Provider: Status de conexão: ${navigator.onLine ? 'online' : 'offline'}`);
    };

    // Listener para beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🚀 PWA Provider: beforeinstallprompt capturado');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listener para updates do service worker
    const handleServiceWorkerUpdate = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 PWA Provider: Service Worker atualizado');
          setUpdateAvailable(true);
        });

        navigator.serviceWorker.ready.then((registration) => {
          registration.addEventListener('updatefound', () => {
            console.log('📥 PWA Provider: Atualização encontrada');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('✅ PWA Provider: Nova versão instalada');
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
    console.log('🔄 PWA Provider: Tentando instalar app...');
    
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`📊 PWA Provider: Resultado da instalação: ${outcome}`);
        
        if (outcome === 'accepted') {
          setIsInstallable(false);
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (error) {
        console.error('❌ PWA Provider: Erro na instalação:', error);
        throw error;
      }
    } else {
      console.warn('⚠️ PWA Provider: Prompt de instalação não disponível');
      throw new Error('Instalação não disponível');
    }
  };

  const reloadApp = () => {
    console.log('🔄 PWA Provider: Recarregando app...');
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