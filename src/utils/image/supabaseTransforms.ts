/**
 * Supabase Image Transforms utility
 * Adds transformation parameters to Supabase Storage URLs for optimized loading
 */

interface TransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'origin' | 'webp' | 'avif';
  resize?: 'cover' | 'contain' | 'fill';
}

const SUPABASE_STORAGE_PATTERN = /supabase\.co\/storage\/v1\/object\/public\//;

/**
 * Check if URL is from Supabase Storage
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return SUPABASE_STORAGE_PATTERN.test(url);
}

/**
 * Add transformation parameters to Supabase Storage URL
 */
export function getTransformedImageUrl(
  url: string,
  options: TransformOptions = {}
): string {
  if (!url || !isSupabaseStorageUrl(url)) {
    return url;
  }

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    resize = 'cover'
  } = options;

  // Build transform URL using Supabase Storage API
  // Pattern: /storage/v1/render/image/public/{bucket}/{path}?width=X&height=Y
  const transformedUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );

  const params = new URLSearchParams();
  
  if (width) params.set('width', width.toString());
  if (height) params.set('height', height.toString());
  params.set('quality', quality.toString());
  params.set('format', format);
  params.set('resize', resize);

  const separator = transformedUrl.includes('?') ? '&' : '?';
  return `${transformedUrl}${separator}${params.toString()}`;
}

/**
 * Get responsive image srcset for different screen sizes
 */
export function getResponsiveSrcSet(
  url: string,
  sizes: number[] = [320, 640, 960, 1280]
): string {
  if (!isSupabaseStorageUrl(url)) {
    return url;
  }

  return sizes
    .map(size => {
      const transformedUrl = getTransformedImageUrl(url, { 
        width: size, 
        quality: size <= 640 ? 70 : 80 
      });
      return `${transformedUrl} ${size}w`;
    })
    .join(', ');
}

/**
 * Get optimized image URL based on device and context
 */
export function getOptimizedImageUrl(
  url: string,
  context: 'thumbnail' | 'card' | 'full' | 'hero' = 'card'
): string {
  const configs: Record<typeof context, TransformOptions> = {
    thumbnail: { width: 150, height: 150, quality: 60 },
    card: { width: 400, height: 500, quality: 75 },
    full: { width: 800, height: 1000, quality: 85 },
    hero: { width: 1200, height: 800, quality: 90 }
  };

  return getTransformedImageUrl(url, configs[context]);
}

/**
 * Preload an image with optimized settings
 */
export function preloadOptimizedImage(
  url: string,
  options: TransformOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const optimizedUrl = getTransformedImageUrl(url, options);
    
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload: ${url}`));
    img.src = optimizedUrl;
  });
}
