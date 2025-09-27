import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Cloud, CloudOff, Download, Upload, RefreshCw, Database, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';

interface OfflineData {
  id: string;
  type: 'image' | 'profile' | 'order' | 'favorite';
  data: any;
  timestamp: string;
  synced: boolean;
  action: 'create' | 'update' | 'delete';
}

interface SyncStatus {
  total: number;
  synced: number;
  failed: number;
  inProgress: boolean;
}

export const OfflineManager: React.FC = () => {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    total: 0,
    synced: 0,
    failed: 0,
    inProgress: false
  });
  const [cacheSize, setCacheSize] = useState('0 MB');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Connection restored. Starting sync...",
      });
      handleSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "App is now working offline.",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline data from localStorage
    loadOfflineData();
    calculateCacheSize();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = () => {
    try {
      const stored = localStorage.getItem('offline_data');
      if (stored) {
        const data = JSON.parse(stored);
        setOfflineData(data);
        setSyncStatus(prev => ({
          ...prev,
          total: data.length,
          synced: data.filter((item: OfflineData) => item.synced).length,
          failed: data.filter((item: OfflineData) => !item.synced).length
        }));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const calculateCacheSize = () => {
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }
      setCacheSize(`${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
    }
  };

  const storeOfflineData = (data: OfflineData) => {
    try {
      const existing = JSON.parse(localStorage.getItem('offline_data') || '[]');
      const updated = [...existing, data];
      localStorage.setItem('offline_data', JSON.stringify(updated));
      setOfflineData(updated);
      
      toast({
        title: "Data Saved Offline",
        description: "Your changes have been saved locally and will sync when online.",
      });
    } catch (error) {
      console.error('Failed to store offline data:', error);
      toast({
        title: "Storage Error",
        description: "Failed to save data offline. Storage may be full.",
        variant: "destructive",
      });
    }
  };

  const handleSync = async () => {
    if (!isOnline || syncStatus.inProgress) return;

    setSyncStatus(prev => ({ ...prev, inProgress: true }));

    try {
      const unsyncedData = offlineData.filter(item => !item.synced);
      let syncedCount = 0;
      let failedCount = 0;

      for (const item of unsyncedData) {
        try {
          // Simulate API sync
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mark as synced
          item.synced = true;
          syncedCount++;
          
          setSyncStatus(prev => ({
            ...prev,
            synced: prev.synced + 1
          }));
        } catch (error) {
          failedCount++;
          console.error('Failed to sync item:', item.id, error);
        }
      }

      // Update localStorage
      localStorage.setItem('offline_data', JSON.stringify(offlineData));

      toast({
        title: "Sync Complete",
        description: `${syncedCount} items synced successfully. ${failedCount} failed.`,
      });

    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync offline data.",
        variant: "destructive",
      });
    } finally {
      setSyncStatus(prev => ({ ...prev, inProgress: false }));
    }
  };

  const clearOfflineData = () => {
    try {
      localStorage.removeItem('offline_data');
      setOfflineData([]);
      setSyncStatus({ total: 0, synced: 0, failed: 0, inProgress: false });
      calculateCacheSize();
      
      toast({
        title: "Cache Cleared",
        description: "All offline data has been cleared.",
      });
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "Failed to clear offline data.",
        variant: "destructive",
      });
    }
  };

  const downloadForOffline = async (type: 'favorites' | 'recent' | 'all') => {
    try {
      toast({
        title: "Downloading",
        description: `Downloading ${type} data for offline use...`,
      });

      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast({
        title: "Download Complete",
        description: `${type} data is now available offline.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download data for offline use.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Cloud className="h-6 w-6 text-success" />
          ) : (
            <CloudOff className="h-6 w-6 text-warning" />
          )}
          <h2 className="text-2xl font-bold">Offline Manager</h2>
        </div>
        <Badge variant={isOnline ? 'default' : 'secondary'}>
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <AlertCircle className="h-5 w-5 text-warning" />
            )}
            Connection Status
          </CardTitle>
          <CardDescription>
            {isOnline 
              ? "You're connected to the internet. All features are available."
              : "You're offline. Some features may be limited, but you can still use the app."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
              ) : (
                <div className="h-2 w-2 bg-warning rounded-full" />
              )}
              <span className="text-sm">
                {isOnline ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {isOnline && (
              <Button 
                size="sm" 
                onClick={handleSync}
                disabled={syncStatus.inProgress}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus.inProgress ? 'animate-spin' : ''}`} />
                Sync Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Status */}
      {(syncStatus.total > 0 || syncStatus.inProgress) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Sync Status
            </CardTitle>
            <CardDescription>
              Progress of syncing offline changes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{syncStatus.synced}/{syncStatus.total}</span>
              </div>
              <Progress value={(syncStatus.synced / syncStatus.total) * 100} />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="font-medium">{syncStatus.total}</p>
                <p className="text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-success">{syncStatus.synced}</p>
                <p className="text-muted-foreground">Synced</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-destructive">{syncStatus.failed}</p>
                <p className="text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offline Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Offline Data
          </CardTitle>
          <CardDescription>
            Manage data stored for offline use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Cache Size</p>
              <p className="text-xs text-muted-foreground">{cacheSize} used</p>
            </div>
            <Button variant="outline" size="sm" onClick={clearOfflineData}>
              Clear Cache
            </Button>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Download for Offline</p>
            <div className="grid grid-cols-1 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => downloadForOffline('favorites')}
                className="justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Favorites
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => downloadForOffline('recent')}
                className="justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Recent Items
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => downloadForOffline('all')}
                className="justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Download All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offline Data List */}
      {offlineData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Changes</CardTitle>
            <CardDescription>
              Changes made while offline that need to be synced
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {offlineData.filter(item => !item.synced).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      item.synced ? 'bg-success' : 'bg-warning'
                    }`} />
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {item.action} {item.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={item.synced ? 'default' : 'secondary'}>
                    {item.synced ? 'Synced' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};