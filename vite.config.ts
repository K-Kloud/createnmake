
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
        drop_debugger: true
      }
    },
    // Improve code splitting
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React and framework
          'react-vendor': ['react', 'react-dom'],
          
          // Routing and navigation
          'router': ['react-router-dom'],
          
          // Data fetching and state management
          'data-fetching': ['@tanstack/react-query'],
          
          // UI component library
          'ui-components': [
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
          
          // Authentication and Supabase
          'auth-supabase': [
            '@supabase/supabase-js',
            '@supabase/auth-helpers-react',
            '@supabase/auth-ui-react'
          ],
          
          // Utilities and helpers
          'utils': ['@/lib/utils', '@/utils/seo'],
          
          // Route-specific chunks (will be loaded only when needed)
          'admin-routes': ['@/pages/Admin', '@/pages/AdminScheduledJobs', '@/pages/AdminAIAgents'],
          'crm-routes': ['@/pages/CRMDashboard', '@/pages/CRMContacts', '@/pages/CRMTasks'],
          'creator-routes': ['@/pages/CreatorDashboardPage', '@/pages/CreatorOnboardingPage'],
          'artisan-routes': ['@/pages/Artisan', '@/pages/ArtisanOnboarding', '@/pages/ArtisanOrders'],
          'manufacturer-routes': ['@/pages/Manufacturer', '@/pages/ManufacturerOnboarding']
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
