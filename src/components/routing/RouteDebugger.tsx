import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDynamicPages } from '@/hooks/useDynamicPages';

export const RouteDebugger = () => {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { pages, isLoading: pagesLoading } = useDynamicPages();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-background border border-border rounded-lg p-4 text-sm max-w-sm z-50 shadow-lg">
      <h3 className="font-semibold mb-2 text-foreground">Route Debug</h3>
      <div className="space-y-1 text-muted-foreground">
        <p><strong>Path:</strong> {location.pathname}</p>
        <p><strong>Auth:</strong> {authLoading ? 'Loading...' : user ? 'Logged in' : 'Not logged in'}</p>
        <p><strong>Dynamic Pages:</strong> {pagesLoading ? 'Loading...' : `${pages?.length || 0} pages`}</p>
        {pages?.find(p => p.route_path === location.pathname) && (
          <p><strong>Dynamic Route:</strong> Found</p>
        )}
      </div>
    </div>
  );
};