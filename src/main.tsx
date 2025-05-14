
import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./hooks/useAuth";
import "./index.css";
import "./App.css";

// Use lazy loading for the main App component
const App = React.lazy(() => import("./App"));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <React.Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
        <App />
      </React.Suspense>
    </AuthProvider>
  </React.StrictMode>
);
