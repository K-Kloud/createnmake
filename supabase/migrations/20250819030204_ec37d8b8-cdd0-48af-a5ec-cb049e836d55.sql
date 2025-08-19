-- Fix critical security vulnerability: ai_model_configs table exposes sensitive business data
-- This migration restricts access to admin users only to protect competitive advantage

-- Drop the existing public read policy that exposes sensitive business data
DROP POLICY IF EXISTS "Public can view active model configs" ON ai_model_configs;

-- Ensure only admin management policy exists (keep existing admin access)
-- This policy should already exist but let's make sure it's properly configured
DROP POLICY IF EXISTS "Admins can manage AI model configs" ON ai_model_configs;

-- Create secure admin-only policy for AI model configurations
CREATE POLICY "Admins can manage AI model configs" ON ai_model_configs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Create a separate read-only policy for system/service operations if needed
CREATE POLICY "System can read model configs" ON ai_model_configs
  FOR SELECT
  TO service_role
  USING (true);

-- Add audit logging for this critical security fix
INSERT INTO audit_logs (
  action,
  action_details
) VALUES (
  'security_fix_ai_model_configs',
  jsonb_build_object(
    'description', 'Fixed critical business intelligence security vulnerability: restricted ai_model_configs access to admin users only',
    'issue', 'Public could read sensitive AI model costs, performance metrics, and configuration details',
    'exposed_data', jsonb_build_object(
      'cost_per_request', 'Pricing information ($0.0015-$0.03 per request)',
      'performance_metrics', 'Model performance and optimization data', 
      'configuration', 'AI model technical configurations',
      'competitive_risk', 'Competitors could undercut pricing or copy AI strategy'
    ),
    'fix', 'Removed public read access, restricted to admin users only',
    'timestamp', NOW()
  )
);