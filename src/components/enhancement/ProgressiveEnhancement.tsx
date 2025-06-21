
import React, { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, Download, Smartphone, Monitor, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Network status detection
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Detect connection type if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.effectiveType || 'unknown');
      
      const updateConnection = () => {
        setConnectionType(connection.effectiveType || 'unknown');
      };
      
      connection.addEventListener('change', updateConnection);
      
      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
        connection.removeEventListener('change', updateConnection);
      };
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return { isOnline, connectionType };
};

// Device detection
export const useDeviceDetection = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isTouch, setIsTouch] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      setIsTouch('ontouchstart' in window);
      
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  return { deviceType, isTouch, screenSize };
};

// Progressive Web App install prompt
export const PWAInstallPrompt: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    const result = await installPrompt.prompt();
    if (result.outcome === 'accepted') {
      toast({
        title: "App installed!",
        description: "The app has been added to your home screen",
      });
    }
    
    setInstallPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) return null;

  return (
    <Card className="border-primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Download className="h-4 w-4" />
          Install App
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          Install this app for a better experience with offline support and faster loading.
        </p>
        <Button onClick={handleInstall} size="sm">
          <Download className="h-4 w-4 mr-2" />
          Install
        </Button>
      </CardContent>
    </Card>
  );
};

// Adaptive loading based on connection
export const AdaptiveLoader: React.FC<{
  children: React.ReactNode;
  lowBandwidthFallback?: React.ReactNode;
}> = ({ children, lowBandwidthFallback }) => {
  const { connectionType } = useNetworkStatus();
  const [shouldShowLowBandwidth, setShouldShowLowBandwidth] = useState(false);

  useEffect(() => {
    // Show low bandwidth version for slow connections
    setShouldShowLowBandwidth(['slow-2g', '2g'].includes(connectionType));
  }, [connectionType]);

  if (shouldShowLowBandwidth && lowBandwidthFallback) {
    return <>{lowBandwidthFallback}</>;
  }

  return <>{children}</>;
};

// Network status indicator
export const NetworkStatusIndicator: React.FC = () => {
  const { isOnline, connectionType } = useNetworkStatus();

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <Wifi className="h-4 w-4 text-green-500" />
      ) : (
        <WifiOff className="h-4 w-4 text-red-500" />
      )}
      <Badge variant={isOnline ? 'default' : 'destructive'}>
        {isOnline ? connectionType : 'Offline'}
      </Badge>
    </div>
  );
};

// Device-adaptive UI
export const DeviceAdaptiveLayout: React.FC<{
  children: React.ReactNode;
  mobileLayout?: React.ReactNode;
  tabletLayout?: React.ReactNode;
}> = ({ children, mobileLayout, tabletLayout }) => {
  const { deviceType } = useDeviceDetection();

  switch (deviceType) {
    case 'mobile':
      return <>{mobileLayout || children}</>;
    case 'tablet':
      return <>{tabletLayout || children}</>;
    default:
      return <>{children}</>;
  }
};

// Enhanced status panel
export const EnhancementStatusPanel: React.FC = () => {
  const { isOnline, connectionType } = useNetworkStatus();
  const { deviceType, isTouch, screenSize } = useDeviceDetection();

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Network</span>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? connectionType : 'Offline'}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Device</span>
          <div className="flex items-center gap-2">
            {getDeviceIcon()}
            <Badge variant="outline">
              {deviceType} {isTouch && '(Touch)'}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Screen</span>
          <Badge variant="outline">
            {screenSize.width}×{screenSize.height}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
