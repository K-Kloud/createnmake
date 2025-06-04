
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
      // Get current session to check permissions
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("You must be logged in to add admins");
      }

      const currentUserId = session.session.user.id;
      const currentUserEmail = session.session.user.email;

      // Special case for kalux2@gmail.com - they can add themselves as super admin
      if (emailOrUsername === "kalux2@gmail.com" && currentUserEmail === "kalux2@gmail.com") {
        // Check if they're already an admin
        const { data: existingRole } = await supabase
          .from("admin_roles")
          .select("*")
          .eq("user_id", currentUserId)
          .maybeSingle();

        if (existingRole) {
          throw new Error("User is already an admin");
        }

        // Use the service role to bypass RLS for the special case
        const { error } = await supabase.rpc('add_admin_role' as any, {
          target_user_id: currentUserId,
          admin_role: role
        });

        if (error) {
          // Fallback: try direct insert
          const { error: insertError } = await supabase
            .from("admin_roles")
            .insert([{ 
              user_id: currentUserId, 
              role: role 
            }]);
          
          if (insertError) throw insertError;
        }

        return { userId: currentUserId };
      }

      // For all other cases, check if current user is super admin
      const isCurrentUserSuperAdmin = await isSuperAdmin(currentUserId);
      
      if (!isCurrentUserSuperAdmin) {
        throw new Error("Only super admins can add other admins");
      }

      // Try to find the user by email first
      let targetUserId: string | null = null;

      // First, try to find by email in auth.users via profiles
      const { data: userByEmail, error: emailError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", emailOrUsername)
        .maybeSingle();

      if (userByEmail) {
        targetUserId = userByEmail.id;
      } else {
        // Try to find by username in profiles
        const { data: userByUsername, error: usernameError } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", emailOrUsername)
          .maybeSingle();

        if (userByUsername) {
          targetUserId = userByUsername.id;
        }
      }

      if (!targetUserId) {
        throw new Error(`No user found with email/username: ${emailOrUsername}. Make sure the user has registered and has a profile.`);
      }

      // Check if user is already an admin
      const { data: existingRole } = await supabase
        .from("admin_roles")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (existingRole) {
        throw new Error("User is already an admin");
      }

      // Try to use RPC function first, fallback to direct insert
      const { error: rpcError } = await supabase.rpc('add_admin_role' as any, {
        target_user_id: targetUserId,
        admin_role: role
      });

      if (rpcError) {
        // Fallback to direct insert
        const { error: insertError } = await supabase
          .from("admin_roles")
          .insert([{ user_id: targetUserId, role: role }]);

        if (insertError) throw insertError;
      }

      return { userId: targetUserId };
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
        .maybeSingle();
        
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
