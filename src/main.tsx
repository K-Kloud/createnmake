
import { createRoot } from 'react-dom/client'
import { lazy, Suspense } from 'react'
import './index.css'

// Lazy load the main App component
const App = lazy(() => import('./App.tsx'))

createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
    <App />
  </Suspense>
);
