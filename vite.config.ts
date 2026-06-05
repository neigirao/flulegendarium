
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

function criticalCssPlugin(): Plugin {
  return {
    name: 'critical-css',
    apply: 'build',
    enforce: 'post',
    async closeBundle() {
      const { default: Critters } = await import('critters') as any;
      const outDir = path.resolve(__dirname, 'dist');
      const htmlPath = path.join(outDir, 'index.html');
      if (!fs.existsSync(htmlPath)) return;

      const html = fs.readFileSync(htmlPath, 'utf-8');
      const critters = new Critters({
        path: outDir,
        publicPath: '/',
        pruneSource: false,
        inlineFonts: false,
        preloadFonts: true,
        logLevel: 'warn',
      });

      try {
        const result = await critters.process(html);
        fs.writeFileSync(htmlPath, result);
        console.log('\x1b[32m✓\x1b[0m Critical CSS inlined — CSS bundle deferred');
      } catch (e) {
        console.warn('\x1b[33m⚠\x1b[0m Critical CSS plugin skipped:', (e as Error).message);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    middlewareMode: false,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && criticalCssPlugin(),
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
