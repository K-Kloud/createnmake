
import { supabase } from "@/integrations/supabase/client";
import { RateLimiter, sanitizeHtml, isValidEmail, isValidUsername } from "@/utils/security";

// Rate limiter for admin operations
const adminRateLimiter = new RateLimiter(10, 60000); // 10 operations per minute

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
  const sanitizedInput = sanitizeHtml(emailOrUsername.trim().toLowerCase());
  
  // Additional validation for suspicious patterns
  if (/[<>{}()\[\]\\\/]/.test(sanitizedInput)) {
    throw new Error("Invalid characters detected in input");
  }

  try {
    // Check if it's a valid email format
    const isEmail = isValidEmail(sanitizedInput);
    
    if (isEmail) {
      // For email lookup, search profiles by username (which might contain email)
      const { data: userByEmail } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", sanitizedInput)
        .maybeSingle();

      if (userByEmail) {
        return userByEmail.id;
      }
    } else {
      // Validate username format
      if (!isValidUsername(sanitizedInput)) {
        throw new Error("Invalid username format");
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

/**
 * Enhanced security validation for admin mutations
 */
export const validateAdminMutation = async (targetUserId: string, operation: string): Promise<void> => {
  // Sanitize target user ID
  if (!targetUserId || typeof targetUserId !== 'string') {
    throw new Error("Invalid target user ID");
  }

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

/**
 * Secure function to bootstrap the first super admin
 * This should only be used during initial setup
 */
export const bootstrapSuperAdmin = async (userId: string): Promise<boolean> => {
  try {
    // Check if any super admin already exists
    const { data: existingSuperAdmin } = await supabase
      .from("admin_roles")
      .select("user_id")
      .eq("role", "super_admin")
      .maybeSingle();

    if (existingSuperAdmin) {
      throw new Error("Super admin already exists. Cannot bootstrap another one.");
    }

    // Add the first super admin
    const { error } = await supabase
      .from("admin_roles")
      .insert([{ user_id: userId, role: "super_admin" }]);

    if (error) throw error;

    await logAdminOperation("bootstrap_super_admin", userId, "super_admin", true);
    return true;
  } catch (error) {
    console.error("Error bootstrapping super admin:", error);
    await logAdminOperation("bootstrap_super_admin_failed", userId, "super_admin", false, { error: error.message });
    return false;
  }
};
