
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAutonomousFeatures = () => {
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Auto-refresh user profile data to sync with backend changes
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      return data;
    },
    enabled: !!session?.user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Monitor user activity and update metrics
  useEffect(() => {
    if (!session?.user?.id) return;

    const updateActivity = async () => {
      await supabase
        .from('activity_metrics')
        .insert({
          user_id: session.user.id,
          metric_type: 'session_activity',
          metric_value: 1,
          recorded_at: new Date().toISOString()
        });
    };

    // Update activity every 5 minutes while user is active
    const activityInterval = setInterval(updateActivity, 5 * 60 * 1000);
    
    // Update activity on page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(activityInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session?.user?.id]);

  // Auto-detect and handle generation limit warnings
  useEffect(() => {
    if (!profile) return;

    const usagePercentage = (profile.images_generated_count / profile.monthly_image_limit) * 100;
    
    if (usagePercentage >= 80 && usagePercentage < 95) {
      toast({
        title: "Approaching Limit",
        description: `You've used ${Math.round(usagePercentage)}% of your monthly generation limit.`,
        duration: 5000,
      });
    } else if (usagePercentage >= 95) {
      toast({
        title: "Nearly at Limit",
        description: "You're close to your monthly limit. Consider upgrading your plan.",
        variant: "destructive",
        duration: 8000,
      });
    }
  }, [profile?.images_generated_count, profile?.monthly_image_limit, toast]);

  return {
    profile,
    refetchProfile,
    isActive: !!session?.user?.id
  };
};
