
import { supabase } from "@/integrations/supabase/client";
import { RateLimiter } from "@/utils/security";

// Rate limiter for admin operations
export const adminRateLimiter = new RateLimiter(10, 60000); // 10 operations per minute

/**
 * Validate admin operation with rate limiting
 */
export const validateAdminOperation = async (operation: string): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.id) {
      return false;
    }

    // Check rate limiting
    if (!adminRateLimiter.isAllowed(session.session.user.id)) {
      throw new Error("Rate limit exceeded: Too many admin operations. Please wait before trying again.");
    }

    // Check recent operations in audit logs - max 20 admin operations per minute
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    
    const { data: recentOperations } = await supabase
      .from("audit_logs")
      .select("log_id")
      .eq("user_id", session.session.user.id)
      .like("action", "admin_%")
      .gte("action_time", oneMinuteAgo);

    if (recentOperations && recentOperations.length >= 20) {
      throw new Error("Rate limit exceeded: Too many admin operations. Please wait before trying again.");
    }

    return true;
  } catch (error) {
    console.error("Admin operation validation failed:", error);
    return false;
  }
};
