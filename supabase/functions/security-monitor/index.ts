/**
 * Enhanced Security Edge Function
 * Handles advanced threat detection and mitigation
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SecurityThreat {
  type: 'xss' | 'sql_injection' | 'csrf' | 'brute_force' | 'data_exfiltration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  payload: string;
  user_agent: string;
  ip_address: string;
  user_id?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { threat, action } = await req.json();

    if (action === 'analyze_threat') {
      const analysis = await analyzeThreat(threat);
      
      // Log the threat
      await supabase.from('security_events').insert({
        event_type: threat.type,
        severity: threat.severity,
        details: {
          payload: threat.payload.substring(0, 1000), // Limit payload size
          user_agent: threat.user_agent,
          analysis: analysis
        },
        user_id: threat.user_id,
        ip_address: threat.ip_address
      });

      // Take automated action if threat is critical
      if (threat.severity === 'critical') {
        await mitigateThreat(supabase, threat);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          analysis,
          action_taken: threat.severity === 'critical' ? 'mitigated' : 'logged'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'security_scan') {
      const { user_id, scan_type } = threat;
      
      const scanResults = await performSecurityScan(supabase, user_id, scan_type);
      
      return new Response(
        JSON.stringify({ success: true, results: scanResults }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Security function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeThreat(threat: SecurityThreat): Promise<object> {
  const analysis = {
    risk_score: 0,
    indicators: [] as string[],
    recommendations: [] as string[]
  };

  // XSS Analysis
  if (threat.type === 'xss') {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /eval\(/i,
      /document\./i
    ];

    xssPatterns.forEach(pattern => {
      if (pattern.test(threat.payload)) {
        analysis.risk_score += 20;
        analysis.indicators.push(`XSS pattern detected: ${pattern.source}`);
      }
    });

    if (analysis.risk_score > 40) {
      analysis.recommendations.push('Block request immediately');
      analysis.recommendations.push('Review user permissions');
    }
  }

  // SQL Injection Analysis
  if (threat.type === 'sql_injection') {
    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /update\s+set/i
    ];

    sqlPatterns.forEach(pattern => {
      if (pattern.test(threat.payload)) {
        analysis.risk_score += 30;
        analysis.indicators.push(`SQL injection pattern: ${pattern.source}`);
      }
    });

    if (analysis.risk_score > 60) {
      analysis.recommendations.push('Immediate database security review');
      analysis.recommendations.push('Audit affected queries');
    }
  }

  // Brute Force Analysis
  if (threat.type === 'brute_force') {
    analysis.risk_score += 25;
    analysis.indicators.push('Rapid authentication attempts detected');
    analysis.recommendations.push('Implement account lockout');
    analysis.recommendations.push('Enable MFA for affected accounts');
  }

  return analysis;
}

async function mitigateThreat(supabase: any, threat: SecurityThreat): Promise<void> {
  try {
    // If user is identified, temporarily suspend account for critical threats
    if (threat.user_id && threat.severity === 'critical') {
      await supabase.from('user_security_flags').upsert({
        user_id: threat.user_id,
        flag_type: 'temporary_suspension',
        reason: `Critical security threat: ${threat.type}`,
        expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour suspension
        metadata: {
          threat_details: threat,
          auto_mitigation: true
        }
      });
    }

    // Log the mitigation action
    await supabase.from('security_events').insert({
      event_type: 'threat_mitigation',
      severity: 'high',
      details: {
        original_threat: threat.type,
        mitigation_action: 'temporary_suspension',
        automated: true
      },
      user_id: threat.user_id,
      ip_address: threat.ip_address
    });

  } catch (error) {
    console.error('Threat mitigation failed:', error);
  }
}

async function performSecurityScan(supabase: any, user_id: string, scan_type: string): Promise<object> {
  const results = {
    scan_type,
    findings: [] as any[],
    risk_level: 'low' as string,
    recommendations: [] as string[]
  };

  try {
    if (scan_type === 'user_permissions') {
      // Check for excessive permissions
      const { data: userRoles } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', user_id);

      if (userRoles && userRoles.length > 1) {
        results.findings.push({
          type: 'multiple_admin_roles',
          severity: 'medium',
          details: 'User has multiple administrative roles'
        });
        results.risk_level = 'medium';
      }
    }

    if (scan_type === 'recent_activity') {
      // Check for suspicious activity patterns
      const { data: recentActions } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user_id)
        .gte('action_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('action_time', { ascending: false })
        .limit(100);

      if (recentActions && recentActions.length > 50) {
        results.findings.push({
          type: 'high_activity_volume',
          severity: 'medium',
          details: `${recentActions.length} actions in last 24 hours`
        });
        results.risk_level = 'medium';
      }

      // Check for unusual action patterns
      const actionTypes = recentActions?.map(action => action.action) || [];
      const uniqueActions = new Set(actionTypes);
      
      if (uniqueActions.size > 10) {
        results.findings.push({
          type: 'diverse_action_pattern',
          severity: 'low',
          details: `${uniqueActions.size} different action types`
        });
      }
    }

    // Generate recommendations based on findings
    if (results.findings.length > 0) {
      results.recommendations.push('Review user permissions regularly');
      results.recommendations.push('Enable activity monitoring alerts');
      
      if (results.risk_level === 'medium') {
        results.recommendations.push('Consider implementing additional authentication factors');
      }
    }

  } catch (error) {
    console.error('Security scan error:', error);
    results.findings.push({
      type: 'scan_error',
      severity: 'low',
      details: 'Unable to complete full security scan'
    });
  }

  return results;
}