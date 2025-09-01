
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import Stripe from "https://esm.sh/stripe@12.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    logStep("Function started");
    
    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }
    
    logStep("User authenticated", { userId: user.id });
    
    // Get profile details
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (profileError) {
      throw new Error(`Profile error: ${profileError.message}`);
    }
    
    // Get accurate monthly image count using the database function
    const { data: monthlyCount, error: countError } = await supabase
      .rpc('get_monthly_images_generated', { user_uuid: user.id });
    
    if (countError) {
      console.error('Error getting monthly count:', countError);
    }
    
    const actualMonthlyCount = monthlyCount || 0;
    
    logStep("Profile retrieved", { 
      currentTier: profile.creator_tier,
      imagesGenerated: profile.images_generated_count,
      actualMonthlyCount: actualMonthlyCount,
      limit: profile.monthly_image_limit
    });
    
    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe key not configured");
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });
    
    // Get subscription from database
    const { data: subscription, error: subError } = await supabase
      .from("creator_subscriptions")
      .select("*, subscription_plans(*)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    
    // If we have a Stripe subscription ID, verify with Stripe
    if (subscription?.stripe_subscription_id) {
      logStep("Verifying subscription with Stripe", { subId: subscription.stripe_subscription_id });
      
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
        
        const isActive = stripeSubscription.status === "active";
        const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000).toISOString();
        
        logStep("Stripe subscription verified", { 
          isActive, 
          status: stripeSubscription.status,
          currentPeriodEnd 
        });
        
        // Update profile and subscription if needed
        if (isActive) {
          // Update subscription details
          await supabase
            .from("creator_subscriptions")
            .update({
              status: stripeSubscription.status,
              current_period_end: currentPeriodEnd,
              cancel_at_period_end: stripeSubscription.cancel_at_period_end,
              updated_at: new Date().toISOString()
            })
            .eq("id", subscription.id);
          
          // Update profile with tier info and limits
          await supabase
            .from("profiles")
            .update({
              is_creator: true,
              creator_tier: subscription.subscription_plans.name.toLowerCase(),
              monthly_image_limit: subscription.subscription_plans.monthly_image_limit,
              subscription_updated_at: new Date().toISOString()
            })
            .eq("id", user.id);
          
          logStep("Updated subscription and profile");
          
          return new Response(JSON.stringify({
            tier: subscription.subscription_plans.name.toLowerCase(),
            is_active: isActive,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
            monthly_image_limit: subscription.subscription_plans.monthly_image_limit,
            images_generated: actualMonthlyCount
          }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else {
          // Subscription is not active in Stripe
          await supabase
            .from("creator_subscriptions")
            .update({
              status: stripeSubscription.status,
              updated_at: new Date().toISOString()
            })
            .eq("id", subscription.id);
          
          // Reset profile to free tier
          await supabase
            .from("profiles")
            .update({
              creator_tier: "free",
              monthly_image_limit: 10,
              subscription_updated_at: new Date().toISOString()
            })
            .eq("id", user.id);
          
          logStep("Subscription inactive, reset to free tier");
        }
      } catch (stripeError) {
        logStep("Error verifying Stripe subscription", { error: stripeError.message });
        // If Stripe verification fails, proceed with local data
      }
    }
    
    // Return current subscription status from profile
    return new Response(JSON.stringify({
      tier: profile.creator_tier || "free",
      is_active: true, // Always active for image generation
      monthly_image_limit: profile.monthly_image_limit || 10,
      images_generated: actualMonthlyCount
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CHECK-SUBSCRIPTION] ERROR: ${errorMessage}`);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
