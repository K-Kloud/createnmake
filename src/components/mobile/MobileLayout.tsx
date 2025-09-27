import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Home, Search, Heart, User, Menu, Bell, Settings, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';

interface MobileLayoutProps {
  children: React.ReactNode;
  currentTab?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, currentTab = 'home' }) => {
  const { toast } = useToast();
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [networkStatus, setNetworkStatus] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const getDeviceInfo = async () => {
      try {
        const info = await Device.getInfo();
        setDeviceInfo(info);
      } catch (error) {
        console.log('Device info not available in web context');
      }
    };

    const getNetworkStatus = async () => {
      try {
        const status = await Network.getStatus();
        setNetworkStatus(status);
        setIsOnline(status.connected);
      } catch (error) {
        console.log('Network status not available in web context');
      }
    };

    getDeviceInfo();
    getNetworkStatus();

    // Listen for network changes
    const setupNetworkListener = async () => {
      const networkListener = await Network.addListener('networkStatusChange', (status) => {
        setNetworkStatus(status);
        setIsOnline(status.connected);
        
        if (!status.connected) {
          toast({
            title: "Offline Mode",
            description: "App is now working offline. Changes will sync when connection is restored.",
          });
        } else {
          toast({
            title: "Back Online",
            description: "Connection restored. Syncing data...",
          });
        }
      });
      
      return networkListener;
    };

    let networkListener: any;
    setupNetworkListener().then(listener => {
      networkListener = listener;
    });

    return () => {
      if (networkListener) {
        networkListener.remove();
      }
    };
  }, [toast]);

  const navigationTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">OpenTek</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Network Status Indicator */}
            <div className="flex items-center gap-1">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-success" />
              ) : (
                <WifiOff className="h-4 w-4 text-destructive" />
              )}
            </div>
            
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Device Info Bar (Development) */}
      {deviceInfo && (
        <div className="bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>
              {deviceInfo.platform} {deviceInfo.osVersion} - {deviceInfo.model}
            </span>
            <Badge variant="outline" className="text-xs">
              <Smartphone className="h-3 w-3 mr-1" />
              {deviceInfo.platform}
            </Badge>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="grid grid-cols-4 h-16">
          {navigationTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant="ghost"
                className={`h-full rounded-none flex flex-col gap-1 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Offline Notification */}
      {!isOnline && (
        <div className="fixed bottom-20 left-4 right-4 z-60">
          <Card className="border-warning bg-warning/10">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Offline Mode</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Some features may be limited. Data will sync when online.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};