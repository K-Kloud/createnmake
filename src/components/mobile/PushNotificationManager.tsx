import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Bell, BellOff, Settings, Smartphone, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { PushNotifications } from '@capacitor/push-notifications';

interface NotificationSettings {
  enabled: boolean;
  newOrders: boolean;
  promotions: boolean;
  productUpdates: boolean;
  systemAlerts: boolean;
}

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: 'order' | 'promotion' | 'update' | 'system';
}

export const PushNotificationManager: React.FC = () => {
  const { toast } = useToast();
  const [permissionStatus, setPermissionStatus] = useState<string>('prompt');
  const [registrationToken, setRegistrationToken] = useState<string>('');
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    newOrders: true,
    promotions: true,
    productUpdates: true,
    systemAlerts: true
  });
  const [notifications, setNotifications] = useState<NotificationHistory[]>([
    {
      id: '1',
      title: 'Order Shipped',
      body: 'Your order #12345 has been shipped and is on its way!',
      timestamp: '2024-01-15T10:30:00Z',
      read: false,
      type: 'order'
    },
    {
      id: '2',
      title: 'New Collection Available',
      body: 'Check out our latest winter collection with 20% off!',
      timestamp: '2024-01-14T15:45:00Z',
      read: true,
      type: 'promotion'
    },
    {
      id: '3',
      title: 'App Updated',
      body: 'New features and improvements are now available.',
      timestamp: '2024-01-13T09:15:00Z',
      read: true,
      type: 'update'
    }
  ]);

  useEffect(() => {
    initializePushNotifications();
    loadSettings();
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Check current permission status
      const permResult = await PushNotifications.checkPermissions();
      setPermissionStatus(permResult.receive);

      if (permResult.receive === 'granted') {
        await registerForPushNotifications();
      }

      // Add listeners
      PushNotifications.addListener('registration', (token) => {
        setRegistrationToken(token.value);
        toast({
          title: "Registration Successful",
          description: "Device registered for push notifications.",
        });
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Registration error:', error);
        toast({
          title: "Registration Failed",
          description: "Failed to register for push notifications.",
          variant: "destructive",
        });
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        const newNotification: NotificationHistory = {
          id: Date.now().toString(),
          title: notification.title || '',
          body: notification.body || '',
          timestamp: new Date().toISOString(),
          read: false,
          type: 'system'
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        
        toast({
          title: notification.title,
          description: notification.body,
        });
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
        // Handle notification tap
        markAsRead(notification.notification.data?.id);
      });

    } catch (error) {
      console.log('Push notifications not available in web context');
    }
  };

  const registerForPushNotifications = async () => {
    try {
      await PushNotifications.register();
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
    }
  };

  const requestPermission = async () => {
    try {
      const permResult = await PushNotifications.requestPermissions();
      setPermissionStatus(permResult.receive);
      
      if (permResult.receive === 'granted') {
        await registerForPushNotifications();
        setSettings(prev => ({ ...prev, enabled: true }));
        toast({
          title: "Permissions Granted",
          description: "You'll now receive push notifications.",
        });
      } else {
        toast({
          title: "Permissions Denied",
          description: "Push notifications have been disabled.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Permission Error",
        description: "Failed to request notification permissions.",
        variant: "destructive",
      });
    }
  };

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem('notification_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const saveSettings = (newSettings: NotificationSettings) => {
    try {
      localStorage.setItem('notification_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
      
      toast({
        title: "Settings Saved",
        description: "Notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save notification settings.",
        variant: "destructive",
      });
    }
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: "Notifications Cleared",
      description: "All notifications have been removed.",
    });
  };

  const sendTestNotification = async () => {
    const testNotification: NotificationHistory = {
      id: Date.now().toString(),
      title: 'Test Notification',
      body: 'This is a test notification to verify everything is working!',
      timestamp: new Date().toISOString(),
      read: false,
      type: 'system'
    };
    
    setNotifications(prev => [testNotification, ...prev]);
    
    toast({
      title: "Test Notification",
      description: "This is a test notification to verify everything is working!",
    });
  };

  const getStatusIcon = () => {
    switch (permissionStatus) {
      case 'granted':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'denied':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'promotion':
        return '🎉';
      case 'update':
        return '⚡';
      default:
        return '🔔';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Push Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        <Button variant="outline" onClick={sendTestNotification}>
          <Bell className="h-4 w-4 mr-2" />
          Test
        </Button>
      </div>

      {/* Permission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Permission Status
          </CardTitle>
          <CardDescription>
            Current notification permission status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium capitalize">{permissionStatus}</p>
              <p className="text-sm text-muted-foreground">
                {permissionStatus === 'granted' 
                  ? 'Notifications are enabled and working'
                  : permissionStatus === 'denied'
                  ? 'Notifications are blocked'
                  : 'Permission not yet requested'
                }
              </p>
            </div>
            {permissionStatus !== 'granted' && (
              <Button onClick={requestPermission}>
                <Smartphone className="h-4 w-4 mr-2" />
                Enable
              </Button>
            )}
          </div>
          
          {registrationToken && (
            <div>
              <p className="text-sm font-medium">Registration Token</p>
              <p className="text-xs text-muted-foreground font-mono break-all">
                {registrationToken.substring(0, 50)}...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Customize which notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Notifications</p>
              <p className="text-sm text-muted-foreground">
                Master switch for all push notifications
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={() => toggleSetting('enabled')}
            />
          </div>

          {settings.enabled && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Orders</p>
                  <p className="text-sm text-muted-foreground">
                    Order confirmations and shipping updates
                  </p>
                </div>
                <Switch
                  checked={settings.newOrders}
                  onCheckedChange={() => toggleSetting('newOrders')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Promotions</p>
                  <p className="text-sm text-muted-foreground">
                    Sales, discounts, and special offers
                  </p>
                </div>
                <Switch
                  checked={settings.promotions}
                  onCheckedChange={() => toggleSetting('promotions')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Product Updates</p>
                  <p className="text-sm text-muted-foreground">
                    New products and collection launches
                  </p>
                </div>
                <Switch
                  checked={settings.productUpdates}
                  onCheckedChange={() => toggleSetting('productUpdates')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">System Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    App updates and important announcements
                  </p>
                </div>
                <Switch
                  checked={settings.systemAlerts}
                  onCheckedChange={() => toggleSetting('systemAlerts')}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                Your notification history
              </CardDescription>
            </div>
            {notifications.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    !notification.read ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-lg">{getTypeIcon(notification.type)}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.body}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 bg-primary rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};