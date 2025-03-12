
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
    mutationFn: async (emailOrUsername: string) => {
      // If the email is kalux2@gmail.com and doesn't exist, create profile and add as super_admin
      if (emailOrUsername === "kalux2@gmail.com") {
        // Check if the user exists in the profiles table
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", emailOrUsername)
          .single();

        if (!existingProfile) {
          // Create a new profile for this special case
          // In a real app, you'd use Auth API to create a user, but we're simulating it here
          const { data: newProfile, error: profileError } = await supabase
            .from("profiles")
            .insert({
              username: emailOrUsername,
              id: crypto.randomUUID() // Generate a UUID for this user
            })
            .select()
            .single();

          if (profileError) throw profileError;
          
          // Add as super_admin
          const { error } = await supabase
            .from("admin_roles")
            .insert([{ 
              user_id: newProfile.id, 
              role: "super_admin" 
            }]);

          if (error) throw error;
          
          return { userId: newProfile.id };
        } else {
          // If profile exists, check if they're already an admin
          const { data: existingRole } = await supabase
            .from("admin_roles")
            .select("*")
            .eq("user_id", existingProfile.id)
            .single();

          if (existingRole) {
            throw new Error("User is already an admin");
          }

          // Add super_admin role
          const { error } = await supabase
            .from("admin_roles")
            .insert([{ 
              user_id: existingProfile.id, 
              role: "super_admin" 
            }]);

          if (error) throw error;

          return { userId: existingProfile.id };
        }
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

      // Check if the current user is a super_admin
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("You must be logged in to add admins");
      }
      
      const isCurrentUserSuperAdmin = await isSuperAdmin(session.session.user.id);
      
      if (!isCurrentUserSuperAdmin) {
        throw new Error("Only super admins can add other admins");
      }

      // Add admin role
      const { error } = await supabase
        .from("admin_roles")
        .insert([{ user_id: userId, role: "admin" }]);

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
