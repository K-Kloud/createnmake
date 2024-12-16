import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export const UserImages = ({ userId }: { userId: string }) => {
  const { data: images = [] } = useQuery({
    queryKey: ['userImages', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!userId,
  });

  return (
    <Card className="col-span-full">
      <CardContent className="p-4">
        <ScrollArea className="h-[300px]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.image_url}
                  alt={image.title || image.prompt}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <div className="p-2 text-white text-sm">
                    <p className="font-bold">{image.title || 'Untitled'}</p>
                    <p className="line-clamp-2">{image.prompt}</p>
                  </div>
                </div>
              </div>
            ))}
            {images.length === 0 && (
              <p className="text-muted-foreground col-span-full text-center py-8">
                No images generated yet
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};