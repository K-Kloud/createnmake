
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Zap, 
  Cloud, 
  Mail, 
  CreditCard, 
  Users,
  Activity,
  Workflow,
  ExternalLink
} from 'lucide-react';
import { useThirdPartyIntegrations } from '@/hooks/useThirdPartyIntegrations';
import { LoadingState } from '@/components/ui/loading-state';

export const IntegrationsDashboard: React.FC = () => {
  const {
    integrations,
    isLoading,
    connectSocialMedia,
    syncWithCloudStorage,
    setupMarketingAutomation,
    triggerPaymentAutomation,
    triggerOperationalSync,
    isConnecting,
    isAutomating
  } = useThirdPartyIntegrations();

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'social':
        return <Users className="h-4 w-4" />;
      case 'storage':
        return <Cloud className="h-4 w-4" />;
      case 'marketing':
        return <Mail className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'automation':
        return <Workflow className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="outline">Disconnected</Badge>;
      case 'error':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/30">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const groupedIntegrations = integrations?.reduce((acc, integration) => {
    if (!acc[integration.type]) {
      acc[integration.type] = [];
    }
    acc[integration.type].push(integration);
    return acc;
  }, {} as Record<string, typeof integrations>) || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">Connect and manage your third-party integrations</p>
      </div>

      <LoadingState isLoading={isLoading} error={null}>
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-background/50 backdrop-blur-sm">
            <TabsTrigger value="all">All Integrations</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="storage">Cloud Storage</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="payment">Payments</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {integrations?.map((integration) => (
                <Card key={integration.id} className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center space-x-2">
                      {getIntegrationIcon(integration.type)}
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                    </div>
                    {getStatusBadge(integration.status)}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Type</span>
                      <Badge variant="outline" className="capitalize">{integration.type}</Badge>
                    </div>
                    
                    {integration.last_sync && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Sync</span>
                        <span className="text-sm">{new Date(integration.last_sync).toLocaleDateString()}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {integration.status === 'disconnected' ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={isConnecting}
                          onClick={() => connectSocialMedia({ platform: integration.id, accessToken: 'demo' })}
                        >
                          Connect
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                      )}
                      
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {Object.entries(groupedIntegrations).map(([type, typeIntegrations]) => (
            <TabsContent key={type} value={type} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {typeIntegrations.map((integration) => (
                  <Card key={integration.id} className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <div className="flex items-center space-x-2">
                        {getIntegrationIcon(integration.type)}
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                      </div>
                      {getStatusBadge(integration.status)}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Type-specific actions */}
                      {type === 'storage' && (
                        <Button 
                          size="sm"
                          disabled={isAutomating}
                          onClick={() => syncWithCloudStorage({ provider: integration.id })}
                        >
                          <Cloud className="h-3 w-3 mr-1" />
                          Sync Data
                        </Button>
                      )}
                      
                      {type === 'marketing' && (
                        <Button 
                          size="sm"
                          disabled={isAutomating}
                          onClick={() => setupMarketingAutomation({ platform: integration.id, campaignConfig: {} })}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Setup Campaign
                        </Button>
                      )}
                      
                      {type === 'payment' && (
                        <Button 
                          size="sm"
                          disabled={isAutomating}
                          onClick={() => triggerPaymentAutomation('process_bulk_payments')}
                        >
                          <CreditCard className="h-3 w-3 mr-1" />
                          Process Payments
                        </Button>
                      )}
                      
                      {type === 'automation' && (
                        <Button 
                          size="sm"
                          disabled={isAutomating}
                          onClick={() => triggerOperationalSync('sync_inventory')}
                        >
                          <Workflow className="h-3 w-3 mr-1" />
                          Sync Operations
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </LoadingState>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              disabled={isAutomating}
              onClick={() => triggerPaymentAutomation('reconcile_payments')}
            >
              <Activity className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Reconcile Payments</div>
                <div className="text-xs text-muted-foreground">Sync payment status</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              disabled={isAutomating}
              onClick={() => triggerOperationalSync('sync_analytics')}
            >
              <Activity className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Sync Analytics</div>
                <div className="text-xs text-muted-foreground">Update metrics</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              disabled={isAutomating}
              onClick={() => setupMarketingAutomation({ platform: 'mailchimp', campaignConfig: { type: 'weekly_digest' } })}
            >
              <Mail className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Send Newsletter</div>
                <div className="text-xs text-muted-foreground">Weekly digest</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              disabled={isAutomating}
              onClick={() => triggerOperationalSync('backup_data')}
            >
              <Cloud className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Backup Data</div>
                <div className="text-xs text-muted-foreground">Cloud backup</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
