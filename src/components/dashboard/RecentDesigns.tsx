
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export const RecentDesigns = () => {
  const { user } = useAuth();

  const { data: recentDesigns, isLoading } = useQuery({
    queryKey: ['recent-designs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Designs
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link to="/designs">
            View All
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="rounded-lg bg-card/50 animate-pulse h-[120px]" />
            ))}
          </div>
        ) : recentDesigns && recentDesigns.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recentDesigns.map((design) => (
              <Link 
                key={design.id} 
                to={`/designs/${design.id}`} 
                className="group relative overflow-hidden rounded-lg border hover:shadow-lg transition-all"
              >
                <AspectRatio ratio={1/1} className="bg-muted">
                  <img
                    src={design.image_url}
                    alt={design.prompt || "Design"}
                    className="object-cover w-full h-full transition-all group-hover:scale-105"
                  />
                </AspectRatio>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-white text-xs truncate">{design.prompt || "Design"}</p>
                  <p className="text-white/70 text-xs">
                    {new Date(design.created_at).toLocaleDateString()}
                  </p>
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
