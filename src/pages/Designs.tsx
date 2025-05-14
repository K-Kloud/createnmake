
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Image, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const Designs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: designs, isLoading } = useQuery({
    queryKey: ['user-designs-all', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

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
                <Link to="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My Designs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Designs</h1>
          <Button onClick={() => navigate("/create")}>
            <Plus className="mr-2 h-4 w-4" /> Create New Design
          </Button>
        </div>

        {!user && (
          <Card className="p-8 text-center">
            <p className="mb-4">Please sign in to view your designs.</p>
            <Button onClick={() => navigate("/")}>Go to Home</Button>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <AspectRatio ratio={1}>
                  <div className="w-full h-full bg-muted" />
                </AspectRatio>
              </Card>
            ))}
          </div>
        ) : designs && designs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {designs.map((design) => (
              <Link to={`/designs/${design.id}`} key={design.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
                  <AspectRatio ratio={1}>
                    <img
                      src={design.image_url}
                      alt={design.prompt || "Design"}
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">
                      {design.prompt || "Untitled Design"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(design.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
            <Image className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No designs yet</p>
            <Button onClick={() => navigate("/create")}>Create your first design</Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Designs;
