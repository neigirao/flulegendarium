// Otimizador de imagens para melhor performance
export class ImageOptimizer {
  private static instance: ImageOptimizer;
  private cache = new Map<string, HTMLImageElement>();
  private preloadQueue: string[] = [];
  private maxCacheSize = 50;

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  // Determinar melhor formato baseado no suporte do browser
  getBestFormat(originalUrl: string): string {
    // Para imagens do Lovable, usar formato original otimizado
    if (originalUrl.includes('lovable-uploads')) {
      return originalUrl;
    }

    // Verificar suporte a WebP
    if (this.supportsWebP()) {
      return originalUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }

    return originalUrl;
  }

  // Gerar srcset responsivo
  generateSrcSet(baseUrl: string, sizes: number[] = [400, 800, 1200]): string {
    if (!baseUrl.includes('lovable-uploads')) {
      return baseUrl;
    }

    return sizes
      .map(size => `${baseUrl}?w=${size} ${size}w`)
      .join(', ');
  }

  // Preload inteligente de imagens críticas
  async preloadCritical(urls: string[], priority: 'high' | 'low' = 'high'): Promise<void> {
    const promises = urls.map(url => this.preloadImage(url, priority));
    
    try {
      await Promise.allSettled(promises);
      console.log(`🚀 Preloaded ${urls.length} critical images`);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }

  // Preload com cache inteligente
  private async preloadImage(url: string, priority: 'high' | 'low'): Promise<HTMLImageElement> {
    // Verificar cache primeiro
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Configurar atributos de performance
      img.decoding = 'async';
      img.loading = priority === 'high' ? 'eager' : 'lazy';
      (img as any).fetchPriority = priority;

      img.onload = () => {
        // Adicionar ao cache com limpeza automática
        this.addToCache(url, img);
        console.log(`✅ Preloaded image: ${url} (${priority} priority)`);
        resolve(img);
      };

      img.onerror = () => {
        console.warn(`❌ Failed to preload: ${url}`);
        reject(new Error(`Failed to load image: ${url}`));
      };

      img.src = this.getBestFormat(url);
    });
  }

  // Lazy loading com intersection observer otimizado
  setupLazyLoading(threshold = 0.1, rootMargin = '50px'): IntersectionObserver {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          if (img.dataset.src) {
            // Carregar imagem otimizada
            const optimizedSrc = this.getBestFormat(img.dataset.src);
            img.src = optimizedSrc;
            
            // Configurar srcset se disponível
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
            }
            
            // Limpar data attributes
            img.removeAttribute('data-src');
            img.removeAttribute('data-srcset');
            
            observer.unobserve(img);
            
            console.log(`🖼️ Lazy loaded: ${optimizedSrc}`);
          }
        }
      });
    }, {
      threshold,
      rootMargin
    });

    // Observar todas as imagens lazy
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => observer.observe(img));

    return observer;
  }

  // Otimizar imagem existente para melhor performance
  optimizeExistingImage(img: HTMLImageElement): void {
    // Configurar atributos de performance
    img.decoding = 'async';
    img.loading = 'lazy';
    
    // Adicionar dimensões se não existirem (previne CLS)
    if (!img.width && !img.height && !img.style.width && !img.style.height) {
      img.style.aspectRatio = '4/5'; // Padrão para imagens de jogadores
    }

    // Configurar srcset responsivo se for imagem do Lovable
    if (img.src.includes('lovable-uploads') && !img.srcset) {
      img.srcset = this.generateSrcSet(img.src);
      img.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    }
  }

  // Cache management com LRU
  private addToCache(url: string, img: HTMLImageElement): void {
    // Remover item mais antigo se cache estiver cheio
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(url, img);
  }

  // Limpar cache para liberar memória
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Image cache cleared');
  }

  // Verificar suporte a WebP
  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('webp') > -1;
  }

  // Verificar suporte a AVIF
  private supportsAVIF(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/avif').indexOf('avif') > -1;
  }

  // Estatísticas de performance
  getPerformanceStats(): object {
    return {
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      supportsWebP: this.supportsWebP(),
      supportsAVIF: this.supportsAVIF(),
      preloadQueueSize: this.preloadQueue.length
    };
  }
}

// Exportar instância singleton
export const imageOptimizer = ImageOptimizer.getInstance();