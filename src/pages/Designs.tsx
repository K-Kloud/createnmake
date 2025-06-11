
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Image, Plus, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { EnhancedPagination } from "@/components/ui/enhanced-pagination";
import { LoadingState } from "@/components/ui/loading-state";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const Designs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const pageSize = 12; // Number of designs per page

  const { data: designs, isLoading, error, refetch } = useQuery({
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

  // Calculate pagination information
  const totalDesigns = designs?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalDesigns / pageSize));
  
  // Get current page's designs
  const getCurrentDesigns = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return designs?.slice(startIndex, endIndex) ?? [];
  };
  
  const currentDesigns = getCurrentDesigns();
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <h1 className="text-3xl font-bold">My Designs</h1>
          <div className="flex items-center space-x-4">
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "list")}>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <Grid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button onClick={() => navigate("/create")}>
              <Plus className="mr-2 h-4 w-4" /> Create New Design
            </Button>
          </div>
        </div>

        {!user && (
          <Card className="p-8 text-center">
            <p className="mb-4">Please sign in to view your designs.</p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </Card>
        )}

        <LoadingState
          isLoading={isLoading}
          error={error as Error | null}
          onRetry={() => refetch()}
          loadingComponent={
            viewMode === "grid" 
              ? <SkeletonLoader type="card" count={8} />
              : <SkeletonLoader type="list" count={5} />
          }
        >
          {designs?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
              <Image className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No designs yet</p>
              <Button onClick={() => navigate("/create")}>Create your first design</Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentDesigns.map((design) => (
                <Link to={`/designs/${design.id}`} key={design.id}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
                    <AspectRatio ratio={1}>
                      <img
                        src={design.image_url}
                        alt={design.prompt || "Design"}
                        className="object-cover w-full h-full"
                        loading="lazy"
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
            <div className="space-y-4">
              {currentDesigns.map((design) => (
                <Link to={`/designs/${design.id}`} key={design.id}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all hover:border-primary cursor-pointer">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <div className="w-24 h-24 rounded-md overflow-hidden shrink-0">
                        <img
                          src={design.image_url}
                          alt={design.prompt || "Design"}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {design.prompt || "Untitled Design"}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                          <span>{new Date(design.created_at).toLocaleDateString()}</span>
                          {design.is_public && (
                            <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs">Public</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <EnhancedPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </LoadingState>
      </main>
      <Footer />
    </div>
  );
};

export default Designs;
