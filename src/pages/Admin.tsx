import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ImageList } from "@/components/admin/ImageList";
import { ImageStats } from "@/components/admin/ImageStats";
import { ImageFilters } from "@/components/admin/ImageFilters";
import { PortfolioList } from "@/components/admin/PortfolioList";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Database, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredImages, setFilteredImages] = useState([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
        .eq('role', 'admin');

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return data && data.length > 0;
    },
  });

  const { data: imageStats } = useQuery({
    queryKey: ['imageStats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_images')
        .select('status, count(*)')
        .group('status');
      
      if (error) throw error;
      
      return {
        total: data.reduce((acc, curr) => acc + Number(curr.count), 0),
        pending: data.find(s => s.status === 'pending')?.count || 0,
        completed: data.find(s => s.status === 'completed')?.count || 0,
        failed: data.find(s => s.status === 'failed')?.count || 0
      };
    },
    enabled: !!isAdmin,
  });

  const { data: portfolios, isLoading: portfoliosLoading } = useQuery({
    queryKey: ['adminPortfolios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturer_portfolios')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!isAdmin,
  });

  const deletePortfolioMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('manufacturer_portfolios')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPortfolios'] });
      toast({
        title: "Success",
        description: "Portfolio item deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to delete portfolio item: " + error.message,
        variant: "destructive",
      });
    }
  });

  const updatePortfolioMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const { error } = await supabase
        .from('manufacturer_portfolios')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPortfolios'] });
      toast({
        title: "Success",
        description: "Portfolio item updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update portfolio item: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      deletePortfolioMutation.mutate(id);
    }
  };

  const handleUpdate = (id: number, data: any) => {
    updatePortfolioMutation.mutate({ id, data });
  };

  const handleView = (id: number) => {
    // Implement view functionality if needed
    console.log('Viewing item:', id);
  };

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

  if (checkingAdmin || portfoliosLoading) {
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
          </TabsList>

          <TabsContent value="portfolios">
            <div className="rounded-lg border bg-card">
              <PortfolioList
                items={portfolios || []}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            </div>
          </TabsContent>

          <TabsContent value="images">
            <div className="space-y-8">
              <ImageStats {...imageStats} />
              <ImageFilters 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              <div className="rounded-lg border bg-card">
                <ImageList 
                  images={filteredImages}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;