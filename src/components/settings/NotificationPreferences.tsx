
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  key: string;
  enabled: boolean;
}

export const NotificationPreferences = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // These would ideally be fetched from the user's settings in the database
  const [emailSettings, setEmailSettings] = useState<NotificationSetting[]>([
    {
      id: 'security-alerts',
      title: 'Security Alerts',
      description: 'Get notified about sign-in attempts, password changes, etc.',
      key: 'security_alerts_email',
      enabled: true,
    },
    {
      id: 'account-activity',
      title: 'Account Activity',
      description: 'Get notified about important account updates.',
      key: 'account_activity_email',
      enabled: true,
    },
    {
      id: 'new-features',
      title: 'New Features',
      description: 'Learn about new features and improvements.',
      key: 'new_features_email',
      enabled: false,
    },
    {
      id: 'marketing',
      title: 'Marketing',
      description: 'Receive promotional content and special offers.',
      key: 'marketing_email',
      enabled: false,
    },
  ]);
  
  const [pushSettings, setPushSettings] = useState<NotificationSetting[]>([
    {
      id: 'security-alerts-push',
      title: 'Security Alerts',
      description: 'Get pushed about sign-in attempts, password changes, etc.',
      key: 'security_alerts_push',
      enabled: true,
    },
    {
      id: 'account-activity-push',
      title: 'Account Activity',
      description: 'Get pushed about important account updates.',
      key: 'account_activity_push',
      enabled: true,
    },
    {
      id: 'new-features-push',
      title: 'New Features',
      description: 'Learn about new features and improvements.',
      key: 'new_features_push',
      enabled: true,
    },
    {
      id: 'marketing-push',
      title: 'Marketing',
      description: 'Receive promotional content and special offers.',
      key: 'marketing_push',
      enabled: false,
    },
  ]);
  
  const handleToggleEmailSetting = (id: string) => {
    setEmailSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };
  
  const handleTogglePushSetting = (id: string) => {
    setPushSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };
  
  const saveNotificationSettings = async () => {
    if (!user) return;
    
    try {
      // Convert settings to flat object for storage
      const emailPrefs = emailSettings.reduce((acc, setting) => {
        acc[setting.key] = setting.enabled;
        return acc;
      }, {} as Record<string, boolean>);
      
      const pushPrefs = pushSettings.reduce((acc, setting) => {
        acc[setting.key] = setting.enabled;
        return acc;
      }, {} as Record<string, boolean>);
      
      // This would save to your user_preferences table in the database
      // For now, we'll just show a toast
      
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated."
      });
      
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: "There was a problem saving your notification preferences."
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how and when you'd like to be notified
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email">
          <TabsList className="mb-4">
            <TabsTrigger value="email">Email Notifications</TabsTrigger>
            <TabsTrigger value="push">Push Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <div className="space-y-4">
              {emailSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={setting.id} className="font-medium">{setting.title}</Label>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <Switch
                    id={setting.id}
                    checked={setting.enabled}
                    onCheckedChange={() => handleToggleEmailSetting(setting.id)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="push">
            <div className="space-y-4">
              {pushSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={setting.id} className="font-medium">{setting.title}</Label>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <Switch
                    id={setting.id}
                    checked={setting.enabled}
                    onCheckedChange={() => handleTogglePushSetting(setting.id)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <Button onClick={saveNotificationSettings}>Save preferences</Button>
        </div>
      </CardContent>
    </Card>
  );
};
