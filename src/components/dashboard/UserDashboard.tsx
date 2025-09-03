import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Image, 
  ShoppingBag, 
  Heart, 
  Eye, 
  TrendingUp,
  Calendar,
  Download,
  Edit,
  Trash2
} from 'lucide-react';

interface DashboardStats {
  totalDesigns: number;
  totalLikes: number;
  totalViews: number;
  totalOrders: number;
}

interface UserDesign {
  id: number;
  image_url: string;
  prompt: string;
  likes: number;
  views: number;
  is_public: boolean;
  created_at: string;
}

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase.rpc('get_user_stats', {
        user_uuid: user.id
      });
      
      if (error) throw error;
      return data as unknown as DashboardStats;
    },
    enabled: !!user?.id,
  });

  // Fetch user designs
  const { data: designs } = useQuery({
    queryKey: ['user-designs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserDesign[];
    },
    enabled: !!user?.id,
  });

  // Fetch user orders
  const { data: orders } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('artisan_quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const toggleDesignVisibility = async (designId: number, isPublic: boolean) => {
    try {
      await supabase
        .from('generated_images')
        .update({ is_public: !isPublic })
        .eq('id', designId);
      
      // Refresh designs
      // TODO: Implement optimistic updates
    } catch (error) {
      console.error('Error updating design visibility:', error);
    }
  };

  const deleteDesign = async (designId: number) => {
    if (!confirm('Are you sure you want to delete this design?')) return;
    
    try {
      await supabase
        .from('generated_images')
        .delete()
        .eq('id', designId);
      
      // Refresh designs
      // TODO: Implement optimistic updates
    } catch (error) {
      console.error('Error deleting design:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your designs, orders, and account settings
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Image className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalDesigns || 0}</p>
                <p className="text-sm text-muted-foreground">Total Designs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalLikes || 0}</p>
                <p className="text-sm text-muted-foreground">Total Likes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalViews || 0}</p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orders?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Orders Placed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">My Designs</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs?.map((design) => (
              <Card key={design.id} className="group overflow-hidden">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={design.image_url}
                    alt={design.prompt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={design.is_public ? "default" : "secondary"}>
                      {design.is_public ? "Public" : "Private"}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => toggleDesignVisibility(design.id, design.is_public)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => deleteDesign(design.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {design.prompt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {design.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {design.views}
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(design.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {orders?.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                  <Badge variant={
                    order.status === 'completed' ? 'default' : 
                    order.status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{order.product_details}</p>
                  {order.amount && (
                    <p className="font-medium">${order.amount}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Activity feed will be available soon. This will show your recent likes, 
                comments, and other interactions across the platform.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};