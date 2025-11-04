import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayoutRequest {
  maker_id?: string;
  schedule_id?: string;
  force?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { maker_id, schedule_id, force = false }: PayoutRequest = await req.json();

    console.log('Processing maker payouts', { maker_id, schedule_id, force });

    let makersToProcess: string[] = [];

    if (maker_id) {
      // Process specific maker
      makersToProcess = [maker_id];
    } else {
      // Get all makers with pending earnings
      const { data: pendingEarnings, error: earningsError } = await supabase
        .from('maker_earnings')
        .select('maker_id')
        .eq('status', 'pending');

      if (earningsError) throw earningsError;

      makersToProcess = [...new Set(pendingEarnings?.map(e => e.maker_id) || [])];
    }

    const results = {
      processed: 0,
      skipped: 0,
      failed: 0,
      payouts: [] as any[],
    };

    for (const makerId of makersToProcess) {
      try {
        // Get maker's payout settings
        const { data: settings, error: settingsError } = await supabase
          .from('maker_payout_settings')
          .select('*')
          .eq('maker_id', makerId)
          .eq('is_active', true)
          .single();

        if (settingsError || !settings) {
          console.log(`Skipping maker ${makerId}: No active payout settings`);
          results.skipped++;
          continue;
        }

        // Calculate total pending earnings
        const { data: earnings, error: earningsError } = await supabase
          .from('maker_earnings')
          .select('*')
          .eq('maker_id', makerId)
          .eq('status', 'pending');

        if (earningsError) throw earningsError;

        const totalAmount = earnings?.reduce((sum, e) => sum + parseFloat(e.total_earnings), 0) || 0;

        // Check minimum payout amount
        if (!force && totalAmount < (settings.minimum_payout_amount || 50)) {
          console.log(`Skipping maker ${makerId}: Below minimum payout (${totalAmount} < ${settings.minimum_payout_amount})`);
          results.skipped++;
          continue;
        }

        // Call database function to process payout
        const { data: payoutId, error: payoutError } = await supabase
          .rpc('process_maker_payout', { p_maker_id: makerId });

        if (payoutError) throw payoutError;

        if (payoutId) {
          console.log(`Created payout ${payoutId} for maker ${makerId}`);
          results.processed++;
          results.payouts.push({
            maker_id: makerId,
            payout_id: payoutId,
            amount: totalAmount,
          });

          // Send notification to maker
          await supabase.from('user_notifications').insert({
            user_id: makerId,
            title: 'Payout Scheduled',
            message: `Your payout of $${totalAmount.toFixed(2)} has been scheduled and will be processed within 3 business days.`,
            notification_type: 'payout',
            metadata: { payout_id: payoutId, amount: totalAmount },
          });
        } else {
          results.skipped++;
        }
      } catch (error) {
        console.error(`Error processing payout for maker ${makerId}:`, error);
        results.failed++;
      }
    }

    // Update schedule if provided
    if (schedule_id) {
      const { error: scheduleError } = await supabase
        .from('payout_schedules')
        .update({
          last_run_at: new Date().toISOString(),
          next_run_at: calculateNextRun(await getSchedule(supabase, schedule_id)),
        })
        .eq('id', schedule_id);

      if (scheduleError) console.error('Error updating schedule:', scheduleError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing payouts:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function getSchedule(supabase: any, scheduleId: string) {
  const { data, error } = await supabase
    .from('payout_schedules')
    .select('*')
    .eq('id', scheduleId)
    .single();

  if (error) throw error;
  return data;
}

function calculateNextRun(schedule: any): string {
  const now = new Date();
  let nextRun = new Date(now);

  if (schedule.frequency === 'weekly') {
    const daysUntilNext = (schedule.day_of_week - now.getDay() + 7) % 7 || 7;
    nextRun.setDate(now.getDate() + daysUntilNext);
  } else if (schedule.frequency === 'bi-weekly') {
    const daysUntilNext = (schedule.day_of_week - now.getDay() + 7) % 7 || 7;
    nextRun.setDate(now.getDate() + daysUntilNext + 7);
  } else if (schedule.frequency === 'monthly') {
    nextRun.setMonth(now.getMonth() + 1);
    nextRun.setDate(schedule.day_of_month);
    if (nextRun < now) {
      nextRun.setMonth(nextRun.getMonth() + 1);
    }
  }

  return nextRun.toISOString();
}
