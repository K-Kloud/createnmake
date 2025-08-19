
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  },
  plugins: [
    react({
      // Remove the fastRefresh option as it's not in the Options type
      // Fast refresh is enabled by default in development mode anyway
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  base: "/",
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@tanstack/react-query'
    ],
    force: true
  },
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info', 'console.warn'], // Remove specific console methods
        unsafe: false,
        passes: 3 // Multiple optimization passes
      },
      mangle: {
        safari10: true // Better Safari compatibility
      }
    },
    // Improve code splitting and chunk optimization
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-components';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'data-fetching';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            return 'vendor';
          }
          
          // Application chunks
          if (id.includes('/src/components/admin/')) {
            return 'admin';
          }
          if (id.includes('/src/components/marketplace/')) {
            return 'marketplace';
          }
          if (id.includes('/src/components/gallery/')) {
            return 'gallery';
          }
          if (id.includes('/src/components/generator/')) {
            return 'generator';
          }
          if (id.includes('/src/hooks/')) {
            return 'hooks';
          }
          if (id.includes('/src/utils/') || id.includes('/src/lib/')) {
            return 'utils';
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/[name]-[hash].js`;
        }
      }
    },
    // Optimization settings
    target: 'es2020',
    sourcemap: false, // Disable sourcemaps in production for smaller builds
    reportCompressedSize: false, // Skip gzip size reporting for faster builds
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit
    assetsInlineLimit: 4096 // Inline assets smaller than 4kb
  },
  // Enable experimental features for better optimization
  esbuild: {
    legalComments: 'none',
    treeShaking: true
  }
}));
