import React from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Settings } from 'lucide-react';

export const EnhancedUserPreferences: React.FC = () => {
  const { user } = useAuth();
  const {
    preferences,
    handlePreferenceChange,
    handlePreferencesSubmit,
    isUpdatingPreferences
  } = useUserSettings(user?.id);

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Preferences</h2>
      </div>

      <form onSubmit={handlePreferencesSubmit}>
        {/* Email Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Choose how you want to be notified via email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-orders">Order Updates</Label>
              <Switch
                id="email-orders"
                checked={preferences.email_orders}
                onCheckedChange={(checked) => handlePreferenceChange('email_orders', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-marketing">Marketing & Promotions</Label>
              <Switch
                id="email-marketing"
                checked={preferences.email_marketing}
                onCheckedChange={(checked) => handlePreferenceChange('email_marketing', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Browser Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Browser Settings
            </CardTitle>
            <CardDescription>
              Configure browser-based notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="browser-notifications">Browser Notifications</Label>
              <Switch
                id="browser-notifications"
                checked={preferences.browser_notifications}
                onCheckedChange={(checked) => handlePreferenceChange('browser_notifications', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};