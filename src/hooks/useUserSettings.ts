import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { NotificationPreferences } from "@/components/notifications/NotificationPreferencesPanel";

interface ProfileData {
  first_name: string;
  last_name: string;
  bio: string;
  display_name: string;
}

interface UserPreferences {
  email_orders: boolean;
  email_marketing: boolean;
  browser_notifications: boolean;
}

interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const defaultNotificationPreferences: NotificationPreferences = {
  milestone: { email: true, toast: true, in_app: true },
  badge: { email: true, toast: true, in_app: true },
  leaderboard: { email: true, toast: true, in_app: true },
  engagement: { email: true, toast: true, in_app: true },
  subscription: { email: true, toast: true, in_app: true },
  welcome: { email: true, toast: true, in_app: true },
  security: { email: true, toast: true, in_app: true },
  verification: { email: true, toast: true, in_app: true },
  order: { email: true, toast: true, in_app: true },
  payment: { email: true, toast: true, in_app: true },
  system: { email: true, toast: true, in_app: true },
  re_engagement: { email: true, toast: false, in_app: true },
  recommendation: { email: false, toast: true, in_app: true },
  content_update: { email: false, toast: true, in_app: true },
  deal: { email: true, toast: true, in_app: true },
  make_reminder: { email: true, toast: true, in_app: true },
  creator_activity: { email: false, toast: true, in_app: true },
};

export const useUserSettings = (userId?: string) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    bio: "",
    display_name: ""
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    email_orders: true,
    email_marketing: false,
    browser_notifications: true
  });

  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(defaultNotificationPreferences);

  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch user preferences
  const { data: userPrefs } = useQuery({
    queryKey: ['user-preferences', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Update local state when data is fetched
  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        bio: profile.bio || "",
        display_name: profile.display_name || ""
      });
    }
  }, [profile]);

  useEffect(() => {
    if (userPrefs) {
      setPreferences({
        email_orders: userPrefs.email_orders,
        email_marketing: userPrefs.email_marketing,
        browser_notifications: userPrefs.browser_notifications
      });
      
      // Load notification preferences
      if (userPrefs.notification_preferences && typeof userPrefs.notification_preferences === 'object') {
        setNotificationPreferences({
          ...defaultNotificationPreferences,
          ...(userPrefs.notification_preferences as Record<string, any>)
        } as NotificationPreferences);
      }
    }
  }, [userPrefs]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileData) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          bio: data.bio,
          display_name: data.display_name
        })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Profile updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update profile",
        description: "Please try again later.",
        variant: "destructive",
      });
      console.error('Profile update error:', error);
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: UserPreferences) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          email_orders: data.email_orders,
          email_marketing: data.email_marketing,
          browser_notifications: data.browser_notifications
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Preferences saved successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save preferences",
        description: "Please try again later.",
        variant: "destructive",
      });
      console.error('Preferences update error:', error);
    },
  });

  // Update notification preferences mutation
  const updateNotificationPreferencesMutation = useMutation({
    mutationFn: async (data: NotificationPreferences) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          notification_preferences: data as any
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Notification preferences saved successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save notification preferences",
        description: "Please try again later.",
        variant: "destructive",
      });
      console.error('Notification preferences update error:', error);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordData) => {
      if (data.new_password !== data.confirm_password) {
        throw new Error("Passwords don't match");
      }

      const { error } = await supabase.auth.updateUser({
        password: data.new_password
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Password changed successfully!",
      });
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to change password",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      console.error('Password change error:', error);
    },
  });

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (field: keyof UserPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationPreferenceChange = (
    type: keyof NotificationPreferences,
    channel: 'email' | 'toast' | 'in_app',
    value: boolean
  ) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: value
      }
    }));
  };

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferencesMutation.mutate(preferences);
  };

  const handleNotificationPreferencesSubmit = () => {
    updateNotificationPreferencesMutation.mutate(notificationPreferences);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.new_password || !passwordData.confirm_password) {
      toast({
        title: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate(passwordData);
  };

  return {
    profileData,
    preferences,
    notificationPreferences,
    passwordData,
    handleProfileChange,
    handlePreferenceChange,
    handleNotificationPreferenceChange,
    handlePasswordChange,
    handleProfileSubmit,
    handlePreferencesSubmit,
    handleNotificationPreferencesSubmit,
    handlePasswordSubmit,
    isUpdatingProfile: updateProfileMutation.isPending,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    isUpdatingNotificationPreferences: updateNotificationPreferencesMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
  };
};