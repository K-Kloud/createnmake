
import { supabase } from "@/integrations/supabase/client";
import { checkUserAdminRole } from "./secureAdminUtils";

export const checkIfSuperAdmin = async (userId: string): Promise<boolean> => {
  try {
    return await checkUserAdminRole(userId, "super_admin");
  } catch (error) {
    console.error("Error checking super admin status:", error);
    return false;
  }
};

export const findUserByEmailOrUsername = async (emailOrUsername: string): Promise<string | null> => {
  // Input validation and sanitization
  if (!emailOrUsername || emailOrUsername.length < 3) {
    throw new Error("Invalid email or username format");
  }

  // Sanitize input to prevent XSS
  const sanitizedInput = emailOrUsername.trim().toLowerCase().replace(/[<>]/g, '');

  try {
    // Try to find by username in profiles
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

export const checkIfUserIsAlreadyAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data: existingRole } = await supabase
      .from("admin_roles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    return !!existingRole;
  } catch (error) {
    console.error("Error checking existing admin role:", error);
    return false;
  }
};

export const addAdminRoleToDatabase = async (userId: string, role: "admin" | "super_admin"): Promise<void> => {
  // Try to use RPC function first, fallback to direct insert
  const { error: rpcError } = await supabase.rpc('add_admin_role' as any, {
    target_user_id: userId,
    admin_role: role
  });

  if (rpcError) {
    // Fallback to direct insert
    const { error: insertError } = await supabase
      .from("admin_roles")
      .insert([{ user_id: userId, role: role }]);

    if (insertError) throw insertError;
  }
};
