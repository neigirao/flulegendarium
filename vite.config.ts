
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Configure MIME types for XML files
    middlewareMode: false,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries - loaded first and cached aggressively
          vendor: ['react', 'react-dom'],
          
          // Router - separate chunk for navigation with preloading
          router: ['react-router-dom'],
          
          // UI components - modular chunks for better caching
          'ui-core': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-toast',
            '@radix-ui/react-select'
          ],
          'ui-extended': [
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-tabs'
          ],
          
          // Data layer - optimized for performance
          query: ['@tanstack/react-query'],
          supabase: ['@supabase/supabase-js'],
          
          // Heavy dependencies - separate chunks for lazy loading
          icons: ['lucide-react'],
          charts: ['recharts'],
          animations: ['framer-motion'],
          
          // Game-specific chunks for better caching
          'game-core': [],
          'game-adaptive': [],
          'admin-panel': []
        },
        
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId;
          if (facadeModuleId) {
            const fileName = facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '') || 'chunk';
            return `assets/${fileName}-[hash].js`;
          }
          return 'assets/chunk-[hash].js';
        },
        
        // Optimize asset naming
        assetFileNames: 'assets/[name]-[hash].[ext]',
        
        // Optimize entry naming
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    
    // Enable minification for production with better performance
    minify: mode === 'production' ? 'esbuild' : false,
    
    // Optimize asset handling
    assetsDir: 'assets',
    
    // Generate source maps only in development for better performance
    sourcemap: mode === 'development',
    
    // Performance budget otimizado (based on PageSpeed Insights)
    chunkSizeWarningLimit: 200, // Reduzido para 200KB para melhor performance
    
    // Optimize CSS
    cssCodeSplit: true,
    
    // Target modern browsers for better performance
    target: 'esnext',
    
    // Optimize for production
    ...(mode === 'production' && {
      reportCompressedSize: false, // Faster builds
      cssMinify: 'esbuild',
    })
  },
  
  // Performance-optimized dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js'
    ],
    exclude: [
      // Lazy load heavy dependencies para melhor LCP
      'lucide-react',
      'framer-motion',
      'recharts'
    ],
    // Force pre-bundling para deps críticas
    force: true
  },
  
  // Performance optimizations
  esbuild: {
    // Remove console logs in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  }
}));
