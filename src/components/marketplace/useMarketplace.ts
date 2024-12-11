import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useMarketplace = () => {
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

      try {
        if (hasLiked) {
          // If already liked, remove the like
          const { error: deleteLikeError } = await supabase
            .from('image_likes')
            .delete()
            .eq('image_id', imageId)
            .eq('user_id', session.user.id);

          if (deleteLikeError) throw deleteLikeError;

          const { error: updateLikesError } = await supabase
            .from('generated_images')
            .update({ likes: images?.find(img => img.id === imageId)?.likes - 1 || 0 })
            .eq('id', imageId);

          if (updateLikesError) throw updateLikesError;
        } else {
          // Check if like already exists
          const { data: existingLike, error: checkError } = await supabase
            .from('image_likes')
            .select()
            .eq('image_id', imageId)
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (checkError) throw checkError;

          if (existingLike) {
            toast({
              title: "Already Liked",
              description: "You have already liked this image",
              variant: "destructive",
            });
            return;
          }

          // If not liked, add the like
          const { error: insertLikeError } = await supabase
            .from('image_likes')
            .insert({ image_id: imageId, user_id: session.user.id });

          if (insertLikeError) throw insertLikeError;

          const { error: updateLikesError } = await supabase
            .from('generated_images')
            .update({ likes: images?.find(img => img.id === imageId)?.likes + 1 || 1 })
            .eq('id', imageId);

          if (updateLikesError) throw updateLikesError;
        }
      } catch (error: any) {
        console.error('Like mutation error:', error);
        throw error;
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

  return {
    session,
    images,
    isLoading,
    likeMutation,
    viewMutation,
    toast
  };
};