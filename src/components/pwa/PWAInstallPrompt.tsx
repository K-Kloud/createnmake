import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Smartphone, X, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(installEvent);
      setIsInstallable(true);
      setShowPrompt(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      toast({
        title: 'App Installed Successfully!',
        description: 'You can now use the app offline and access it from your home screen.',
      });
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleInstall = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        toast({
          title: 'Installing App...',
          description: 'The app is being installed on your device.',
        });
      }

      setInstallPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error during PWA installation:', error);
      toast({
        title: 'Installation Failed',
        description: 'There was an error installing the app. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    // Don't show again for 24 hours
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Check if prompt was recently dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        setShowPrompt(false);
      }
    }
  }, []);

  // Don't show if already installed or not installable
  if (isInstalled || !isInstallable || !showPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center gap-2">
          {/* Connection Status Indicator */}
          <div className={`p-2 rounded-full ${isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
          </div>
          
          {isInstalled && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              App Installed
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Install App
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={dismissPrompt}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Install our app for a better experience with:
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Offline access to your designs</li>
              <li>• Faster loading times</li>
              <li>• Push notifications</li>
              <li>• Home screen access</li>
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleInstall}
              className="flex-1 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Install
            </Button>
            <Button
              variant="outline"
              onClick={dismissPrompt}
              size="sm"
            >
              Maybe Later
            </Button>
          </div>

          {!isOnline && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-md">
              <WifiOff className="h-4 w-4 text-yellow-600" />
              <span className="text-xs text-yellow-700">
                You're offline. Install to access your content anytime!
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};