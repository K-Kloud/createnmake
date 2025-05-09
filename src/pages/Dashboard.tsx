
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, MoveUpRight, LayoutGrid } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DesignsPanel } from "@/components/dashboard/DesignsPanel";
import { ProductsPanel } from "@/components/dashboard/ProductsPanel";
import { OrdersPanel } from "@/components/dashboard/OrdersPanel";
import { EarningsPanel } from "@/components/dashboard/EarningsPanel";
import { StatsCard } from "@/components/dashboard/StatsCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Query for generated images count
  const { data: generatedImagesCount = 0 } = useQuery({
    queryKey: ['generatedImagesCount', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      const { count } = await supabase
        .from('generated_images')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      return count || 0;
    },
    enabled: !!session?.user?.id,
  });

  // Query for likes count
  const { data: likesCount = 0 } = useQuery({
    queryKey: ['likesCount', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      const { count } = await supabase
        .from('image_likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      return count || 0;
    },
    enabled: !!session?.user?.id,
  });

  // Query for orders count
  const { data: ordersCount = 0 } = useQuery({
    queryKey: ['ordersCount', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      
      // Count all quote requests and artisan quotes
      const [artisanResult, quoteResult] = await Promise.all([
        supabase
          .from('artisan_quotes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id),
          
        supabase
          .from('quote_requests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
      ]);
      
      const artisanCount = artisanResult.count || 0;
      const quoteCount = quoteResult.count || 0;
      
      return artisanCount + quoteCount;
    },
    enabled: !!session?.user?.id,
  });

  // Query for product count (images with prices)
  const { data: productsCount = 0 } = useQuery({
    queryKey: ['productsCount', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      const { count } = await supabase
        .from('generated_images')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .not('price', 'is', null);
      return count || 0;
    },
    enabled: !!session?.user?.id,
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatarMutation.mutate(file);
    }
  };

  useEffect(() => {
    if (!session) {
      navigate('/');
    }
  }, [session, navigate]);

  if (!session || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container px-4 py-24 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Profile Card */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profile.avatar_url} alt={profile.username} />
                        <AvatarFallback>{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-white" />
                      </label>
                      <input
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                    </div>
                    <div className="text-center">
                      <h2 className="text-xl font-bold">{profile.username}</h2>
                      <p className="text-sm text-muted-foreground">{session.user.email}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate("/settings")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-4">
                <StatsCard
                  title="Designs"
                  value={generatedImagesCount}
                  icon={<LayoutGrid className="h-4 w-4" />}
                  onClick={() => navigate("/designs")}
                />
                <StatsCard
                  title="Products"
                  value={productsCount}
                  icon={<PackageOpen className="h-4 w-4" />}
                  onClick={() => navigate("/products")}
                />
                <StatsCard
                  title="Orders"
                  value={ordersCount}
                  icon={<ShoppingBag className="h-4 w-4" />}
                  onClick={() => navigate("/orders")}
                />
                <StatsCard
                  title="Likes"
                  value={likesCount}
                  icon={<Heart className="h-4 w-4" />}
                />
              </div>

              {/* Quick Actions */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      variant="default" 
                      className="w-full justify-between"
                      onClick={() => navigate("/create")}
                    >
                      Create New Design
                      <MoveUpRight className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between"
                      onClick={() => navigate("/marketplace")}
                    >
                      Browse Marketplace
                      <MoveUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="bg-background/50 backdrop-blur-sm">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="designs">Designs</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <DesignsPanel />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <OrdersPanel />
                  <EarningsPanel />
                </div>
              </TabsContent>

              <TabsContent value="designs">
                <DesignsPanel />
              </TabsContent>

              <TabsContent value="products">
                <ProductsPanel />
              </TabsContent>

              <TabsContent value="orders">
                <OrdersPanel />
              </TabsContent>

              <TabsContent value="earnings">
                <EarningsPanel />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
