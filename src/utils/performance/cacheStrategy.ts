export const CacheStrategy = {
  // Cache durations in seconds
  STATIC_ASSETS: 31536000, // 1 year
  IMAGES: 2592000, // 30 days
  API_DATA: 300, // 5 minutes
  USER_DATA: 60, // 1 minute

  // Cache headers configuration
  getHeaders: (type: 'static' | 'images' | 'api' | 'user') => {
    const durations = {
      static: CacheStrategy.STATIC_ASSETS,
      images: CacheStrategy.IMAGES,
      api: CacheStrategy.API_DATA,
      user: CacheStrategy.USER_DATA
    };

    return {
      'Cache-Control': `public, max-age=${durations[type]}, immutable`,
      'ETag': `"${Date.now()}"`,
      'Last-Modified': new Date().toUTCString()
    };
  },

  // Service Worker cache strategies
  getCacheStrategy: (resourceType: string) => {
    const strategies = {
      images: 'CacheFirst',
      static: 'CacheFirst',
      api: 'NetworkFirst',
      html: 'NetworkFirst'
    };
    
    return strategies[resourceType as keyof typeof strategies] || 'NetworkFirst';
  }
};