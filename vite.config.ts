
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
          // Core React libraries - loaded first
          vendor: ['react', 'react-dom'],
          
          // Router - separate chunk for navigation
          router: ['react-router-dom'],
          
          // UI components - separate chunk to allow caching
          ui: [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-toast',
            '@radix-ui/react-select',
            '@radix-ui/react-dropdown-menu'
          ],
          
          // Data fetching - separate chunk
          query: ['@tanstack/react-query'],
          
          // Database - separate chunk
          supabase: ['@supabase/supabase-js'],
          
          // Icons - separate chunk since they're large
          icons: ['lucide-react']
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
    
    // Set chunk size warning limit (performance budget)
    chunkSizeWarningLimit: 300, // Reduced from 500KB to 300KB for better performance
    
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
  
  // Optimize dependencies for better performance budget
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js'
    ],
    exclude: [
      // Exclude large dependencies that should be lazy loaded
      'lucide-react'
    ]
  },
  
  // Performance optimizations
  esbuild: {
    // Remove console logs in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  }
}));
