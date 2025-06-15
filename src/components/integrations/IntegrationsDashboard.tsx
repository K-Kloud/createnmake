
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useThirdPartyIntegrations } from '@/hooks/useThirdPartyIntegrations';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { LoadingState } from '@/components/ui/loading-state';
import { 
  Instagram, 
  Dropbox, 
  Mail, 
  Bell, 
  Cloud, 
  Share2,
  Settings 
} from 'lucide-react';

const integrationIcons = {
  instagram: Instagram,
  pinterest: Share2,
  dropbox: Dropbox,
  google_drive: Cloud,
  mailchimp: Mail
};

export const IntegrationsDashboard: React.FC = () => {
  const { 
    integrations, 
    isLoading,
    connectSocialMedia,
    autoPostToSocial,
    syncWithCloudStorage,
    isConnecting,
    isPosting,
    isSyncing
  } = useThirdPartyIntegrations();

  const {
    isSupported: pushSupported,
    isSubscribed: pushSubscribed,
    requestPermission: enablePush,
    unsubscribe: disablePush
  } = usePushNotifications();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Integrations</h2>
        <p className="text-muted-foreground">Connect your favorite platforms and automate your workflow</p>
      </div>

      {/* Push Notifications */}
      {pushSupported && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Push Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Browser Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get notified about new orders, messages, and updates
                </p>
              </div>
              <Switch
                checked={pushSubscribed}
                onCheckedChange={(checked) => {
                  if (checked) {
                    enablePush();
                  } else {
                    disablePush();
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Third-party Integrations */}
      <LoadingState
        isLoading={isLoading}
        error={null}
        loadingMessage="Loading integrations..."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations?.map((integration) => {
            const IconComponent = integrationIcons[integration.id as keyof typeof integrationIcons] || Settings;
            
            return (
              <Card key={integration.id} className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5" />
                      {integration.name}
                    </div>
                    <Badge 
                      variant={integration.status === 'connected' ? 'default' : 'secondary'}
                    >
                      {integration.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {integration.type === 'social' && 'Share your creations automatically'}
                    {integration.type === 'storage' && 'Backup your images to the cloud'}
                    {integration.type === 'marketing' && 'Automate your marketing campaigns'}
                    {integration.type === 'analytics' && 'Track your performance metrics'}
                  </p>
                  
                  <div className="flex gap-2">
                    {integration.status === 'disconnected' ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          if (integration.type === 'social') {
                            connectSocialMedia({ platform: integration.id, accessToken: 'mock-token' });
                          } else if (integration.type === 'storage') {
                            syncWithCloudStorage({ provider: integration.id });
                          }
                        }}
                        disabled={isConnecting || isSyncing}
                      >
                        Connect
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" variant="outline">
                          Configure
                        </Button>
                        {integration.type === 'social' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              autoPostToSocial({
                                imageId: '1',
                                platforms: [integration.id],
                                caption: 'Check out my latest creation!'
                              });
                            }}
                            disabled={isPosting}
                          >
                            Test Post
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {integration.last_sync && (
                    <p className="text-xs text-muted-foreground">
                      Last sync: {new Date(integration.last_sync).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </LoadingState>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => {
                autoPostToSocial({
                  imageId: '1',
                  platforms: ['instagram', 'pinterest'],
                  caption: 'New design available!'
                });
              }}
              disabled={isPosting}
            >
              <Share2 className="h-5 w-5" />
              Share Latest
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => {
                syncWithCloudStorage({ provider: 'dropbox' });
              }}
              disabled={isSyncing}
            >
              <Cloud className="h-5 w-5" />
              Backup Images
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <Mail className="h-5 w-5" />
              Send Newsletter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
