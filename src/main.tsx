
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import "./index.css";
import "./App.css";
import "./lib/i18n"; // Import i18n configuration

// Phase 1 Debug: Add logging to track app initialization
console.log('🚀 [MAIN] Starting app initialization...');

// Production optimizations
import { initializeProductionOptimizations } from "./utils/production";
import { initializeAssetOptimizations } from "./utils/asset-optimization";

// Initialize optimizations in production
if (process.env.NODE_ENV === 'production') {
  console.log('🔧 [MAIN] Initializing production optimizations...');
  initializeProductionOptimizations();
  initializeAssetOptimizations();
  console.log('✅ [MAIN] Production optimizations initialized');
}

console.log('🎯 [MAIN] Creating React root...');
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ [MAIN] Root element not found!');
  throw new Error('Root element not found');
}

console.log('📦 [MAIN] Rendering app...');
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
console.log('✅ [MAIN] App render initiated');
