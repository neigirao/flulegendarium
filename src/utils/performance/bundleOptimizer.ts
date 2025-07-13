export const BundleOptimizer = {
  // Critical resources that should be preloaded
  criticalResources: [
    '/assets/index.css',
    '/assets/index.js'
  ],

  // Resources to preconnect
  preconnectDomains: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://your-cdn-domain.com'
  ],

  // Generate preload links
  generatePreloadLinks: () => {
    const links = [];
    
    // Preload critical CSS
    links.push({
      rel: 'preload',
      href: '/assets/index.css',
      as: 'style',
      crossorigin: 'anonymous'
    });

    // Preload critical JS
    links.push({
      rel: 'preload',
      href: '/assets/index.js',
      as: 'script',
      crossorigin: 'anonymous'
    });

    // Preconnect to external domains
    BundleOptimizer.preconnectDomains.forEach(domain => {
      links.push({
        rel: 'preconnect',
        href: domain,
        crossorigin: 'anonymous'
      });
    });

    return links;
  },

  // Lazy load non-critical components
  lazyComponents: {
    AdminDashboard: () => import('@/pages/AdminLazy'),
    AdvancedAnalytics: () => import('@/components/admin/analytics/AdvancedAnalyticsDashboard'),
    BusinessIntelligence: () => import('@/components/admin/bi/BusinessIntelligenceDashboard')
  },

  // Code splitting configuration
  splitChunks: {
    vendor: ['react', 'react-dom', '@supabase/supabase-js'],
    ui: ['@radix-ui', 'framer-motion'],
    admin: ['recharts', '@tanstack/react-query'],
    utils: ['date-fns', 'uuid', 'clsx']
  }
};