
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Eye, Heart, Download } from "lucide-react";

export const StatsOverview = () => {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { totalDesigns: 0, totalViews: 0, totalLikes: 0, totalDownloads: 0 };
      
      const { data: designs, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Calculate basic stats (views, likes, downloads would come from additional tables in a real app)
      const totalDesigns = designs?.length || 0;
      const totalViews = 0; // Placeholder - would aggregate from views table
      const totalLikes = 0; // Placeholder - would aggregate from likes table
      const totalDownloads = 0; // Placeholder - would aggregate from downloads table
      
      return { totalDesigns, totalViews, totalLikes, totalDownloads };
    },
    enabled: !!user?.id,
  });

  const statCards = [
    {
      title: "Total Designs",
      value: stats?.totalDesigns || 0,
      icon: Image,
      color: "text-blue-600"
    },
    {
      title: "Total Views",
      value: stats?.totalViews || 0,
      icon: Eye,
      color: "text-green-600"
    },
    {
      title: "Total Likes",
      value: stats?.totalLikes || 0,
      icon: Heart,
      color: "text-red-600"
    },
    {
      title: "Downloads",
      value: stats?.totalDownloads || 0,
      icon: Download,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-12 bg-muted animate-pulse rounded" />
              ) : (
                stat.value.toLocaleString()
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
