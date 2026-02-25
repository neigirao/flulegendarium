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
  // Image transforms require Supabase Pro plan
  // Return original URL to avoid 403 errors on /render/image/ endpoint
  return url;
}

/**
 * Get responsive image srcset for different screen sizes
 */
export function getResponsiveSrcSet(
  url: string,
  sizes: number[] = [320, 640, 960, 1280]
): string | undefined {
  // Transforms not available on current Supabase plan - no srcset
  return undefined;
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
