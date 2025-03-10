import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, UserPlus, ShieldCheck, ShieldX } from "lucide-react";

type AdminUser = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

type AuthUser = {
  id: string;
  email: string;
};

type Profile = {
  id: string;
  username: string;
};

export const AdminUsersList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [emailInput, setEmailInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all admin users
  const { data: adminUsers, isLoading } = useQuery<AdminUser[]>({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const { data: adminRoles, error: rolesError } = await supabase
        .from("admin_roles")
        .select("user_id, role, created_at");

      if (rolesError) throw rolesError;

      // Get profile information for each admin
      const userIds = adminRoles.map((role) => role.user_id);
      
      if (userIds.length === 0) return [];

      try {
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
          perPage: 1000,
        });

        if (usersError) throw usersError;

        // Match users with roles
        return adminRoles.map((role) => {
          const user = users.users.find((u) => u.id === role.user_id);
          return {
            id: role.user_id,
            email: user?.email || "Unknown",
            role: role.role,
            created_at: role.created_at,
          };
        });
      } catch (error) {
        // Fall back to fetching only profiles if not super admin
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        if (profilesError) throw profilesError;

        return adminRoles.map((role) => {
          const profile = profiles.find((p) => p.id === role.user_id);
          return {
            id: role.user_id,
            email: profile?.username || "Unknown",
            role: role.role,
            created_at: role.created_at,
          };
        });
      }
    },
  });

  // Add a new admin
  const addAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      // First try to find the user by email
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", email)
        .single();

      if (userError) {
        // If not found by username, try to find by checking auth emails
        const { data: auth, error: authError } = await supabase.auth.admin.listUsers({
          perPage: 1000,
        });

        if (authError) throw new Error("Cannot find user with this email");

        const user = auth.users.find(u => u.email === email);
        if (!user) throw new Error("User not found with this email");
        
        // Add admin role
        const { error: roleError } = await supabase
          .from("admin_roles")
          .insert({ user_id: user.id, role: "admin" });

        if (roleError) throw roleError;
        
        return { id: user.id, email, role: "admin", created_at: new Date().toISOString() };
      } else {
        // User found by username
        // Add admin role
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
      setEmailInput("");
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

  // Remove admin role
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

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      addAdminMutation.mutate(emailInput.trim());
    }
  };

  const filteredAdmins = adminUsers?.filter(
    (admin) =>
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <form onSubmit={handleAddAdmin} className="flex-1 flex space-x-2">
          <Input
            placeholder="User email or username"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!emailInput.trim() || addAdminMutation.isPending}
          >
            {addAdminMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            Add Admin
          </Button>
        </form>

        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email/Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredAdmins?.length ? (
              filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {admin.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(admin.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAdminMutation.mutate(admin.id)}
                      disabled={removeAdminMutation.isPending}
                    >
                      {removeAdminMutation.isPending &&
                      removeAdminMutation.variables === admin.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldX className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  {searchTerm
                    ? "No matching admin users found"
                    : "No admin users found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
