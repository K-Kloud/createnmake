
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Image, Plus, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { EnhancedPagination } from "@/components/ui/enhanced-pagination";
import { LoadingState } from "@/components/ui/loading-state";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const pageSize = 12;

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

  // Calculate pagination
  const totalDesigns = designs?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalDesigns / pageSize));
  
  const getCurrentDesigns = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return designs?.slice(startIndex, endIndex) ?? [];
  };
  
  const currentDesigns = getCurrentDesigns();
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AuthenticatedLayout 
      title="My Designs | Create2Make"
      description="View and manage your created designs"
    >
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
      
      <PageHeader title="My Designs">
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
      </PageHeader>

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
          <EmptyState 
            icon={Image}
            title="No designs yet"
            description="Create your first design to get started"
            actionLabel="Create your first design"
            onAction={() => navigate("/create")}
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentDesigns.map((design) => (
              <Link to={`/design/${design.id}`} key={design.id}>
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
              <Link to={`/design/${design.id}`} key={design.id}>
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
                    <div className="flex-grow min-w-0">
                      <h3 className="font-medium truncate mb-1">
                        {design.prompt || "Untitled Design"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(design.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="mt-8">
            <EnhancedPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </LoadingState>
    </AuthenticatedLayout>
  );
};

export default Designs;
