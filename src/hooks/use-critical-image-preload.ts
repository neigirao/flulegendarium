import { useEffect, useRef } from 'react';
import { 
  getTransformedImageUrl, 
  isSupabaseStorageUrl 
} from '@/utils/image/supabaseTransforms';

interface CriticalImageConfig {
  src: string;
  priority?: 'high' | 'low';
  width?: number;
  quality?: number;
}

/**
 * Hook to preload critical images for LCP optimization
 * Automatically handles Supabase Storage transforms
 */
export function useCriticalImagePreload(images: CriticalImageConfig[]) {
  const preloadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined' || images.length === 0) return;

    const highPriorityImages = images.filter(img => img.priority === 'high');
    const lowPriorityImages = images.filter(img => img.priority !== 'high');

    // Preload high priority images immediately
    highPriorityImages.forEach(({ src, width = 800, quality = 80 }) => {
      if (preloadedRef.current.has(src)) return;
      
      const optimizedUrl = isSupabaseStorageUrl(src)
        ? getTransformedImageUrl(src, { width, quality, format: 'webp' })
        : src;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedUrl;
      link.fetchPriority = 'high';
      document.head.appendChild(link);
      
      preloadedRef.current.add(src);
    });

    // Preload low priority images during idle time
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        lowPriorityImages.forEach(({ src, width = 640, quality = 70 }, index) => {
          if (preloadedRef.current.has(src)) return;
          
          setTimeout(() => {
            const optimizedUrl = isSupabaseStorageUrl(src)
              ? getTransformedImageUrl(src, { width, quality, format: 'webp' })
              : src;

            const img = new Image();
            img.src = optimizedUrl;
            preloadedRef.current.add(src);
          }, index * 100);
        });
      }, { timeout: 2000 });
    }
  }, [images]);
}

/**
 * Hook to preload the next game image(s) during gameplay
 */
export function useGameImagePreload(
  currentImageUrl: string | null,
  nextImageUrls: string[] = []
) {
  const preloadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!currentImageUrl || nextImageUrls.length === 0) return;

    // Only preload if current image has loaded
    const preloadNext = () => {
      nextImageUrls.slice(0, 2).forEach((url, index) => {
        if (preloadedRef.current.has(url)) return;

        const delay = index * 150;
        
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            setTimeout(() => {
              const optimizedUrl = isSupabaseStorageUrl(url)
                ? getTransformedImageUrl(url, { width: 640, quality: 75, format: 'webp' })
                : url;

              const img = new Image();
              img.fetchPriority = 'low';
              img.src = optimizedUrl;
              preloadedRef.current.add(url);
            }, delay);
          }, { timeout: 500 });
        }
      });
    };

    // Wait for current image to be likely loaded
    const timer = setTimeout(preloadNext, 300);
    return () => clearTimeout(timer);
  }, [currentImageUrl, nextImageUrls]);
}

/**
 * Preconnect to critical origins for faster resource loading
 * Call once at app startup
 */
export function preconnectCriticalOrigins() {
  if (typeof window === 'undefined') return;

  const origins = [
    'https://uodxnuimxhmlqxoqxqaz.supabase.co', // Supabase API & Storage
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];

  origins.forEach(origin => {
    const existing = document.querySelector(`link[rel="preconnect"][href="${origin}"]`);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });
}
