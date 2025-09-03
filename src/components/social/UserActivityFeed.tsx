import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, UserPlus, Image, Users } from 'lucide-react';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';

interface ActivityFeedItem {
  id: string;
  activity_type: string;
  activity_data: any;
  target_user_id?: string;
  target_content_id?: string;
  is_read: boolean;
  created_at: string;
  target_user?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export const UserActivityFeed: React.FC = () => {
  const { user } = useAuth();
  const { useLazyImage } = usePerformanceOptimization();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['user-activity-feed', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_activity_feed')
        .select(`
          *,
          target_user:profiles!user_activity_feed_target_user_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        target_user: Array.isArray(item.target_user) ? item.target_user[0] : item.target_user
      })) as ActivityFeedItem[];
    },
    enabled: !!user?.id,
  });

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'new_follower':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'image_liked':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'image_commented':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'image_shared':
        return <Image className="w-4 h-4 text-purple-500" />;
      case 'user_mentioned':
        return <Users className="w-4 h-4 text-orange-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };

  const getActivityMessage = (activity: ActivityFeedItem) => {
    const { activity_type, activity_data, target_user } = activity;
    const userName = target_user?.display_name || target_user?.username || 'Someone';

    switch (activity_type) {
      case 'new_follower':
        return `${userName} started following you`;
      case 'image_liked':
        return `${userName} liked your image`;
      case 'image_commented':
        return `${userName} commented on your image`;
      case 'image_shared':
        return `${userName} shared your image`;
      case 'user_mentioned':
        return `${userName} mentioned you in a comment`;
      default:
        return `${userName} interacted with your content`;
    }
  };

  const ActivityAvatar: React.FC<{ user: ActivityFeedItem['target_user'] }> = ({ user }) => {
    const { src: avatarSrc, isLoading: avatarLoading } = useLazyImage(
      user?.avatar_url || '',
      { width: 40, quality: 80 }
    );

    return (
      <Avatar className="w-8 h-8">
        {avatarLoading ? (
          <div className="w-full h-full bg-muted animate-pulse rounded-full" />
        ) : (
          <>
            <AvatarImage src={avatarSrc} alt={user?.display_name || user?.username} />
            <AvatarFallback>
              {(user?.display_name || user?.username || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </>
        )}
      </Avatar>
    );
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
      
      {activities?.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No recent activity to show</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities?.map((activity) => (
            <Card
              key={activity.id}
              className={`transition-colors ${
                !activity.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 relative">
                    <ActivityAvatar user={activity.target_user} />
                    <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-full border">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      {getActivityMessage(activity)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  
                  {!activity.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};