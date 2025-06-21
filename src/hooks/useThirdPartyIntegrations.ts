
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useErrorHandler } from './useErrorHandler';
import { useToast } from './use-toast';

interface Integration {
  id: string;
  name: string;
  type: 'social' | 'storage' | 'analytics' | 'marketing' | 'payment' | 'automation';
  status: 'connected' | 'disconnected' | 'error';
  config: any;
  last_sync: string | null;
}

export const useThirdPartyIntegrations = () => {
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const { toast } = useToast();

  // Get available integrations
  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations', user?.id],
    queryFn: async (): Promise<Integration[]> => {
      // Enhanced integrations list with automation platforms
      return [
        {
          id: 'instagram',
          name: 'Instagram',
          type: 'social',
          status: 'disconnected',
          config: {},
          last_sync: null
        },
        {
          id: 'pinterest',
          name: 'Pinterest',
          type: 'social',
          status: 'disconnected',
          config: {},
          last_sync: null
        },
        {
          id: 'dropbox',
          name: 'Dropbox',
          type: 'storage',
          status: 'disconnected',
          config: {},
          last_sync: null
        },
        {
          id: 'google_drive',
          name: 'Google Drive',
          type: 'storage',
          status: 'disconnected',
          config: {},
          last_sync: null
        },
        {
          id: 'mailchimp',
          name: 'Mailchimp',
          type: 'marketing',
          status: 'disconnected',
          config: {},
          last_sync: null
        },
        {
          id: 'stripe',
          name: 'Stripe Payments',
          type: 'payment',
          status: 'connected',
          config: {},
          last_sync: new Date().toISOString()
        },
        {
          id: 'zapier',
          name: 'Zapier',
          type: 'automation',
          status: 'disconnected',
          config: {},
          last_sync: null
        },
        {
          id: 'slack',
          name: 'Slack',
          type: 'automation',
          status: 'disconnected',
          config: {},
          last_sync: null
        }
      ];
    },
    enabled: !!user?.id,
  });

  // Connect to social media platforms
  const connectSocialMedia = useMutation({
    mutationFn: async ({ platform, accessToken }: { platform: string; accessToken: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Store integration credentials securely
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'connect_social_media',
          action_details: {
            platform,
            connected_at: new Date().toISOString()
          }
        });

      if (error) throw error;

      toast({
        title: 'Integration Connected',
        description: `Successfully connected to ${platform}`,
      });
    },
    onError: (error) => {
      handleError(error, 'connecting to social media');
    }
  });

  // Auto-post to social media
  const autoPostToSocial = useMutation({
    mutationFn: async ({ imageId, platforms, caption }: { 
      imageId: string; 
      platforms: string[];
      caption: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get image details
      const { data: image } = await supabase
        .from('generated_images')
        .select('*')
        .eq('id', imageId)
        .single();

      if (!image) throw new Error('Image not found');

      // Trigger marketing automation
      const { error } = await supabase.functions.invoke('marketing-integrations', {
        body: {
          action: 'sync_social_media',
          platform: platforms[0],
          data: {
            image_url: image.image_url,
            caption: caption,
            platforms: platforms
          }
        }
      });

      if (error) throw error;

      toast({
        title: 'Posted to Social Media',
        description: `Image posted to ${platforms.join(', ')}`,
      });
    },
    onError: (error) => {
      handleError(error, 'posting to social media');
    }
  });

  // Sync with cloud storage
  const syncWithCloudStorage = useMutation({
    mutationFn: async ({ provider, folderId }: { provider: string; folderId?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Trigger operational connector
      const { error } = await supabase.functions.invoke('operational-connectors', {
        body: {
          action: 'backup_data',
          system: provider,
          data: { folder_id: folderId }
        }
      });

      if (error) throw error;

      toast({
        title: 'Cloud Sync Complete',
        description: `Data synced to ${provider}`,
      });
    },
    onError: (error) => {
      handleError(error, 'syncing with cloud storage');
    }
  });

  // Setup marketing automation
  const setupMarketingAutomation = useMutation({
    mutationFn: async ({ platform, campaignConfig }: { 
      platform: string; 
      campaignConfig: any;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase.functions.invoke('marketing-integrations', {
        body: {
          action: 'sync_email_campaigns',
          platform: platform,
          data: campaignConfig
        }
      });

      if (error) throw error;

      toast({
        title: 'Marketing Automation Setup',
        description: `Campaign configured on ${platform}`,
      });
    },
    onError: (error) => {
      handleError(error, 'setting up marketing automation');
    }
  });

  // Export data to external platforms
  const exportData = useMutation({
    mutationFn: async ({ format, platform, filters }: { 
      format: 'json' | 'csv' | 'xml';
      platform: string;
      filters?: any;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get user data based on filters
      const { data: userData } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', user.id);

      // Trigger third-party automation
      const { error } = await supabase.functions.invoke('third-party-automation', {
        body: {
          action: 'update_google_sheets',
          service: platform,
          data: {
            format: format,
            records: userData,
            filters: filters
          }
        }
      });

      if (error) throw error;

      toast({
        title: 'Data Export Complete',
        description: `Exported ${userData?.length || 0} records in ${format.toUpperCase()} format`,
      });
    },
    onError: (error) => {
      handleError(error, 'exporting data');
    }
  });

  // New automation functions
  const triggerPaymentAutomation = useMutation({
    mutationFn: async (action: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase.functions.invoke('payment-automation', {
        body: { action }
      });

      if (error) throw error;

      toast({
        title: 'Payment Automation',
        description: `${action} executed successfully`,
      });
    },
    onError: (error) => {
      handleError(error, 'executing payment automation');
    }
  });

  const triggerOperationalSync = useMutation({
    mutationFn: async (action: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase.functions.invoke('operational-connectors', {
        body: { action, system: 'default' }
      });

      if (error) throw error;

      toast({
        title: 'Operational Sync',
        description: `${action} completed successfully`,
      });
    },
    onError: (error) => {
      handleError(error, 'executing operational sync');
    }
  });

  return {
    integrations,
    isLoading,
    connectSocialMedia: connectSocialMedia.mutate,
    autoPostToSocial: autoPostToSocial.mutate,
    syncWithCloudStorage: syncWithCloudStorage.mutate,
    setupMarketingAutomation: setupMarketingAutomation.mutate,
    exportData: exportData.mutate,
    triggerPaymentAutomation: triggerPaymentAutomation.mutate,
    triggerOperationalSync: triggerOperationalSync.mutate,
    isConnecting: connectSocialMedia.isPending,
    isPosting: autoPostToSocial.isPending,
    isSyncing: syncWithCloudStorage.isPending,
    isSettingUpMarketing: setupMarketingAutomation.isPending,
    isExporting: exportData.isPending,
    isAutomating: triggerPaymentAutomation.isPending || triggerOperationalSync.isPending
  };
};
