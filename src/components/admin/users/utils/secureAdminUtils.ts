
import { supabase } from "@/integrations/supabase/client";

/**
 * Securely check if a user has a specific admin role using the new SECURITY DEFINER function
 */
export const checkUserAdminRole = async (userId: string, role?: "admin" | "super_admin"): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_user_admin_role_secure', {
      target_user_id: userId,
      required_role: role || null
    });

    if (error) {
      console.error("Error checking admin role:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Exception checking admin role:", error);
    return false;
  }
};

/**
 * Check if current authenticated user is a super admin using secure function
 */
export const checkCurrentUserIsSuperAdmin = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_current_user_super_admin');
    
    if (error) {
      console.error("Error checking current user super admin status:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error checking current user super admin status:", error);
    return false;
  }
};

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

/**
 * Safely find user by email or username with enhanced validation and XSS protection
 */
export const findUserSecurely = async (emailOrUsername: string): Promise<string | null> => {
  // Input validation and sanitization
  if (!emailOrUsername || typeof emailOrUsername !== 'string') {
    throw new Error("Invalid input: email or username must be a non-empty string");
  }

  if (emailOrUsername.length < 3 || emailOrUsername.length > 254) {
    throw new Error("Invalid input: email or username must be between 3 and 254 characters");
  }

  // Sanitize input to prevent XSS
  const sanitizedInput = emailOrUsername.trim().toLowerCase().replace(/[<>]/g, '');
  
  // Additional validation for suspicious patterns
  if (/[<>{}()\[\]\\\/]/.test(sanitizedInput)) {
    throw new Error("Invalid characters detected in input");
  }

  try {
    const isEmail = sanitizedInput.includes('@') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedInput);
    
    if (isEmail) {
      // For email lookup, we need to search through profiles that might have stored emails
      // Since we can't directly query auth.users, we'll search by username/email in profiles
      const { data: userByEmail } = await supabase
        .from("profiles")
        .select("id")
        .or(`username.ilike.${sanitizedInput}`)
        .maybeSingle();

      if (userByEmail) {
        return userByEmail.id;
      }
    }

    // Try to find by username with case-insensitive search
    const { data: userByUsername } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", sanitizedInput)
      .maybeSingle();

    if (userByUsername) {
      return userByUsername.id;
    }

    return null;
  } catch (error) {
    console.error("Error finding user:", error);
    await logAdminOperation("user_lookup_error", sanitizedInput, "unknown", false, { error: error.message });
    return null;
  }
};

/**
 * Validate admin operation with rate limiting
 */
export const validateAdminOperation = async (operation: string): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.id) {
      return false;
    }

    // Check rate limiting - max 10 admin operations per minute
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    
    const { data: recentOperations } = await supabase
      .from("audit_logs")
      .select("log_id")
      .eq("user_id", session.session.user.id)
      .like("action", "admin_%")
      .gte("action_time", oneMinuteAgo);

    if (recentOperations && recentOperations.length >= 10) {
      throw new Error("Rate limit exceeded: Too many admin operations. Please wait before trying again.");
    }

    return true;
  } catch (error) {
    console.error("Admin operation validation failed:", error);
    return false;
  }
};

/**
 * Enhanced security validation for admin mutations
 */
export const validateAdminMutation = async (targetUserId: string, operation: string): Promise<void> => {
  // Validate operation is allowed
  if (!await validateAdminOperation(operation)) {
    throw new Error("Admin operation validation failed");
  }

  // Check if current user is super admin
  const isSuperAdmin = await checkCurrentUserIsSuperAdmin();
  if (!isSuperAdmin) {
    await logAdminOperation(`${operation}_unauthorized`, targetUserId, "unknown", false);
    throw new Error("Only super admins can perform this operation");
  }

  // Prevent self-modification for critical operations
  const { data: session } = await supabase.auth.getSession();
  if (session?.session?.user?.id === targetUserId && ['remove', 'demote'].includes(operation)) {
    await logAdminOperation(`${operation}_self_attempt`, targetUserId, "unknown", false);
    throw new Error("You cannot perform this operation on your own account");
  }
};
