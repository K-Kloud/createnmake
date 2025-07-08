import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RealtimeSystemMonitor } from './RealtimeSystemMonitor';
import { CollaborativeWorkspaceManager } from './CollaborativeWorkspaceManager';
import { EnhancedPresenceIndicator } from './EnhancedPresenceIndicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEnhancedRealtimeFeatures } from '@/hooks/useEnhancedRealtimeFeatures';
import { useAuth } from '@/hooks/useAuth';
import { 
  Monitor, 
  Users, 
  FileText, 
  Activity,
  Bell,
  Zap,
  Globe,
  Wifi
} from 'lucide-react';

export const EnhancedRealtimeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    connectionStatus, 
    activeChannels, 
    trackRealtimeAnalyticsEvent,
    sendPriorityNotification 
  } = useEnhancedRealtimeFeatures();

  // Track dashboard view
  React.useEffect(() => {
    if (user) {
      trackRealtimeAnalyticsEvent.mutate({
        eventName: 'realtime_dashboard_viewed',
        eventCategory: 'user_action',
        eventData: {
          userId: user.id,
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [user]);

  const connectionStatusColor = {
    connected: 'text-green-600',
    connecting: 'text-yellow-600',
    disconnected: 'text-red-600'
  }[connectionStatus];

  const connectionStatusIcon = {
    connected: <Wifi className="h-4 w-4" />,
    connecting: <Activity className="h-4 w-4 animate-pulse" />,
    disconnected: <Globe className="h-4 w-4" />
  }[connectionStatus];

  const testPriorityNotification = () => {
    if (user) {
      sendPriorityNotification.mutate({
        userId: user.id,
        type: 'test',
        priority: 1,
        title: 'Test High Priority Notification',
        message: 'This is a test notification with high priority',
        payload: { test: true }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Enhanced Real-time Dashboard
          </h1>
          <p className="text-muted-foreground">
            Advanced real-time collaboration, monitoring, and analytics
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${connectionStatusColor}`}>
            {connectionStatusIcon}
            <span className="text-sm font-medium capitalize">{connectionStatus}</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Active channels: {activeChannels.size}
          </div>
          
          <button
            onClick={testPriorityNotification}
            className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Test Notification
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Active Sessions</p>
                <p className="text-2xl font-bold">{activeChannels.size}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Monitor className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">System Status</p>
                <p className="text-2xl font-bold capitalize">{connectionStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Documents</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Bell className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-2xl font-bold">Live</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main dashboard tabs */}
      <Tabs defaultValue="collaboration" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="collaboration" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Collaboration
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            System Monitor
          </TabsTrigger>
          <TabsTrigger value="presence" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            User Presence
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Real-time Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collaboration" className="space-y-6">
          <CollaborativeWorkspaceManager />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <RealtimeSystemMonitor />
        </TabsContent>

        <TabsContent value="presence" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                User Presence Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Active Channels</h3>
                  {Array.from(activeChannels).length > 0 ? (
                    <div className="space-y-3">
                      {Array.from(activeChannels).map((channelName) => (
                        <div key={channelName} className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{channelName}</h4>
                          </div>
                          <EnhancedPresenceIndicator 
                            channelName={channelName}
                            maxVisible={8}
                            showDeviceInfo={true}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Active Channels</h3>
                      <p className="text-muted-foreground">
                        Join a collaborative session to see user presence.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Real-time Analytics Stream
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  Real-time analytics events and performance metrics will be displayed here.
                </p>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg text-left">
                  <h4 className="font-medium mb-2">Available Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Real-time event tracking</li>
                    <li>• User interaction analytics</li>
                    <li>• Performance monitoring</li>
                    <li>• Custom event streaming</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};