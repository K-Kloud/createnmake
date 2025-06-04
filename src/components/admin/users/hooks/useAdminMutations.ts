
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AdminUser } from "../types";

export const useAdminMutations = () => {
  const queryClient = useQueryClient();

  const isSuperAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "super_admin")
      .single();
    
    return !!data;
  };

  const addAdminMutation = useMutation({
    mutationFn: async ({ emailOrUsername, role }: { emailOrUsername: string; role: "admin" | "super_admin" }) => {
      // Special case for kalux2@gmail.com - check if they already exist as admin
      if (emailOrUsername === "kalux2@gmail.com") {
        // Get current session to use the authenticated user's ID
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user || session.session.user.email !== "kalux2@gmail.com") {
          throw new Error("Only kalux2@gmail.com can grant themselves super admin privileges");
        }

        const currentUserId = session.session.user.id;

        // Check if they're already an admin
        const { data: existingRole } = await supabase
          .from("admin_roles")
          .select("*")
          .eq("user_id", currentUserId)
          .single();

        if (existingRole) {
          throw new Error("User is already an admin");
        }

        // Add the specified role using the authenticated user's ID
        const { error } = await supabase
          .from("admin_roles")
          .insert([{ 
            user_id: currentUserId, 
            role: role 
          }]);

        if (error) throw error;

        return { userId: currentUserId };
      }

      // Regular admin user addition flow
      // Try to find the user by username in the profiles table
      const { data: userByUsername, error: usernameError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", emailOrUsername)
        .single();

      if (usernameError && usernameError.code !== "PGRST116") {
        throw usernameError;
      }

      // If not found by username, we can't add them as admin
      if (!userByUsername) {
        throw new Error(`No user found with username: ${emailOrUsername}`);
      }

      const userId = userByUsername.id;

      // Check if user is already an admin
      const { data: existingRole } = await supabase
        .from("admin_roles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (existingRole) {
        throw new Error("User is already an admin");
      }

      // Check if the current user is a super_admin (only super admins can add other admins)
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("You must be logged in to add admins");
      }
      
      const isCurrentUserSuperAdmin = await isSuperAdmin(session.session.user.id);
      
      if (!isCurrentUserSuperAdmin) {
        throw new Error("Only super admins can add other admins");
      }

      // Add the specified role
      const { error } = await supabase
        .from("admin_roles")
        .insert([{ user_id: userId, role: role }]);

      if (error) throw error;

      return { userId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast({
        title: "Success",
        description: "Admin role added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Check if current user is super_admin before allowing removal
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("You must be logged in to remove admins");
      }
      
      const isCurrentUserSuperAdmin = await isSuperAdmin(session.session.user.id);
      
      // Check if target user is super_admin
      const { data: targetUserRole } = await supabase
        .from("admin_roles")
        .select("role")
        .eq("user_id", userId)
        .single();
        
      if (targetUserRole?.role === "super_admin") {
        throw new Error("Super admins cannot be removed");
      }
      
      if (!isCurrentUserSuperAdmin) {
        throw new Error("Only super admins can remove other admins");
      }

      const { error } = await supabase
        .from("admin_roles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
      return { userId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast({
        title: "Success",
        description: "Admin role removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    addAdminMutation,
    removeAdminMutation,
    isSuperAdmin
  };
};
