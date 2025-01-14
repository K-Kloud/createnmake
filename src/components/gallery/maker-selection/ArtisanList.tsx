import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface Artisan {
  id: string;
  business_name: string;
  specialties: string[];
  avatar_url?: string;
}

interface ArtisanListProps {
  onSelect: (artisanId: string) => void;
}

export const ArtisanList = ({ onSelect }: ArtisanListProps) => {
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
            className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer"
            onClick={() => onSelect(artisan.id)}
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
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};