import React, { useEffect, useCallback } from 'react';
import { useCoreWebVitals } from './use-core-web-vitals';
import { useCriticalResources } from './use-critical-resources';
import { useBundleAnalyzer } from './use-bundle-analyzer';

export const usePerformanceOptimization = () => {
  const { reportMetric } = useCoreWebVitals();
  const { preloadCriticalImages, loadNonCriticalResources } = useCriticalResources();
  const { trackChunkLoad } = useBundleAnalyzer();

  // Registrar Service Worker para cache otimizado
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'imports'
        });

        console.log('🚀 Performance SW registered:', registration.scope);

        // Verificar atualizações
        registration.addEventListener('updatefound', () => {
          console.log('🔄 SW: New version available');
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('✅ SW: New version installed, reload recommended');
                
                // Opcionalmente mostrar toast de atualização
                if ((window as any).showUpdateToast) {
                  (window as any).showUpdateToast();
                }
              }
            });
          }
        });

        // Monitorar mensagens do SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('📨 SW Message:', event.data);
        });

      } catch (error) {
        console.warn('SW registration failed:', error);
      }
    }
  }, []);

  // Otimizar recursos críticos
  const optimizeCriticalPath = useCallback(() => {
    console.log('🎯 Starting critical path optimization');

    // Preload imagens críticas imediatamente
    preloadCriticalImages();

    // Remover CSS crítico após carregamento
    setTimeout(() => {
      const criticalStyle = document.querySelector('style[data-critical="true"]');
      if (criticalStyle) {
        criticalStyle.remove();
        console.log('🗑️ Critical CSS removed after load');
      }
    }, 3000);

    // Carregar recursos não críticos com baixa prioridade
    setTimeout(() => {
      loadNonCriticalResources();
    }, 1500);
  }, [preloadCriticalImages, loadNonCriticalResources]);

  // Monitorar performance de componentes
  const trackComponentPerformance = useCallback((componentName: string, startTime: number) => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    console.log(`⚡ Component ${componentName} render: ${renderTime.toFixed(2)}ms`);
    
    // Track slow components
    if (renderTime > 100) {
      console.warn(`🐌 Slow component detected: ${componentName} (${renderTime.toFixed(2)}ms)`);
      
      if (window.gtag) {
        window.gtag('event', 'slow_component', {
          event_category: 'Performance',
          event_label: componentName,
          value: Math.round(renderTime)
        });
      }
    }
    
    return renderTime;
  }, []);

  // Otimizar carregamento de imagens
  const optimizeImageLoading = useCallback(() => {
    // Implementar intersection observer para lazy loading
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
            
            console.log('🖼️ Lazy loaded image:', img.src);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    // Observar todas as imagens com data-src
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach((img) => imageObserver.observe(img));

    return () => imageObserver.disconnect();
  }, []);

  // Reduzir CLS (Cumulative Layout Shift)
  const preventLayoutShift = useCallback(() => {
    // Adicionar dimensões a elementos dinâmicos
    const dynamicElements = document.querySelectorAll('[data-dynamic]');
    
    dynamicElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      if (!htmlElement.style.minHeight) {
        htmlElement.style.minHeight = '200px';
        htmlElement.style.transition = 'min-height 0.3s ease';
      }
    });

    // Observar mudanças de layout
    if ('LayoutShift' in window) {
      const observer = new PerformanceObserver((list) => {
        let cls = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cls += (entry as any).value;
          }
        }
        
        if (cls > 0.1) {
          console.warn(`🔄 High CLS detected: ${cls.toFixed(4)}`);
          
          if (window.gtag) {
            window.gtag('event', 'high_cls', {
              event_category: 'Performance',
              value: Math.round(cls * 10000) // Convert to score
            });
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('Layout shift observation not supported');
      }
    }
  }, []);

  // Otimizar carregamento de fontes
  const optimizeFontLoading = useCallback(() => {
    // Verificar se fontes estão carregadas
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        console.log('🔤 All fonts loaded');
        
        // Remove font-display: swap após carregamento
        const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
        fontLinks.forEach((link) => {
          (link as HTMLLinkElement).media = 'all';
        });
      });

      // Monitorar carregamento individual de fontes
      document.fonts.addEventListener('loadingdone', (event: any) => {
        console.log(`✅ Font loaded: ${event.fontface?.family || 'unknown'}`);
      });
    }
  }, []);

  useEffect(() => {
    const startTime = performance.now();
    
    // Executar otimizações em ordem de prioridade
    Promise.resolve()
      .then(() => registerServiceWorker())
      .then(() => optimizeCriticalPath())
      .then(() => preventLayoutShift())
      .then(() => optimizeFontLoading())
      .then(() => optimizeImageLoading())
      .then(() => {
        const totalTime = performance.now() - startTime;
        console.log(`🚀 Performance optimization complete: ${totalTime.toFixed(2)}ms`);
        
        if (window.gtag) {
          window.gtag('event', 'performance_optimization_complete', {
            event_category: 'Performance',
            value: Math.round(totalTime)
          });
        }
      })
      .catch((error) => {
        console.error('Performance optimization failed:', error);
      });
  }, [
    registerServiceWorker,
    optimizeCriticalPath,
    preventLayoutShift,
    optimizeFontLoading,
    optimizeImageLoading
  ]);

  return {
    trackComponentPerformance,
    reportMetric,
    trackChunkLoad
  };
};