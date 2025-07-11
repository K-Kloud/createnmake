
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ImageList } from "@/components/admin/ImageList";
import { ImageFilters } from "@/components/admin/ImageFilters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Database, Loader2, CalendarRange, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminStats } from "@/components/admin/stats/AdminStats";
import { AdminPortfolio } from "@/components/admin/portfolio/AdminPortfolio";
import { UserManagement } from "@/components/admin/users/UserManagement";
import { TaskWorkflow } from "@/components/admin/taskflow/TaskWorkflow";
import { useAdminAccess } from "@/hooks/useAdminAccess";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Use the updated admin access hook
  const { isAdmin, isLoading: checkingAdmin, session } = useAdminAccess();

  console.log("Admin page - isAdmin:", isAdmin, "email:", session?.user?.email);

  // Only fetch images if user is admin
  const { data: images, isLoading: loadingImages, refetch } = useQuery({
    queryKey: ['adminImages', searchTerm],
    queryFn: async () => {
      const query = supabase
        .from('generated_images')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query.or(`title.ilike.%${searchTerm}%,prompt.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!isAdmin,
  });

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Image deleted",
        description: "The image has been successfully deleted."
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the image. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle unauthorized access or loading state
  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow container px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    // Use session check to differentiate between not logged in and not admin
    if (!session) {
      // User is not logged in
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      navigate('/');
      return null;
    } else {
      // User is logged in but not an admin
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return null;
    }
  }

  // Normal admin view
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow container px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Database className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="images" className="space-y-8">
          <TabsList>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="taskflow">
              <CalendarRange className="mr-2 h-4 w-4" />
              Task Workflow
            </TabsTrigger>
            <TabsTrigger 
              value="ai-agents" 
              onClick={() => navigate('/admin/ai-agents')}
              className="cursor-pointer"
            >
              <Bot className="mr-2 h-4 w-4" />
              AI Agents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images">
            <div className="space-y-8">
              <ImageFilters 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              <div className="rounded-lg border bg-card">
                <ImageList 
                  images={images || []}
                  onDelete={handleDelete}
                  isLoading={loadingImages}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <AdminStats />
          </TabsContent>

          <TabsContent value="portfolios">
            <div className="rounded-lg border bg-card">
              <AdminPortfolio />
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="taskflow">
            <TaskWorkflow />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
