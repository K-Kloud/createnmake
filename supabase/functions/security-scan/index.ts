import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityScanRequest {
  scanType: 'vulnerability' | 'compliance' | 'full';
}

interface SecurityVulnerability {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected_component: string;
  remediation: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user session
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    console.log('Starting security scan for user:', user.id);

    const { scanType }: SecurityScanRequest = await req.json();

    // Perform security scan based on type
    let scanResults = [];
    
    switch (scanType) {
      case 'vulnerability':
        scanResults = await performVulnerabilityScan();
        break;
      case 'compliance':
        scanResults = await performComplianceScan();
        break;
      case 'full':
        const vulnResults = await performVulnerabilityScan();
        const complianceResults = await performComplianceScan();
        scanResults = [...vulnResults, ...complianceResults];
        break;
      default:
        throw new Error('Invalid scan type');
    }

    // Log security scan start
    await supabase
      .from('security_events')
      .insert({
        event_type: 'access',
        severity: 'info',
        title: `Security scan initiated`,
        description: `${scanType} security scan started by user`,
        status: 'active',
        user_id: user.id,
        metadata: {
          scan_type: scanType,
          scan_id: crypto.randomUUID(),
          initiated_at: new Date().toISOString()
        }
      });

    // Process scan results and create security events for findings
    const criticalFindings = scanResults.filter(r => r.severity === 'critical');
    const highFindings = scanResults.filter(r => r.severity === 'high');

    // Create security events for critical and high severity findings
    if (criticalFindings.length > 0 || highFindings.length > 0) {
      for (const finding of [...criticalFindings, ...highFindings]) {
        await supabase
          .from('security_events')
          .insert({
            event_type: finding.type === 'vulnerability' ? 'vulnerability' : 'compliance',
            severity: finding.severity,
            title: finding.description,
            description: `Security scan detected: ${finding.description} in ${finding.affected_component}`,
            status: 'active',
            affected_systems: [finding.affected_component],
            metadata: {
              finding_id: finding.id,
              remediation: finding.remediation,
              scan_type: scanType,
              discovered_at: new Date().toISOString()
            }
          });
      }
    }

    console.log(`Security scan completed. Found ${scanResults.length} issues.`);

    return new Response(JSON.stringify({
      success: true,
      scanId: crypto.randomUUID(),
      scanType,
      findings: scanResults.length,
      criticalFindings: criticalFindings.length,
      highFindings: highFindings.length,
      completedAt: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error: any) {
    console.error('Error in security scan:', error);

    return new Response(JSON.stringify({ 
      error: error.message || 'Security scan failed'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
};

async function performVulnerabilityScan(): Promise<SecurityVulnerability[]> {
  // Mock vulnerability scan - in real implementation, this would integrate with security tools
  console.log('Performing vulnerability scan...');
  
  const vulnerabilities: SecurityVulnerability[] = [
    {
      id: crypto.randomUUID(),
      type: 'vulnerability',
      severity: 'medium',
      description: 'Outdated dependency detected',
      affected_component: 'Node.js packages',
      remediation: 'Update to latest version'
    },
    {
      id: crypto.randomUUID(),
      type: 'vulnerability',
      severity: 'low',
      description: 'Missing security headers',
      affected_component: 'Web server configuration',
      remediation: 'Add Content-Security-Policy headers'
    }
  ];

  // Simulate scan time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return vulnerabilities;
}

async function performComplianceScan(): Promise<SecurityVulnerability[]> {
  // Mock compliance scan - in real implementation, this would check GDPR, SOX, ISO 27001, etc.
  console.log('Performing compliance scan...');
  
  const complianceIssues: SecurityVulnerability[] = [
    {
      id: crypto.randomUUID(),
      type: 'compliance',
      severity: 'high',
      description: 'Data retention policy not implemented',
      affected_component: 'User data management',
      remediation: 'Implement automated data deletion for GDPR compliance'
    },
    {
      id: crypto.randomUUID(),
      type: 'compliance',
      severity: 'medium',
      description: 'Access log retention insufficient',
      affected_component: 'Audit logging',
      remediation: 'Extend log retention to meet SOX requirements'
    }
  ];

  // Simulate scan time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return complianceIssues;
}

serve(handler);