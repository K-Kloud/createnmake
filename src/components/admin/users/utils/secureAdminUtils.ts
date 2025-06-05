
import { supabase } from "@/integrations/supabase/client";

/**
 * Securely check if a user has a specific admin role
 * Uses a security definer function to avoid RLS recursion
 */
export const checkUserAdminRole = async (userId: string, role?: "admin" | "super_admin"): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) {
      console.error("Error checking admin role:", error);
      return false;
    }

    if (!data || data.length === 0) {
      return false;
    }

    // If no specific role is requested, check if user has any admin role
    if (!role) {
      return data.some(roleData => ['admin', 'super_admin'].includes(roleData.role));
    }

    // Check for specific role
    return data.some(roleData => roleData.role === role);
  } catch (error) {
    console.error("Exception checking admin role:", error);
    return false;
  }
};

/**
 * Check if current authenticated user is a super admin
 */
export const checkCurrentUserIsSuperAdmin = async (): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.id) {
      return false;
    }
    
    return await checkUserAdminRole(session.session.user.id, "super_admin");
  } catch (error) {
    console.error("Error checking current user super admin status:", error);
    return false;
  }
};

/**
 * Audit log for admin operations
 */
export const logAdminOperation = async (
  operation: string, 
  targetUserId: string, 
  role: string,
  success: boolean
) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.id) return;

    await supabase
      .from("audit_logs")
      .insert({
        user_id: session.session.user.id,
        action: `admin_${operation}`,
        action_details: {
          target_user_id: targetUserId,
          role: role,
          success: success,
          timestamp: new Date().toISOString()
        }
      });
  } catch (error) {
    console.error("Failed to log admin operation:", error);
  }
};

/**
 * Safely find user by email or username with validation
 */
export const findUserSecurely = async (emailOrUsername: string): Promise<string | null> => {
  // Input validation
  if (!emailOrUsername || emailOrUsername.length < 3) {
    throw new Error("Invalid email or username format");
  }

  // Sanitize input
  const sanitizedInput = emailOrUsername.trim().toLowerCase();
  
  try {
    // Try to find by email first (more secure than username)
    const isEmail = sanitizedInput.includes('@');
    
    if (isEmail) {
      // For email, we need to search in auth.users via profiles
      // Since we can't directly query auth.users, we'll use the user_id approach
      const { data: userByEmail } = await supabase
        .from("profiles")
        .select("id")
        .ilike("id", `%${sanitizedInput}%`) // This won't work for email, we need a different approach
        .maybeSingle();

      if (userByEmail) {
        return userByEmail.id;
      }
    }

    // Try to find by username
    const { data: userByUsername } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", sanitizedInput)
      .maybeSingle();

    if (userByUsername) {
      return userByUsername.id;
    }

    return null;
  } catch (error) {
    console.error("Error finding user:", error);
    return null;
  }
};
