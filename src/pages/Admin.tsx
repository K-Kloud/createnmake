import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ImageList } from "@/components/admin/ImageList";
import { ImageStats } from "@/components/admin/ImageStats";
import { ImageFilters } from "@/components/admin/ImageFilters";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Database, Loader2 } from "lucide-react";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: images, isLoading } = useQuery({
    queryKey: ['adminImages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_images')
        .select(`
          *,
          profiles (
            username
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminImages'] });
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to delete image: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      deleteImageMutation.mutate(id);
    }
  };

  const handleView = (id: number) => {
    // Implement view functionality
    console.log('Viewing image:', id);
  };

  const filteredImages = images?.filter(image => 
    image.prompt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = {
    totalImages: images?.length || 0,
    totalLikes: images?.reduce((sum, img) => sum + (img.likes || 0), 0) || 0,
    totalViews: images?.reduce((sum, img) => sum + (img.views || 0), 0) || 0,
  };

  if (isLoading) {
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow container px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Database className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Image Management</h1>
        </div>

        <div className="space-y-8">
          <ImageStats {...stats} />
          
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
      </main>
      <Footer />
    </div>
  );
};

export default Admin;