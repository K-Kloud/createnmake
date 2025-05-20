
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import Stripe from "https://esm.sh/stripe@12.0.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

// Create Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    return new Response("Missing stripe signature", { status: 400 });
  }
  
  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!webhookSecret) {
      console.error("Missing Stripe webhook secret!");
      return new Response("Webhook secret not configured", { status: 500 });
    }
    
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`Webhook event received: ${event.type}`);
    
    // Handle specific events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        
        // Get necessary data from session metadata
        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id;
        
        if (!userId || !planId) {
          console.error("Missing user_id or plan_id in session metadata");
          return new Response("Missing metadata", { status: 400 });
        }
        
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        
        // Get plan details from database
        const { data: plan } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("id", planId)
          .single();
        
        if (!plan) {
          console.error(`Plan not found: ${planId}`);
          return new Response("Plan not found", { status: 400 });
        }
        
        // Insert or update subscription in database
        const { error: subscriptionError } = await supabase
          .from("creator_subscriptions")
          .upsert({
            user_id: userId,
            plan_id: planId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          });
        
        if (subscriptionError) {
          console.error(`Error creating subscription: ${subscriptionError.message}`);
          return new Response("Error creating subscription", { status: 500 });
        }
        
        // Update user profile with subscription tier and limits
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            is_creator: true,
            creator_tier: plan.name.toLowerCase(),
            monthly_image_limit: plan.monthly_image_limit,
            subscription_updated_at: new Date().toISOString()
          })
          .eq("id", userId);
        
        if (profileError) {
          console.error(`Error updating profile: ${profileError.message}`);
          return new Response("Error updating profile", { status: 500 });
        }
        
        console.log(`Subscription created for user ${userId} with plan ${planId}`);
        break;
      }
      
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        
        // Get the subscription from our database
        const { data: subscriptionData } = await supabase
          .from("creator_subscriptions")
          .select("user_id, plan_id")
          .eq("stripe_subscription_id", subscription.id)
          .maybeSingle();
        
        if (!subscriptionData) {
          console.error(`Subscription not found: ${subscription.id}`);
          return new Response("Subscription not found", { status: 400 });
        }
        
        // Update subscription status
        const { error: updateError } = await supabase
          .from("creator_subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        
        console.log(`Updated subscription ${subscription.id} status to ${subscription.status}`);
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        
        // Get the subscription from our database
        const { data: subscriptionData } = await supabase
          .from("creator_subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .maybeSingle();
        
        if (!subscriptionData) {
          console.error(`Subscription not found: ${subscription.id}`);
          return new Response("Subscription not found", { status: 400 });
        }
        
        // Update subscription status
        await supabase
          .from("creator_subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        
        // Reset user profile to free tier
        await supabase
          .from("profiles")
          .update({
            creator_tier: "free",
            monthly_image_limit: 5,
            subscription_updated_at: new Date().toISOString()
          })
          .eq("id", subscriptionData.user_id);
        
        console.log(`Subscription ${subscription.id} canceled for user ${subscriptionData.user_id}`);
        break;
      }
    }
    
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error(`Webhook error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
