
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlan, SubscriptionStatus } from "@/types";

export function useSubscription() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  // Fetch subscription plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price", { ascending: true });
        
      if (error) throw error;
      
      // Transform the features JSON to ensure it's an array of strings
      return data.map(plan => ({
        ...plan,
        features: typeof plan.features === 'string' 
          ? JSON.parse(plan.features) 
          : Array.isArray(plan.features) 
            ? plan.features 
            : []
      })) as SubscriptionPlan[];
    },
    enabled: true,
  });
  
  // Fetch user's subscription status
  const { 
    data: subscriptionStatus, 
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ["subscriptionStatus", userId],
    queryFn: async () => {
      if (!session?.access_token) throw new Error("Not authenticated");
      
      try {
        const { data, error } = await supabase.functions.invoke("check-subscription", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        
        if (error) throw error;
        if (!data.success) throw new Error(data.error || "Failed to check subscription");
        
        return data.subscription as SubscriptionStatus;
      } catch (error) {
        // Fallback: return a basic free plan with limited generations
        console.warn('Subscription check failed, using fallback:', error);
        return {
          tier: 'free',
          monthly_image_limit: 5,
          images_generated: 0,
          is_active: true,
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        } as SubscriptionStatus;
      }
    },
    enabled: !!userId && !!session?.access_token,
  });
  
  // Check if user can generate an image (always allow for testing, limit to 5 free images)
  const canGenerateImage = subscriptionStatus 
    ? subscriptionStatus.images_generated < subscriptionStatus.monthly_image_limit
    : true; // Allow generation by default for testing
  
  // Calculate remaining image count
  const remainingImages = subscriptionStatus 
    ? Math.max(0, subscriptionStatus.monthly_image_limit - subscriptionStatus.images_generated)
    : 5; // Default 5 free images for testing
  
  // Create checkout session
  const createCheckout = async (planId: number) => {
    if (!session?.access_token) throw new Error("Not authenticated");
    
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { planId },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    
    if (error) throw error;
    if (!data.url) throw new Error("No checkout URL returned");
    
    return data.url;
  };
  
  // Open customer portal
  const openCustomerPortal = async () => {
    if (!session?.access_token) throw new Error("Not authenticated");
    
    const { data, error } = await supabase.functions.invoke("customer-portal", {
      body: {},
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    
    if (error) throw error;
    if (!data.url) throw new Error("No portal URL returned");
    
    return data.url;
  };
  
  // Subscribe to a plan mutation
  const subscribeMutation = useMutation({
    mutationFn: createCheckout,
    onSuccess: (url) => {
      // Open the Stripe checkout in a new tab
      window.open(url, '_blank');
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Subscription Error",
        description: error.message || "Failed to create subscription checkout",
      });
    },
  });
  
  // Manage subscription mutation
  const manageSubscriptionMutation = useMutation({
    mutationFn: openCustomerPortal,
    onSuccess: (url) => {
      // Open the Stripe customer portal in a new tab
      window.open(url, '_blank');
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Subscription Management Error",
        description: error.message || "Failed to open subscription management portal",
      });
    },
  });

  return {
    plans,
    plansLoading,
    subscriptionStatus,
    statusLoading,
    statusError,
    refetchStatus,
    subscribe: subscribeMutation.mutate,
    manageSubscription: manageSubscriptionMutation.mutate,
    isSubscribing: subscribeMutation.isPending,
    isManaging: manageSubscriptionMutation.isPending,
    canGenerateImage,
    remainingImages,
  };
}
