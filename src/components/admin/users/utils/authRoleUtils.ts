
import { supabase } from "@/integrations/supabase/client";

/**
 * Securely check if a user has a specific admin role using the SECURITY DEFINER function
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
