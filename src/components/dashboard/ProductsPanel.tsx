
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PackageOpen, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export const ProductsPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: products, isLoading } = useQuery({
    queryKey: ['user-products', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', user.id)
        .not('price', 'is', null)  // Only get images with prices (products)
        .order('created_at', { ascending: false })
        .limit(4);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleViewAll = () => {
    navigate("/products");
  };

  const handleCreate = () => {
    navigate("/create");
  };

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">My Products</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleViewAll}>
            View All
          </Button>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="rounded-lg bg-card/50 animate-pulse h-[150px]" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="group relative overflow-hidden rounded-lg border cursor-pointer"
                onClick={() => navigate(`/products/${product.id}`)}>
                <AspectRatio ratio={1/1} className="bg-muted">
                  <img
                    src={product.image_url}
                    alt={product.title || "Product"}
                    className="object-cover w-full h-full transition-all group-hover:scale-105"
                  />
                </AspectRatio>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                  <p className="text-white text-xs font-medium truncate">{product.title || "Product"}</p>
                  <p className="text-white text-xs">£{product.price}</p>
                </div>
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  £{product.price}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] border border-dashed rounded-lg bg-card/30">
            <PackageOpen className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No products yet</p>
            <Button onClick={handleCreate} variant="link" className="mt-2">
              Create your first product
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
