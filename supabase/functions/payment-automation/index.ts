
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import Stripe from "https://esm.sh/stripe@12.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYMENT-AUTOMATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payment automation started");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    const { action, payment_data } = await req.json();
    logStep("Processing action", { action });

    switch (action) {
      case 'process_bulk_payments':
        return await processBulkPayments(stripe, supabase);
      
      case 'reconcile_payments':
        return await reconcilePayments(stripe, supabase);
      
      case 'generate_invoices':
        return await generateInvoices(stripe, supabase);
      
      case 'handle_failed_payments':
        return await handleFailedPayments(stripe, supabase);
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Payment automation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function processBulkPayments(stripe: any, supabase: any) {
  // Get pending payments
  const { data: pendingPayments } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'pending');

  const results = [];
  
  for (const payment of pendingPayments || []) {
    try {
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: payment.amount,
        currency: payment.currency || 'usd',
        metadata: { order_id: payment.id }
      });

      // Update order with payment intent
      await supabase
        .from('orders')
        .update({ 
          stripe_payment_intent: paymentIntent.id,
          status: 'processing' 
        })
        .eq('id', payment.id);

      results.push({ order_id: payment.id, status: 'processed' });
    } catch (error) {
      results.push({ order_id: payment.id, status: 'failed', error: error.message });
    }
  }

  return new Response(
    JSON.stringify({ processed: results.length, results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function reconcilePayments(stripe: any, supabase: any) {
  // Get all payments from last 24 hours
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const payments = await stripe.paymentIntents.list({
    created: { gte: Math.floor(yesterday.getTime() / 1000) },
    limit: 100
  });

  const reconciled = [];
  
  for (const payment of payments.data) {
    const orderId = payment.metadata?.order_id;
    if (orderId) {
      await supabase
        .from('orders')
        .update({ 
          status: payment.status === 'succeeded' ? 'completed' : 'failed',
          payment_reconciled_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      reconciled.push(orderId);
    }
  }

  return new Response(
    JSON.stringify({ reconciled: reconciled.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateInvoices(stripe: any, supabase: any) {
  // Get completed orders without invoices
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'completed')
    .is('invoice_generated', null);

  const invoices = [];
  
  for (const order of orders || []) {
    try {
      const invoice = await stripe.invoices.create({
        customer: order.stripe_customer_id,
        collection_method: 'send_invoice',
        days_until_due: 30,
        metadata: { order_id: order.id }
      });

      await supabase
        .from('orders')
        .update({ 
          invoice_generated: true,
          stripe_invoice_id: invoice.id
        })
        .eq('id', order.id);

      invoices.push(invoice.id);
    } catch (error) {
      console.error(`Failed to generate invoice for order ${order.id}:`, error);
    }
  }

  return new Response(
    JSON.stringify({ invoices_generated: invoices.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleFailedPayments(stripe: any, supabase: any) {
  // Get failed payments
  const { data: failedOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'failed');

  const retried = [];
  
  for (const order of failedOrders || []) {
    try {
      // Retry payment intent
      if (order.stripe_payment_intent) {
        await stripe.paymentIntents.confirm(order.stripe_payment_intent, {
          return_url: 'https://your-domain.com/payment-return'
        });
        
        retried.push(order.id);
      }
    } catch (error) {
      console.error(`Failed to retry payment for order ${order.id}:`, error);
    }
  }

  return new Response(
    JSON.stringify({ retried: retried.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
