import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ImageCard } from "@/components/gallery/ImageCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export const OpenMarketSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: images, isLoading } = useQuery({
    queryKey: ['marketplaceImages'],
    queryFn: async () => {
      const { data: imagesData, error: imagesError } = await supabase
        .from('generated_images')
        .select(`
          id,
          image_url,
          prompt,
          likes,
          views,
          created_at,
          user_id,
          is_public,
          image_likes (user_id)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (imagesError) throw imagesError;

      const userIds = imagesData.map(image => image.user_id).filter(Boolean);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      return imagesData.map(image => ({
        id: image.id,
        url: image.image_url,
        prompt: image.prompt,
        likes: image.likes || 0,
        comments: [],
        views: image.views || 0,
        produced: 0,
        creator: {
          name: profilesData?.find(profile => profile.id === image.user_id)?.username || 'Anonymous',
          avatar: "https://github.com/shadcn.png"
        },
        createdAt: new Date(image.created_at),
        hasLiked: image.image_likes?.some(like => like.user_id === session?.user?.id) || false
      }));
    },
    enabled: true,
  });

  const likeMutation = useMutation({
    mutationFn: async ({ imageId, hasLiked }: { imageId: number; hasLiked: boolean }) => {
      if (!session?.user) {
        throw new Error('Must be logged in to like images');
      }

      if (hasLiked) {
        await supabase
          .from('image_likes')
          .delete()
          .eq('image_id', imageId)
          .eq('user_id', session.user.id);

        await supabase
          .from('generated_images')
          .update({ likes: images?.find(img => img.id === imageId)?.likes - 1 || 0 })
          .eq('id', imageId);
      } else {
        await supabase
          .from('image_likes')
          .insert({ image_id: imageId, user_id: session.user.id });

        await supabase
          .from('generated_images')
          .update({ likes: images?.find(img => img.id === imageId)?.likes + 1 || 1 })
          .eq('id', imageId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceImages'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const viewMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const currentViews = images?.find(img => img.id === imageId)?.views || 0;
      const { error } = await supabase
        .from('generated_images')
        .update({ views: currentViews + 1 })
        .eq('id', imageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceImages'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update view count",
        variant: "destructive",
      });
    },
  });

  const handleLike = (imageId: number) => {
    const image = images?.find(img => img.id === imageId);
    if (!image) return;

    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like images",
        variant: "destructive",
      });
      return;
    }

    likeMutation.mutate({ imageId, hasLiked: image.hasLiked });
  };

  const handleView = (imageId: number) => {
    viewMutation.mutate(imageId);
  };

  const handleAddComment = (imageId: number, commentText: string) => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }
    console.log('Comment added to image:', imageId, commentText);
  };

  const handleAddReply = (imageId: number, commentId: number, replyText: string) => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to reply",
        variant: "destructive",
      });
      return;
    }
    console.log('Reply added to comment:', commentId, replyText);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <section className="py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold gradient-text rounded-lg">OpenMarket</h2>
        <Button 
          onClick={() => navigate("/marketplace")}
          variant="outline"
        >
          View All
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images?.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onLike={handleLike}
            onView={handleView}
            onAddComment={handleAddComment}
            onAddReply={handleAddReply}
          />
        ))}
      </div>
    </section>
  );
};