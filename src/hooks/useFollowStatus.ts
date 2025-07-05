import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "./use-toast";

export const useFollowStatus = (targetUserId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const followQuery = useQuery({
    queryKey: ['follow-status', user?.id, targetUserId],
    queryFn: async () => {
      if (!user?.id || !targetUserId) return false;
      
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    },
    enabled: !!user?.id && !!targetUserId,
  });

  const followMutation = useMutation({
    mutationFn: async (isFollowing: boolean) => {
      if (!user?.id || !targetUserId) throw new Error('Authentication required');

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
        
        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });
        
        if (error) throw error;
      }
    },
    onSuccess: (_, isFollowing) => {
      queryClient.invalidateQueries({ queryKey: ['follow-status'] });
      queryClient.invalidateQueries({ queryKey: ['creator-stats'] });
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing ? "You unfollowed this creator" : "You are now following this creator",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
      console.error('Follow error:', error);
    },
  });

  return {
    isFollowing: followQuery.data ?? false,
    isLoading: followQuery.isLoading,
    toggleFollow: () => followMutation.mutate(followQuery.data ?? false),
    isToggling: followMutation.isPending,
  };
};