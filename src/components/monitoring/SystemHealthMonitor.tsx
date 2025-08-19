import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface SystemHealth {
  database: 'healthy' | 'error' | 'unknown';
  auth: 'healthy' | 'error' | 'unknown';
  lastCheck: Date;
}

export const SystemHealthMonitor = () => {
  const [health, setHealth] = useState<SystemHealth>({
    database: 'unknown',
    auth: 'unknown',
    lastCheck: new Date()
  });

  const checkSystemHealth = async () => {
    const results: SystemHealth = {
      database: 'unknown',
      auth: 'unknown',
      lastCheck: new Date()
    };

    // Test database connection
    try {
      await supabase.from('profiles').select('id').limit(1);
      results.database = 'healthy';
    } catch (error) {
      console.error('Database health check failed:', error);
      results.database = 'error';
    }

    // Test auth
    try {
      const { data } = await supabase.auth.getSession();
      results.auth = 'healthy';
    } catch (error) {
      console.error('Auth health check failed:', error);
      results.auth = 'error';
    }

    setHealth(results);
  };

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const hasErrors = health.database === 'error' || health.auth === 'error';

  if (!hasErrors) return null;

  return (
    <Alert variant="destructive" className="fixed top-4 left-4 max-w-md z-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        System health issues detected:
        {health.database === 'error' && <div>• Database connection failed</div>}
        {health.auth === 'error' && <div>• Authentication service error</div>}
        <div className="text-xs text-muted-foreground mt-1">
          Last check: {health.lastCheck.toLocaleTimeString()}
        </div>
      </AlertDescription>
    </Alert>
  );
};