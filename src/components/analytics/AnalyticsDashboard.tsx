
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { LoadingState } from '@/components/ui/loading-state';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { TrendingUp, Users, Image, DollarSign } from 'lucide-react';

interface AnalyticsData {
  userGrowth: Array<{ month: string; users: number; }>;
  imageGeneration: Array<{ date: string; count: number; }>;
  revenue: Array<{ month: string; amount: number; }>;
  userDistribution: Array<{ type: string; count: number; color: string; }>;
  topPerformingImages: Array<{ id: string; title: string; views: number; likes: number; }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AnalyticsDashboard: React.FC = () => {
  const { handleError } = useErrorHandler();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async (): Promise<AnalyticsData> => {
      try {
        // Get user growth data
        const { data: profiles } = await supabase
          .from('profiles')
          .select('created_at, is_creator, is_artisan')
          .order('created_at', { ascending: false });

        // Get image generation data
        const { data: images } = await supabase
          .from('generated_images')
          .select('id, created_at, views, likes, title')
          .order('created_at', { ascending: false })
          .limit(1000);

        // Process user growth by month
        const userGrowthMap = new Map<string, number>();
        profiles?.forEach(profile => {
          const month = new Date(profile.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          userGrowthMap.set(month, (userGrowthMap.get(month) || 0) + 1);
        });

        const userGrowth = Array.from(userGrowthMap.entries())
          .map(([month, users]) => ({ month, users }))
          .slice(-12); // Last 12 months

        // Process image generation by day (last 30 days)
        const imageGenMap = new Map<string, number>();
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        images?.forEach(image => {
          const imageDate = new Date(image.created_at);
          if (imageDate >= thirtyDaysAgo) {
            const date = imageDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
            imageGenMap.set(date, (imageGenMap.get(date) || 0) + 1);
          }
        });

        const imageGeneration = Array.from(imageGenMap.entries())
          .map(([date, count]) => ({ date, count }))
          .slice(-30);

        // Simulate revenue data (in a real app, this would come from payment records)
        const revenue = Array.from({ length: 12 }, (_, i) => ({
          month: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          }),
          amount: Math.floor(Math.random() * 5000) + 1000
        }));

        // User distribution
        const totalUsers = profiles?.length || 0;
        const creators = profiles?.filter(p => p.is_creator).length || 0;
        const artisans = profiles?.filter(p => p.is_artisan).length || 0;
        const regularUsers = totalUsers - creators - artisans;

        const userDistribution = [
          { type: 'Regular Users', count: regularUsers, color: COLORS[0] },
          { type: 'Creators', count: creators, color: COLORS[1] },
          { type: 'Artisans', count: artisans, color: COLORS[2] }
        ];

        // Top performing images
        const topPerformingImages = images
          ?.sort((a, b) => (b.views || 0) + (b.likes || 0) - (a.views || 0) - (a.likes || 0))
          .slice(0, 5)
          .map(img => ({
            id: img.id?.toString() || '0',
            title: img.title || 'Untitled',
            views: img.views || 0,
            likes: img.likes || 0
          })) || [];

        return {
          userGrowth,
          imageGeneration,
          revenue,
          userDistribution,
          topPerformingImages
        };
      } catch (error) {
        handleError(error, 'fetching analytics data');
        throw error;
      }
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.userGrowth.reduce((sum, item) => sum + item.users, 0) || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images Generated</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.imageGeneration.reduce((sum, item) => sum + item.count, 0) || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              £{analytics?.revenue[analytics.revenue.length - 1]?.amount || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
          </CardContent>
        </Card>
      </div>

      <LoadingState
        isLoading={isLoading}
        error={error}
        loadingMessage="Loading analytics..."
        errorMessage="Failed to load analytics data"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Image Generation (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.imageGeneration}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Revenue Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`£${value}`, 'Revenue']} />
                  <Line type="monotone" dataKey="amount" stroke="#ffc658" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.userDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics?.userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Top Performing Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.topPerformingImages.map((image, index) => (
                <div key={image.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-lg">#{index + 1}</div>
                    <div>
                      <h4 className="font-medium">{image.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {image.views} views • {image.likes} likes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{image.views + image.likes}</div>
                    <div className="text-sm text-muted-foreground">Total Engagement</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </LoadingState>
    </div>
  );
};
