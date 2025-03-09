
import { useEffect, useRef } from 'react';

interface PreloadOptions {
  priority?: 'high' | 'low' | 'auto';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Hook para precarregar recursos como imagens
 */
export function usePreload() {
  const preloadedResources = useRef<Set<string>>(new Set());
  
  // Precarregar uma imagem
  const preloadImage = (src: string, options: PreloadOptions = {}) => {
    if (!src || preloadedResources.current.has(src)) {
      return;
    }
    
    const { priority = 'auto', onLoad, onError } = options;
    
    const img = new Image();
    img.src = src;
    
    if ('fetchPriority' in img) {
      (img as any).fetchPriority = priority;
    }
    
    img.onload = () => {
      preloadedResources.current.add(src);
      onLoad?.();
    };
    
    img.onerror = () => {
      onError?.();
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  };
  
  // Precarregar várias imagens com prioridade inteligente
  const preloadImages = (sources: string[]) => {
    if (!sources || sources.length === 0) return;
    
    // Precarregar as primeiras 2 imagens com alta prioridade
    sources.slice(0, 2).forEach(src => {
      preloadImage(src, { priority: 'high' });
    });
    
    // Usar requestIdleCallback para precarregar o resto quando o navegador estiver ocioso
    if (sources.length > 2) {
      const requestIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1000));
      
      requestIdle(() => {
        sources.slice(2).forEach((src, index) => {
          // Espaçar o carregamento para não sobrecarregar a rede
          setTimeout(() => {
            preloadImage(src, { priority: 'low' });
          }, index * 200);
        });
      });
    }
  };
  
  return {
    preloadImage,
    preloadImages,
    isPreloaded: (src: string) => preloadedResources.current.has(src)
  };
}
