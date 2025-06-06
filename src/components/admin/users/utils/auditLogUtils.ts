
import { supabase } from "@/integrations/supabase/client";

/**
 * Enhanced audit log for admin operations with security context
 */
export const logAdminOperation = async (
  operation: string, 
  targetUserId: string, 
  role: string,
  success: boolean,
  additionalContext?: Record<string, any>
) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.id) return;

    // Get user agent and IP for security context
    const securityContext = {
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      session_id: session.session.access_token.substring(0, 8) + '...',
      ...additionalContext
    };

    await supabase
      .from("audit_logs")
      .insert({
        user_id: session.session.user.id,
        action: `admin_${operation}`,
        action_details: {
          target_user_id: targetUserId,
          role: role,
          success: success,
          security_context: securityContext
        }
      });
  } catch (error) {
    console.error("Failed to log admin operation:", error);
  }
};
