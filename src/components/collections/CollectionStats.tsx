import React from 'react';
import { Eye, Users, Image as ImageIcon, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollectionAnalytics } from '@/hooks/useCollectionAnalytics';

interface CollectionStatsProps {
  collectionId: string;
}

export const CollectionStats = ({ collectionId }: CollectionStatsProps) => {
  const { stats, isLoadingStats } = useCollectionAnalytics(collectionId);

  if (isLoadingStats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-16" />
                <div className="h-8 bg-muted rounded w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Views',
      value: stats.total_views.toLocaleString(),
      icon: Eye,
      description: `${stats.views_last_7_days} in last 7 days`,
    },
    {
      title: 'Followers',
      value: stats.total_followers.toLocaleString(),
      icon: Users,
      description: 'Total followers',
    },
    {
      title: 'Images',
      value: stats.total_images.toLocaleString(),
      icon: ImageIcon,
      description: `${stats.images_added_last_7_days} added recently`,
    },
    {
      title: 'Engagement',
      value: stats.unique_viewers.toLocaleString(),
      icon: Activity,
      description: 'Unique viewers',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
