import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-QUOTE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Use anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Use service role key for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { quoteId, quoteType } = await req.json();
    if (!quoteId || !quoteType) throw new Error("Missing quoteId or quoteType");
    logStep("Request parsed", { quoteId, quoteType });

    // Determine the table based on quote type
    const tableName = quoteType === 'artisan' ? 'artisan_quotes' : 'quote_requests';
    
    // Fetch quote details
    const { data: quote, error: quoteError } = await supabaseService
      .from(tableName)
      .select('*')
      .eq('id', quoteId)
      .eq('user_id', user.id)
      .single();

    if (quoteError || !quote) {
      throw new Error(`Quote not found or access denied: ${quoteError?.message}`);
    }
    logStep("Quote fetched", { quoteId, amount: quote.amount, status: quote.status });

    // Validate quote is ready for payment
    if (!quote.amount || quote.amount <= 0) {
      throw new Error("Quote does not have a valid amount");
    }
    if (quote.payment_status === 'paid') {
      throw new Error("Quote has already been paid");
    }
    if (quote.status !== 'quoted' && quote.status !== 'accepted') {
      throw new Error("Quote is not ready for payment");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if Stripe customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Create checkout session for one-time payment
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Custom ${quoteType} Work`,
              description: quote.product_details,
            },
            unit_amount: Math.round(quote.amount * 100), // Convert to pence
          },
          quantity: quote.quantity || 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/orders?payment=success&quote=${quoteId}`,
      cancel_url: `${origin}/orders?payment=cancelled&quote=${quoteId}`,
      metadata: {
        quote_id: quoteId,
        quote_type: quoteType,
        user_id: user.id,
      },
    });
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Update quote with session ID and mark as payment pending
    const { error: updateError } = await supabaseService
      .from(tableName)
      .update({
        stripe_session_id: session.id,
        payment_status: 'pending',
        status: 'payment_pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', quoteId);

    if (updateError) {
      logStep("Error updating quote", { error: updateError.message });
      throw new Error(`Failed to update quote: ${updateError.message}`);
    }
    logStep("Quote updated with session ID");

    return new Response(JSON.stringify({ 
      success: true,
      url: session.url,
      sessionId: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-quote-payment", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});