
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useAdminMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", email)
        .single();

      if (userError) {
        const { data: auth, error: authError } = await supabase.auth.admin.listUsers({
          perPage: 1000,
        });

        if (authError) throw new Error("Cannot find user with this email");

        const user = auth.users.find(u => u.email === email);
        if (!user) throw new Error("User not found with this email");
        
        const { error: roleError } = await supabase
          .from("admin_roles")
          .insert({ user_id: user.id, role: "admin" });

        if (roleError) throw roleError;
        
        return { id: user.id, email, role: "admin", created_at: new Date().toISOString() };
      } else {
        const { error: roleError } = await supabase
          .from("admin_roles")
          .insert({ user_id: userData.id, role: "admin" });

        if (roleError) throw roleError;
        
        return { id: userData.id, email, role: "admin", created_at: new Date().toISOString() };
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Admin user added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add admin user",
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
      return userId;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Admin role removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove admin role",
        variant: "destructive",
      });
    },
  });

  return {
    addAdminMutation,
    removeAdminMutation,
  };
};
