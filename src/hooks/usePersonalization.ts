
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useErrorHandler } from './useErrorHandler';

interface UserPreferences {
  user_id: string;
  preferred_styles: string[];
  color_preferences: string[];
  favorite_categories: string[];
  notification_settings: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy_settings: {
    profile_visibility: 'public' | 'private';
    show_activity: boolean;
    allow_recommendations: boolean;
  };
  ui_preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    grid_size: 'small' | 'medium' | 'large';
  };
}

export const usePersonalization = () => {
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const queryClient = useQueryClient();

  // Get user preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async (): Promise<UserPreferences | null> => {
      if (!user?.id) return null;

      // Check if preferences exist in database
      const { data: existingPrefs } = await supabase
        .from('dashboard_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingPrefs) {
        // Transform dashboard settings to preferences format
        return {
          user_id: user.id,
          preferred_styles: [],
          color_preferences: [],
          favorite_categories: [],
          notification_settings: {
            email: true,
            push: false,
            marketing: false
          },
          privacy_settings: {
            profile_visibility: 'public',
            show_activity: true,
            allow_recommendations: true
          },
          ui_preferences: {
            theme: existingPrefs.theme || 'light',
            language: 'en',
            grid_size: 'medium'
          }
        };
      }

      // Return default preferences if none exist
      return {
        user_id: user.id,
        preferred_styles: [],
        color_preferences: [],
        favorite_categories: [],
        notification_settings: {
          email: true,
          push: false,
          marketing: false
        },
        privacy_settings: {
          profile_visibility: 'public',
          show_activity: true,
          allow_recommendations: true
        },
        ui_preferences: {
          theme: 'light',
          language: 'en',
          grid_size: 'medium'
        }
      };
    },
    enabled: !!user?.id,
  });

  // Update user preferences
  const updatePreferences = useMutation({
    mutationFn: async (newPreferences: Partial<UserPreferences>) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Update dashboard settings table
      const { error } = await supabase
        .from('dashboard_settings')
        .upsert({
          user_id: user.id,
          theme: newPreferences.ui_preferences?.theme || 'light',
          widgets: {
            preferences: newPreferences
          }
        });

      if (error) throw error;

      // Log preference change
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'update_preferences',
          action_details: {
            updated_fields: Object.keys(newPreferences),
            timestamp: new Date().toISOString()
          }
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    },
    onError: (error) => {
      handleError(error, 'updating user preferences');
    }
  });

  // Get personalized recommendations
  const getRecommendations = useMutation({
    mutationFn: async () => {
      if (!user?.id || !preferences) return [];

      // Get user's image history
      const { data: userImages } = await supabase
        .from('generated_images')
        .select('item_type, tags, likes, views')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      // Get user's liked images
      const { data: likedImages } = await supabase
        .from('image_likes')
        .select('image_id, generated_images(item_type, tags)')
        .eq('user_id', user.id);

      // Simple recommendation algorithm based on user activity
      const itemTypePreferences = userImages?.reduce((acc: any, img) => {
        acc[img.item_type] = (acc[img.item_type] || 0) + 1;
        return acc;
      }, {}) || {};

      const tagPreferences = userImages?.flatMap(img => img.tags || [])
        .reduce((acc: any, tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        }, {}) || {};

      // Get trending items in user's preferred categories
      const { data: trendingItems } = await supabase
        .from('generated_images')
        .select('*')
        .in('item_type', Object.keys(itemTypePreferences))
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('views', { ascending: false })
        .limit(10);

      return trendingItems || [];
    },
    onError: (error) => {
      handleError(error, 'getting personalized recommendations');
    }
  });

  return {
    preferences,
    isLoading,
    updatePreferences: updatePreferences.mutate,
    getRecommendations: getRecommendations.mutate,
    isUpdating: updatePreferences.isPending,
    isLoadingRecommendations: getRecommendations.isPending
  };
};
