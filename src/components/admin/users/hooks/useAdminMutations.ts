
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AdminUser } from "../types";

export const useAdminMutations = () => {
  const queryClient = useQueryClient();

  const addAdminMutation = useMutation({
    mutationFn: async (emailOrUsername: string) => {
      // First, try to find the user by email in the profiles table
      // Since we don't have direct access to the auth.users table
      const { data: userByEmail, error: userEmailError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", emailOrUsername)
        .single();

      if (userEmailError && userEmailError.code !== "PGRST116") {
        throw userEmailError;
      }

      // If not found by email/username, we can't add them as admin
      if (!userByEmail) {
        throw new Error(`No user found with email or username: ${emailOrUsername}`);
      }

      const userId = userByEmail.id;

      // Check if user is already an admin
      const { data: existingRole } = await supabase
        .from("admin_roles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (existingRole) {
        throw new Error("User is already an admin");
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
  };
};
