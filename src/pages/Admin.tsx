import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ImageList } from "@/components/admin/ImageList";
import { ImageFilters } from "@/components/admin/ImageFilters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Database, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminStats } from "@/components/admin/stats/AdminStats";
import { AdminPortfolio } from "@/components/admin/portfolio/AdminPortfolio";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredImages, setFilteredImages] = useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const { data, error } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return !!data;
    },
  });

  useEffect(() => {
    if (!checkingAdmin && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [isAdmin, checkingAdmin, navigate, toast]);

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
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow container px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Database className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="portfolios" className="space-y-8">
          <TabsList>
            <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolios">
            <div className="rounded-lg border bg-card">
              <AdminPortfolio />
            </div>
          </TabsContent>

          <TabsContent value="images">
            <div className="space-y-8">
              <ImageFilters 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              <div className="rounded-lg border bg-card">
                <ImageList 
                  images={filteredImages}
                  onDelete={() => {}}
                  onView={() => {}}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <AdminStats />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;