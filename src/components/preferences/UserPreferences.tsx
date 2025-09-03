import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Bell, Eye, Zap, Palette, Shield } from 'lucide-react';

interface UserPreferencesData {
  id: string;
  notification_settings: {
    push: boolean;
    email: boolean;
    in_app: boolean;
  };
  ui_preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    reduced_motion: boolean;
  };
  privacy_settings: {
    profile_visibility: 'public' | 'private';
    activity_visibility: 'public' | 'followers' | 'private';
  };
  performance_settings: {
    image_quality: 'high' | 'medium' | 'low';
    auto_play_videos: boolean;
    preload_images: boolean;
  };
}

export const UserPreferences: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Return default preferences if no record exists
      return data || {
        id: '',
        notification_settings: { push: true, email: true, in_app: true },
        ui_preferences: { theme: 'system', language: 'en', reduced_motion: false },
        privacy_settings: { profile_visibility: 'public', activity_visibility: 'public' },
        performance_settings: { image_quality: 'high', auto_play_videos: true, preload_images: true }
      };
    },
    enabled: !!user?.id,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<UserPreferencesData>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences', user?.id] });
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been saved successfully.",
      });
      setHasChanges(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating preferences:', error);
    },
  });

  const updatePreferences = (updates: Partial<UserPreferencesData>) => {
    if (!preferences) return;
    
    const newPreferences = { ...preferences, ...updates };
    updatePreferencesMutation.mutate(newPreferences);
  };

  const updateNotificationSetting = (key: keyof UserPreferencesData['notification_settings'], value: boolean) => {
    if (!preferences) return;
    setHasChanges(true);
    updatePreferences({
      notification_settings: {
        ...preferences.notification_settings,
        [key]: value
      }
    });
  };

  const updateUISetting = (key: keyof UserPreferencesData['ui_preferences'], value: any) => {
    if (!preferences) return;
    setHasChanges(true);
    updatePreferences({
      ui_preferences: {
        ...preferences.ui_preferences,
        [key]: value
      }
    });
  };

  const updatePrivacySetting = (key: keyof UserPreferencesData['privacy_settings'], value: any) => {
    if (!preferences) return;
    setHasChanges(true);
    updatePreferences({
      privacy_settings: {
        ...preferences.privacy_settings,
        [key]: value
      }
    });
  };

  const updatePerformanceSetting = (key: keyof UserPreferencesData['performance_settings'], value: any) => {
    if (!preferences) return;
    setHasChanges(true);
    updatePreferences({
      performance_settings: {
        ...preferences.performance_settings,
        [key]: value
      }
    });
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-6 bg-muted rounded w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Preferences</h2>
        {hasChanges && (
          <div className="text-sm text-muted-foreground">
            Changes are saved automatically
          </div>
        )}
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Choose how you want to be notified about activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <Switch
              id="push-notifications"
              checked={preferences.notification_settings.push}
              onCheckedChange={(checked) => updateNotificationSetting('push', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch
              id="email-notifications"
              checked={preferences.notification_settings.email}
              onCheckedChange={(checked) => updateNotificationSetting('email', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="in-app-notifications">In-App Notifications</Label>
            <Switch
              id="in-app-notifications"
              checked={preferences.notification_settings.in_app}
              onCheckedChange={(checked) => updateNotificationSetting('in_app', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* UI Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance & Accessibility
          </CardTitle>
          <CardDescription>
            Customize the look and feel of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="theme-select">Theme</Label>
            <Select
              value={preferences.ui_preferences.theme}
              onValueChange={(value: 'light' | 'dark' | 'system') => updateUISetting('theme', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="language-select">Language</Label>
            <Select
              value={preferences.ui_preferences.language}
              onValueChange={(value) => updateUISetting('language', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="reduced-motion">Reduced Motion</Label>
            <Switch
              id="reduced-motion"
              checked={preferences.ui_preferences.reduced_motion}
              onCheckedChange={(checked) => updateUISetting('reduced_motion', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy
          </CardTitle>
          <CardDescription>
            Control who can see your profile and activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="profile-visibility">Profile Visibility</Label>
            <Select
              value={preferences.privacy_settings.profile_visibility}
              onValueChange={(value: 'public' | 'private') => updatePrivacySetting('profile_visibility', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="activity-visibility">Activity Visibility</Label>
            <Select
              value={preferences.privacy_settings.activity_visibility}
              onValueChange={(value: 'public' | 'followers' | 'private') => updatePrivacySetting('activity_visibility', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="followers">Followers</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance
          </CardTitle>
          <CardDescription>
            Optimize the app for your device and connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="image-quality">Image Quality</Label>
            <Select
              value={preferences.performance_settings.image_quality}
              onValueChange={(value: 'high' | 'medium' | 'low') => updatePerformanceSetting('image_quality', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-play-videos">Auto-play Videos</Label>
            <Switch
              id="auto-play-videos"
              checked={preferences.performance_settings.auto_play_videos}
              onCheckedChange={(checked) => updatePerformanceSetting('auto_play_videos', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="preload-images">Preload Images</Label>
            <Switch
              id="preload-images"
              checked={preferences.performance_settings.preload_images}
              onCheckedChange={(checked) => updatePerformanceSetting('preload_images', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};