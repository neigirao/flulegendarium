
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
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
          // Critical vendors - loaded first with high priority
          'vendor-react': ['react', 'react-dom'],
          
          // Router - separate chunk for navigation
          'vendor-router': ['react-router-dom'],
          
          // UI components - cached separately for better performance
          'vendor-ui': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-toast',
            '@radix-ui/react-select',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs'
          ],
          
          // Data layer - separate chunk
          'vendor-data': ['@tanstack/react-query', '@supabase/supabase-js'],
          
          // Icons - separate chunk to enable lazy loading
          'vendor-icons': ['lucide-react'],
          
          // Game logic - separate chunk for better caching
          'game-logic': [
            './src/hooks/use-guess-game',
            './src/hooks/use-game-logic',
            './src/hooks/use-game-state'
          ],
          
          // Analytics and performance - lowest priority
          'vendor-analytics': [
            './src/hooks/use-analytics',
            './src/hooks/use-core-web-vitals'
          ]
        },
        
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name?.startsWith('vendor-')) {
            return `assets/vendors/[name]-[hash].js`;
          }
          
          const facadeModuleId = chunkInfo.facadeModuleId;
          if (facadeModuleId) {
            const fileName = facadeModuleId.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '') || 'chunk';
            return `assets/chunks/${fileName}-[hash].js`;
          }
          return 'assets/chunks/[name]-[hash].js';
        },
        
        // Optimize asset naming with better caching strategy
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').pop() || '';
          
          // Images get special treatment for better caching
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/images/[name]-[hash].[ext]`;
          }
          
          // CSS files
          if (extType === 'css') {
            return `assets/styles/[name]-[hash].[ext]`;
          }
          
          return `assets/[name]-[hash].[ext]`;
        },
        
        // Optimize entry naming
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    
    // Enhanced minification for better performance
    minify: mode === 'production' ? 'esbuild' : false,
    
    // Assets optimization
    assetsDir: 'assets',
    
    // Source maps only in development
    sourcemap: mode === 'development',
    
    // Stricter chunk size limits for better performance budget
    chunkSizeWarningLimit: 400, // Reduced from 500KB to 400KB
    
    // Enable CSS code splitting for better caching
    cssCodeSplit: true,
    
    // Target modern browsers for better optimization
    target: ['es2020', 'chrome80', 'firefox78', 'safari14'],
    
    // Production-specific optimizations
    ...(mode === 'production' && {
      reportCompressedSize: false, // Faster builds
      cssMinify: 'esbuild',
      // Enable tree shaking
      treeshake: {
        preset: 'recommended',
        unknownGlobalSideEffects: false
      }
    })
  },
  
  // Enhanced dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js'
    ],
    exclude: [
      // Large dependencies that should be lazy loaded
      'lucide-react'
    ],
    // Force optimization of commonly used dependencies
    force: mode === 'development'
  },
  
  // Performance optimizations
  esbuild: {
    // Remove console and debugger in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    // Enable legal comments for licensing
    legalComments: 'none'
  },
  
  // CSS optimization
  css: {
    devSourcemap: mode === 'development',
    ...(mode === 'production' && {
      postcss: {
        plugins: [
          // Add any PostCSS plugins for production optimization
        ]
      }
    })
  }
}));
