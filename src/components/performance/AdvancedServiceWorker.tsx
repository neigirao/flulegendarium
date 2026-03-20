import { useEffect } from 'react';

export const AdvancedServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          });

          console.log('✅ Advanced SW registered successfully');

          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  if (confirm('Nova versão disponível! Deseja atualizar?')) {
                    newWorker.postMessage({ action: 'skipWaiting' });
                    window.location.reload();
                  }
                }
              });
            }
          });

          // Listen for controller changes (SW update activation)
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });

        } catch (error) {
          console.warn('⚠️ SW registration failed:', error);
        }
      };

      // Register on page load with delay to not block critical resources
      if (document.readyState === 'complete') {
        setTimeout(registerSW, 1000);
      } else {
        window.addEventListener('load', () => {
          setTimeout(registerSW, 1000);
        });
      }
    }
  }, []);

  return null;
};
