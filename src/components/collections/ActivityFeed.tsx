import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Plus, Edit, Trash2, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useCollectionAnalytics } from '@/hooks/useCollectionAnalytics';
import { formatDistanceToNow } from 'date-fns';

export const ActivityFeed = () => {
  const navigate = useNavigate();
  const { userActivity, isLoadingActivity } = useCollectionAnalytics();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <Plus className="h-4 w-4" />;
      case 'updated':
        return <Edit className="h-4 w-4" />;
      case 'image_added':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'image_removed':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'shared':
        return <Share2 className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: any) => {
    const collectionName = activity.image_collections?.name || 'Collection';
    switch (activity.activity_type) {
      case 'created':
        return `Created "${collectionName}"`;
      case 'updated':
        return `Updated "${collectionName}"`;
      case 'image_added':
        return `Added an image to "${collectionName}"`;
      case 'image_removed':
        return `Removed an image from "${collectionName}"`;
      case 'shared':
        return `Shared "${collectionName}"`;
      default:
        return `Activity in "${collectionName}"`;
    }
  };

  if (isLoadingActivity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="h-8 w-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (userActivity.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No recent activity. Start creating and managing collections!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
              onClick={() => navigate(`/my-collections/${activity.collection_id}`)}
            >
              <div className="mt-1 p-2 rounded-full bg-primary/10">
                {getActivityIcon(activity.activity_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {getActivityText(activity)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
              {activity.image_collections?.cover_image_url && (
                <img
                  src={activity.image_collections.cover_image_url}
                  alt="Collection"
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
