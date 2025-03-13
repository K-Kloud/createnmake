
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Manufacturer {
  id: string;
  business_name: string;
  business_type: string;
  specialties: string[];
}

interface ManufacturerListProps {
  onSelect: (manufacturerId: string) => void;
  isSubmitting?: boolean;
  selectedId?: string;
  imageId?: number;
}

export const ManufacturerList = ({ onSelect, isSubmitting = false, selectedId, imageId }: ManufacturerListProps) => {
  const { data: manufacturers, isLoading } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('id, business_name, business_type, specialties')
        .eq('is_verified', true);

      if (error) {
        console.error('Error fetching manufacturers:', error);
        return [];
      }
      return data as Manufacturer[];
    },
  });

  const handleAssign = async (manufacturerId: string) => {
    if (!imageId) return;
    
    try {
      const { error } = await supabase
        .from('generated_images')
        .update({ assigned_manufacturer_id: manufacturerId })
        .eq('id', imageId);

      if (error) throw error;
      
      onSelect(manufacturerId);
      toast({
        title: "Manufacturer assigned",
        description: "The manufacturer has been successfully assigned to this item."
      });
    } catch (error) {
      console.error('Error assigning manufacturer:', error);
      toast({
        title: "Error",
        description: "Failed to assign manufacturer. Please try again.",
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

  if (!manufacturers || manufacturers.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        No manufacturers found
      </p>
    );
  }

  return (
    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {manufacturers.map((manufacturer) => (
          <div
            key={manufacturer.id}
            className={`flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors ${
              selectedId === manufacturer.id ? 'bg-accent/50' : ''
            }`}
            onClick={() => !isSubmitting && onSelect(manufacturer.id)}
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{getInitials(manufacturer.business_name)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{manufacturer.business_name}</h3>
                <p className="text-sm text-muted-foreground">{manufacturer.business_type}</p>
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
                  handleAssign(manufacturer.id);
                }}
              >
                <span className="mr-2">Assign</span>
                <CheckCircle className="h-4 w-4" />
              </Button>
              {isSubmitting && selectedId === manufacturer.id && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary ml-2"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
