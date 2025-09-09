import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

interface OfflineSupportProps {
  className?: string;
}

export const OfflineSupport: React.FC<OfflineSupportProps> = ({
  className = ''
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setRetryCount(0);
      toast({
        title: "Back Online",
        description: "Connection restored. You can now generate images.",
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        variant: "destructive",
        title: "Connection Lost",
        description: "Image generation is not available offline.",
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const checkConnection = async () => {
    setRetryCount(prev => prev + 1);
    
    try {
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        setIsOnline(true);
        setRetryCount(0);
        toast({
          title: "Connection Restored",
          description: "You're back online!",
        });
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      toast({
        variant: "destructive",
        title: "Still Offline",
        description: "Unable to restore connection. Please check your internet.",
      });
    }
  };

  if (isOnline) {
    return (
      <div className={`flex items-center gap-2 text-xs text-green-600 dark:text-green-400 ${className}`}>
        <Wifi className="h-3 w-3" />
        <span>Connected</span>
      </div>
    );
  }

  return (
    <Card className={`border-destructive/50 bg-destructive/10 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
          <WifiOff className="h-4 w-4" />
          No Internet Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            Image generation requires an active internet connection. Please check your network and try again.
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkConnection}
            className="gap-1"
            disabled={retryCount >= 3}
          >
            <RefreshCw className="h-3 w-3" />
            Retry Connection
          </Button>
          
          {retryCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              Attempt {retryCount}/3
            </Badge>
          )}
        </div>
        
        {retryCount >= 3 && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
            Multiple connection attempts failed. Please check your internet connection and refresh the page.
          </div>
        )}
      </CardContent>
    </Card>
  );
};