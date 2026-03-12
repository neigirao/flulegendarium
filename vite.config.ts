
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
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
          // Core React libraries
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          
          // UI components
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
          
          // Data layer
          query: ['@tanstack/react-query'],
          supabase: ['@supabase/supabase-js'],
          
          // Heavy dependencies - separate chunks
          icons: ['lucide-react'],
          charts: ['recharts'],
          animations: ['framer-motion'],
        },
        
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId;
          if (facadeModuleId) {
            const fileName = facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '') || 'chunk';
            return `assets/${fileName}-[hash].js`;
          }
          return 'assets/chunk-[hash].js';
        },
        
        assetFileNames: 'assets/[name]-[hash].[ext]',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    
    minify: mode === 'production' ? 'esbuild' : false,
    assetsDir: 'assets',
    sourcemap: mode === 'development',
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    target: 'esnext',
    
    ...(mode === 'production' && {
      reportCompressedSize: false,
      cssMinify: 'esbuild',
    })
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react'
    ],
  },
  
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  }
}));
