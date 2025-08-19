
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import "./index.css";
import "./App.css";
import "./lib/i18n"; // Import i18n configuration

// Production optimizations
import { initializeProductionOptimizations } from "./utils/production";
import { initializeAssetOptimizations } from "./utils/asset-optimization";

// Initialize optimizations in production
if (process.env.NODE_ENV === 'production') {
  initializeProductionOptimizations();
  initializeAssetOptimizations();
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
