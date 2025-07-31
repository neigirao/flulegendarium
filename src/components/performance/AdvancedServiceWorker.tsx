import { useEffect } from 'react';

export const AdvancedServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Enhanced service worker registration with better error handling
      const registerSW = async () => {
        try {
          // Register with immediate activation
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none' // Always check for updates
          });

          console.log('✅ Advanced SW registered successfully');

          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New SW is available, show update notification
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

          // Periodic SW health check
          setInterval(() => {
            registration.update().catch(console.warn);
          }, 60000); // Check every minute

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

      // Background sync registration for offline capabilities
      const registerBackgroundSync = async () => {
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready;
            // Background sync will be handled by the service worker
            console.log('✅ Service worker ready for background sync');
          } catch (error) {
            console.warn('⚠️ Background sync registration failed:', error);
          }
        }
      };

      registerBackgroundSync();

      // Push notification setup (for future use)
      const setupPushNotifications = async () => {
        if ('Notification' in window && 'serviceWorker' in navigator) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            console.log('✅ Push notifications enabled');
          }
        }
      };

      // Only request push permission on user interaction
      let hasRequestedPush = false;
      const requestPushOnInteraction = () => {
        if (!hasRequestedPush) {
          hasRequestedPush = true;
          setupPushNotifications();
        }
      };

      document.addEventListener('click', requestPushOnInteraction, { once: true });
      document.addEventListener('touchstart', requestPushOnInteraction, { once: true });
    }
  }, []);

  return null;
};