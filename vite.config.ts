
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
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2
      },
      mangle: {
        safari10: true
      }
    },
    // Improve code splitting and chunk size handling
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunking - split large libraries separately
          if (id.includes('node_modules')) {
            // Core React
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            
            // Router
            if (id.includes('react-router-dom')) {
              return 'router';
            }
            
            // Data fetching
            if (id.includes('@tanstack/react-query')) {
              return 'data-fetching';
            }
            
            // Supabase and Auth (split separately due to size)
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase-core';
            }
            if (id.includes('@supabase/auth')) {
              return 'supabase-auth';
            }
            
            // Radix UI components (split into smaller chunks)
            if (id.includes('@radix-ui/react-dialog') || 
                id.includes('@radix-ui/react-alert-dialog') ||
                id.includes('@radix-ui/react-dropdown-menu') ||
                id.includes('@radix-ui/react-context-menu') ||
                id.includes('@radix-ui/react-menubar')) {
              return 'radix-overlays';
            }
            if (id.includes('@radix-ui/react-select') || 
                id.includes('@radix-ui/react-checkbox') ||
                id.includes('@radix-ui/react-radio-group') ||
                id.includes('@radix-ui/react-switch') ||
                id.includes('@radix-ui/react-slider')) {
              return 'radix-forms';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-other';
            }
            
            // Icons and assets
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            
            // Charts and visualization
            if (id.includes('recharts')) {
              return 'charts';
            }
            
            // Form handling
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'forms';
            }
            
            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n';
            }
            
            // Date handling
            if (id.includes('date-fns')) {
              return 'date-utils';
            }
            
            // Other vendor libraries
            return 'vendor-other';
          }
        }
      }
    }
  },
  // Enable experimental features for better optimization
  esbuild: {
    legalComments: 'none',
    treeShaking: true
  }
}));
