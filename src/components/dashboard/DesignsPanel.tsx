
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export const DesignsPanel = () => {
  const { user } = useAuth();

  const { data: designs, isLoading } = useQuery({
    queryKey: ['user-designs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">My Designs</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/designs">
              View All
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/create">
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Link>
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
        ) : designs && designs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {designs.map((design) => (
              <Link 
                key={design.id} 
                to={`/designs/${design.id}`} 
                className="group relative overflow-hidden rounded-lg border"
              >
                <AspectRatio ratio={1/1} className="bg-muted">
                  <img
                    src={design.image_url}
                    alt={design.prompt || "Design"}
                    className="object-cover w-full h-full transition-all group-hover:scale-105"
                  />
                </AspectRatio>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-white text-xs truncate">{design.prompt || "Design"}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] border border-dashed rounded-lg bg-card/30">
            <Image className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No designs yet</p>
            <Button asChild variant="link" className="mt-2">
              <Link to="/create">
                Create your first design
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
