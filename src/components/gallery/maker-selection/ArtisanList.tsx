
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Artisan {
  id: string;
  business_name: string;
  specialties: string[];
  avatar_url?: string;
}

interface ArtisanListProps {
  onSelect: (artisanId: string) => void;
  isSubmitting?: boolean;
  selectedId?: string;
  imageId?: number;
}

export const ArtisanList = ({ onSelect, isSubmitting = false, selectedId, imageId }: ArtisanListProps) => {
  const { data: artisans, isLoading } = useQuery({
    queryKey: ['artisans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, business_name, specialties, avatar_url')
        .eq('is_artisan', true);

      if (error) {
        console.error('Error fetching artisans:', error);
        return [];
      }
      return data as Artisan[];
    },
  });

  const handleAssign = async (artisanId: string) => {
    if (!imageId) return;
    
    try {
      const { error } = await supabase
        .from('generated_images')
        .update({ assigned_artisan_id: artisanId })
        .eq('id', imageId);

      if (error) throw error;
      
      onSelect(artisanId);
      toast({
        title: "Artisan assigned",
        description: "The artisan has been successfully assigned to this item."
      });
    } catch (error) {
      console.error('Error assigning artisan:', error);
      toast({
        title: "Error",
        description: "Failed to assign artisan. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!artisans || artisans.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        No artisans found
      </p>
    );
  }

  return (
    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {artisans.map((artisan) => (
          <div
            key={artisan.id}
            className={`flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors ${
              selectedId === artisan.id ? 'bg-accent/50' : ''
            }`}
            onClick={() => !isSubmitting && onSelect(artisan.id)}
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={artisan.avatar_url} alt={artisan.business_name} />
                <AvatarFallback>{getInitials(artisan.business_name)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{artisan.business_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {artisan.specialties?.join(', ')}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary/80 hover:bg-primary/10"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAssign(artisan.id);
                }}
              >
                <span className="mr-2">Assign</span>
                <CheckCircle className="h-4 w-4" />
              </Button>
              {isSubmitting && selectedId === artisan.id && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary ml-2"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
