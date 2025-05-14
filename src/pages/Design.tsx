
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Edit, Trash2, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { GeneratedImage } from "@/types/content";

const Design = () => {
  const { designId } = useParams<{ designId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: design, isLoading } = useQuery({
    queryKey: ['design-detail', designId],
    queryFn: async () => {
      if (!designId) return null;
      
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('id', designId)
        .single();
        
      if (error) throw error;
      return data as GeneratedImage | null;
    },
    enabled: !!designId,
  });

  const handleDelete = async () => {
    if (!design || !user) return;
    
    if (design.user_id !== user.id) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to delete this design.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', design.id);
      
      if (error) throw error;
      
      toast({
        title: "Design deleted",
        description: "The design has been successfully deleted.",
      });
      
      navigate('/designs');
    } catch (error) {
      console.error('Error deleting design:', error);
      toast({
        title: "Error",
        description: "Failed to delete the design.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    if (!design?.image_url) return;
    
    const link = document.createElement('a');
    link.href = design.image_url;
    link.download = `design-${design.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: "Your design is being downloaded.",
    });
  };

  const handleShare = async () => {
    if (!design) return;
    
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Design link copied to clipboard.",
      });
    } catch (error) {
      console.error('Error sharing design:', error);
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
          <div className="w-full h-64 animate-pulse bg-muted rounded-lg"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!design) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
          <Card className="p-8 text-center">
            <p className="mb-4">Design not found or you don't have permission to view it.</p>
            <Button asChild>
              <Link to="/designs">Back to My Designs</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const isOwner = user && design.user_id === user.id;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/designs">My Designs</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Design Details</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link to="/designs">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Designs
            </Link>
          </Button>
          
          <div className="flex gap-2">
            {isOwner && (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/create?edit=${design.id}`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="overflow-hidden">
              <div className="relative pt-[100%] md:pt-[75%]">
                <img 
                  src={design.image_url} 
                  alt={design.prompt || "Design"} 
                  className="absolute inset-0 w-full h-full object-contain bg-card/50"
                />
              </div>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Design Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                    <p>{new Date(design.created_at).toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Prompt</h3>
                    <p>{design.prompt || "No prompt provided"}</p>
                  </div>
                  
                  {design.negative_prompt && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Negative Prompt</h3>
                      <p>{design.negative_prompt}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Design;
