
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[OPERATIONAL-CONNECTORS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Operational connector started");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, system, data } = await req.json();
    logStep("Processing operational action", { action, system });

    switch (action) {
      case 'sync_inventory':
        return await syncInventorySystem(supabase, system, data);
      
      case 'update_shipping':
        return await updateShippingStatus(supabase, system, data);
      
      case 'sync_customer_service':
        return await syncCustomerServiceTickets(supabase, system);
      
      case 'backup_data':
        return await initiateDataBackup(supabase, system);
      
      case 'sync_analytics':
        return await syncAnalyticsData(supabase, system);
      
      default:
        throw new Error('Invalid operational action');
    }
  } catch (error) {
    console.error('Operational connector error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function syncInventorySystem(supabase: any, system: string, data: any) {
  // Get current orders that need inventory allocation
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'pending');

  const inventoryUpdates = [];
  
  for (const order of orders || []) {
    // Mock inventory check
    const inventoryStatus = await checkInventoryAvailability(order, system);
    
    if (inventoryStatus.available) {
      // Reserve inventory
      await supabase
        .from('orders')
        .update({ 
          status: 'inventory_reserved',
          inventory_reserved_at: new Date().toISOString(),
          inventory_system: system
        })
        .eq('id', order.id);

      inventoryUpdates.push({
        order_id: order.id,
        status: 'reserved',
        system: system
      });
    } else {
      // Mark as backordered
      await supabase
        .from('orders')
        .update({ 
          status: 'backordered',
          backorder_reason: inventoryStatus.reason
        })
        .eq('id', order.id);

      inventoryUpdates.push({
        order_id: order.id,
        status: 'backordered',
        reason: inventoryStatus.reason
      });
    }
  }

  return new Response(
    JSON.stringify({ 
      inventory_updates: inventoryUpdates.length,
      updates: inventoryUpdates 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateShippingStatus(supabase: any, system: string, data: any) {
  // Get orders ready for shipping
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'inventory_reserved');

  const shippingUpdates = [];
  
  for (const order of orders || []) {
    // Create shipping label and tracking
    const shippingInfo = await createShippingLabel(order, system);
    
    await supabase
      .from('orders')
      .update({ 
        status: 'shipped',
        tracking_number: shippingInfo.tracking_number,
        shipping_carrier: shippingInfo.carrier,
        shipped_at: new Date().toISOString(),
        estimated_delivery: shippingInfo.estimated_delivery
      })
      .eq('id', order.id);

    // Send shipping notification
    await supabase
      .from('user_notifications')
      .insert({
        user_id: order.user_id,
        title: 'Order Shipped!',
        message: `Your order has been shipped. Tracking: ${shippingInfo.tracking_number}`,
        notification_type: 'shipping',
        metadata: { 
          order_id: order.id,
          tracking_number: shippingInfo.tracking_number 
        }
      });

    shippingUpdates.push({
      order_id: order.id,
      tracking_number: shippingInfo.tracking_number,
      carrier: shippingInfo.carrier
    });
  }

  return new Response(
    JSON.stringify({ 
      shipping_updates: shippingUpdates.length,
      updates: shippingUpdates 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function syncCustomerServiceTickets(supabase: any, system: string) {
  // Get unresolved support tickets
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*')
    .in('status', ['open', 'in_progress']);

  const ticketUpdates = [];
  
  for (const ticket of tickets || []) {
    // Mock external system sync
    const externalTicket = await syncWithExternalSupport(ticket, system);
    
    await supabase
      .from('support_tickets')
      .update({ 
        external_ticket_id: externalTicket.id,
        external_system: system,
        sync_status: 'synced',
        last_synced_at: new Date().toISOString()
      })
      .eq('id', ticket.id);

    ticketUpdates.push({
      ticket_id: ticket.id,
      external_id: externalTicket.id,
      system: system
    });
  }

  return new Response(
    JSON.stringify({ 
      tickets_synced: ticketUpdates.length,
      updates: ticketUpdates 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function initiateDataBackup(supabase: any, system: string) {
  // Get critical data for backup
  const backupTables = [
    'profiles',
    'generated_images',
    'orders',
    'creator_subscriptions'
  ];

  const backupResults = [];
  
  for (const table of backupTables) {
    try {
      const { data, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' });

      // Mock backup to external system
      const backupId = await backupToExternalSystem(data, table, system);
      
      await supabase
        .from('audit_logs')
        .insert({
          action: 'data_backup_completed',
          action_details: {
            table: table,
            record_count: count,
            backup_id: backupId,
            backup_system: system,
            backup_date: new Date().toISOString()
          }
        });

      backupResults.push({
        table: table,
        records: count,
        backup_id: backupId,
        status: 'success'
      });
    } catch (error) {
      backupResults.push({
        table: table,
        status: 'failed',
        error: error.message
      });
    }
  }

  return new Response(
    JSON.stringify({ 
      backup_completed: true,
      results: backupResults 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function syncAnalyticsData(supabase: any, system: string) {
  // Get analytics data for external sync
  const { data: analytics } = await supabase
    .from('page_analytics')
    .select('*')
    .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  // Aggregate analytics data
  const aggregated = {
    total_pageviews: analytics?.length || 0,
    unique_users: new Set(analytics?.map(a => a.user_id)).size,
    popular_pages: aggregatePopularPages(analytics || []),
    sync_timestamp: new Date().toISOString()
  };

  // Mock sync to external analytics system
  const syncResult = await syncToExternalAnalytics(aggregated, system);

  await supabase
    .from('audit_logs')
    .insert({
      action: 'analytics_sync_completed',
      action_details: {
        ...aggregated,
        external_sync_id: syncResult.id,
        system: system
      }
    });

  return new Response(
    JSON.stringify({ 
      analytics_synced: true,
      data: aggregated,
      external_sync_id: syncResult.id 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Mock external system functions
async function checkInventoryAvailability(order: any, system: string) {
  return {
    available: Math.random() > 0.2, // 80% availability
    reason: Math.random() > 0.2 ? null : 'Out of stock'
  };
}

async function createShippingLabel(order: any, system: string) {
  return {
    tracking_number: `TRACK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    carrier: 'UPS',
    estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  };
}

async function syncWithExternalSupport(ticket: any, system: string) {
  return {
    id: `EXT${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    status: 'synced'
  };
}

async function backupToExternalSystem(data: any, table: string, system: string) {
  return `BACKUP${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

async function syncToExternalAnalytics(data: any, system: string) {
  return {
    id: `ANALYTICS${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    status: 'synced'
  };
}

function aggregatePopularPages(analytics: any[]) {
  const pageCount: { [key: string]: number } = {};
  
  analytics.forEach(a => {
    pageCount[a.page_path] = (pageCount[a.page_path] || 0) + 1;
  });
  
  return Object.entries(pageCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([page, count]) => ({ page, views: count }));
}
