
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FraudAnalysis {
  risk_score: number; // 0-1 scale
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  recommendations: string[];
  confidence: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, user_id, transaction_data, order_data } = await req.json();

    console.log('Fraud detection request:', { action, user_id });

    switch (action) {
      case 'analyze_user_behavior':
        return await analyzeUserBehavior(user_id, supabaseClient);
      
      case 'check_transaction_risk':
        return await checkTransactionRisk(transaction_data, supabaseClient);
      
      case 'analyze_order_patterns':
        return await analyzeOrderPatterns(order_data, user_id, supabaseClient);
      
      case 'detect_account_anomalies':
        return await detectAccountAnomalies(user_id, supabaseClient);
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Fraud detection error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function analyzeUserBehavior(userId: string, supabase: any): Promise<Response> {
  // Get user activity patterns
  const { data: activities } = await supabase
    .from('activity_metrics')
    .select('*')
    .eq('user_id', userId)
    .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const { data: images } = await supabase
    .from('generated_images')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const analysis = performBehaviorAnalysis(activities, images);

  // Store fraud analysis in error logs for now
  await supabase
    .from('error_logs')
    .insert({
      user_id: userId,
      error_type: 'fraud_analysis',
      error_message: `Fraud risk analysis: ${analysis.risk_level}`,
      error_details: {
        analysis_type: 'user_behavior',
        risk_score: analysis.risk_score,
        flags: analysis.flags
      }
    });

  return new Response(
    JSON.stringify({ analysis }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function checkTransactionRisk(transactionData: any, supabase: any): Promise<Response> {
  const analysis = await performTransactionAnalysis(transactionData, supabase);

  return new Response(
    JSON.stringify({ analysis }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function analyzeOrderPatterns(orderData: any, userId: string, supabase: any): Promise<Response> {
  // Get user's order history
  const { data: orderHistory } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  const analysis = performOrderPatternAnalysis(orderData, orderHistory);

  return new Response(
    JSON.stringify({ analysis }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function detectAccountAnomalies(userId: string, supabase: any): Promise<Response> {
  // Get account data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: loginHistory } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('action', 'user_login')
    .order('created_at', { ascending: false })
    .limit(20);

  const analysis = performAnomalyDetection(profile, loginHistory);

  return new Response(
    JSON.stringify({ analysis }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function performBehaviorAnalysis(activities: any[], images: any[]): FraudAnalysis {
  let riskScore = 0;
  const flags: string[] = [];
  const recommendations: string[] = [];

  // Check image generation frequency
  if (images && images.length > 50) {
    riskScore += 0.3;
    flags.push('High image generation frequency');
    recommendations.push('Monitor for potential abuse of generation limits');
  }

  // Check for rapid account activity
  const recentActivities = activities?.filter(a => 
    new Date(a.recorded_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  if (recentActivities && recentActivities.length > 100) {
    riskScore += 0.4;
    flags.push('Unusually high activity in 24 hours');
    recommendations.push('Verify account legitimacy');
  }

  // Check for bot-like patterns
  const activityTimes = activities?.map(a => new Date(a.recorded_at).getHours()) || [];
  const uniqueHours = new Set(activityTimes);
  
  if (uniqueHours.size < 3 && activities && activities.length > 20) {
    riskScore += 0.5;
    flags.push('Activity concentrated in specific time periods (bot-like behavior)');
    recommendations.push('Implement CAPTCHA verification');
  }

  const riskLevel = getRiskLevel(riskScore);

  return {
    risk_score: Math.min(riskScore, 1),
    risk_level: riskLevel,
    flags,
    recommendations,
    confidence: 0.85
  };
}

function performTransactionAnalysis(transactionData: any, supabase: any): FraudAnalysis {
  let riskScore = 0;
  const flags: string[] = [];
  const recommendations: string[] = [];

  // Check for unusual amounts
  if (transactionData.amount > 1000) {
    riskScore += 0.2;
    flags.push('High transaction amount');
    recommendations.push('Require additional verification for high-value transactions');
  }

  // Check for rapid successive transactions
  if (transactionData.time_since_last_transaction < 60) { // Less than 60 seconds
    riskScore += 0.4;
    flags.push('Rapid successive transactions');
    recommendations.push('Implement transaction cooldown period');
  }

  // Check payment method risk
  if (transactionData.payment_method === 'cryptocurrency') {
    riskScore += 0.3;
    flags.push('High-risk payment method');
    recommendations.push('Enhanced verification for crypto payments');
  }

  const riskLevel = getRiskLevel(riskScore);

  return {
    risk_score: Math.min(riskScore, 1),
    risk_level: riskLevel,
    flags,
    recommendations,
    confidence: 0.75
  };
}

function performOrderPatternAnalysis(orderData: any, orderHistory: any[]): FraudAnalysis {
  let riskScore = 0;
  const flags: string[] = [];
  const recommendations: string[] = [];

  // Check for unusual order frequency
  const recentOrders = orderHistory?.filter(order => 
    new Date(order.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  if (recentOrders && recentOrders.length > 10) {
    riskScore += 0.4;
    flags.push('Unusually high order frequency');
    recommendations.push('Implement order rate limiting');
  }

  // Check for duplicate orders
  const duplicateOrders = orderHistory?.filter(order => 
    order.product_id === orderData.product_id && 
    Math.abs(new Date(order.created_at).getTime() - Date.now()) < 60000
  );

  if (duplicateOrders && duplicateOrders.length > 0) {
    riskScore += 0.6;
    flags.push('Potential duplicate order');
    recommendations.push('Implement duplicate order prevention');
  }

  const riskLevel = getRiskLevel(riskScore);

  return {
    risk_score: Math.min(riskScore, 1),
    risk_level: riskLevel,
    flags,
    recommendations,
    confidence: 0.80
  };
}

function performAnomalyDetection(profile: any, loginHistory: any[]): FraudAnalysis {
  let riskScore = 0;
  const flags: string[] = [];
  const recommendations: string[] = [];

  // Check for suspicious profile data
  if (!profile?.created_at || new Date(profile.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
    riskScore += 0.2;
    flags.push('Very new account');
    recommendations.push('Apply enhanced verification for new accounts');
  }

  // Check login patterns
  if (loginHistory && loginHistory.length > 20) {
    const loginTimes = loginHistory.map(log => new Date(log.created_at).getHours());
    const uniqueHours = new Set(loginTimes);
    
    if (uniqueHours.size < 2) {
      riskScore += 0.3;
      flags.push('Unusual login time patterns');
      recommendations.push('Monitor for automated login attempts');
    }
  }

  const riskLevel = getRiskLevel(riskScore);

  return {
    risk_score: Math.min(riskScore, 1),
    risk_level: riskLevel,
    flags,
    recommendations,
    confidence: 0.70
  };
}

function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 0.8) return 'critical';
  if (score >= 0.6) return 'high';
  if (score >= 0.3) return 'medium';
  return 'low';
}
