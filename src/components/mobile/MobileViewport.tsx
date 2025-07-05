
import React, { useEffect } from 'react';

export const MobileViewport = () => {
  useEffect(() => {
    // Otimizar viewport para diferentes dispositivos
    const updateViewport = () => {
      let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }

      // Configuração otimizada para jogos mobile
      const viewportContent = [
        'width=device-width',
        'initial-scale=1.0',
        'maximum-scale=1.0',
        'user-scalable=no',
        'viewport-fit=cover',
        'shrink-to-fit=no'
      ].join(', ');

      viewportMeta.setAttribute('content', viewportContent);
    };

    // Prevenir zoom duplo-toque
    const preventDoubleTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Aplicar configurações
    updateViewport();
    document.addEventListener('touchstart', preventDoubleTouch, { passive: false });

    // iOS specific fixes
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      // Prevenir scroll bounce
      document.body.style.overscrollBehavior = 'none';
      
      // Corrigir altura da viewport no iOS
      const setViewportHeight = () => {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
      };
      
      setViewportHeight();
      window.addEventListener('resize', setViewportHeight);
    }

    return () => {
      document.removeEventListener('touchstart', preventDoubleTouch);
    };
  }, []);

  return null;
};
