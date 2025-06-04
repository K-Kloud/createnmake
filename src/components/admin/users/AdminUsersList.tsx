
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, Search } from "lucide-react";
import { useAdminUsers } from "./hooks/useAdminUsers";
import { useAdminMutations } from "./hooks/useAdminMutations";
import { AdminUsersTable } from "./components/AdminUsersTable";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const AdminUsersList = () => {
  const [emailInput, setEmailInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "super_admin">("admin");
  const [searchTerm, setSearchTerm] = useState("");
  const [superAdminExists, setSuperAdminExists] = useState(false);
  const [hasCheckedSuperAdmin, setHasCheckedSuperAdmin] = useState(false);
  const { toast } = useToast();

  const { data: adminUsers, isLoading, refetch } = useAdminUsers();
  const { addAdminMutation, removeAdminMutation } = useAdminMutations();

  // Check current user's email
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  
  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession();
      setCurrentUserEmail(data.session?.user?.email || null);
    }
    getSession();
  }, []);

  // Check if super admin exists and handle auto-assignment
  useEffect(() => {
    if (adminUsers && !hasCheckedSuperAdmin) {
      const existingSuperAdmin = adminUsers.find(admin => admin.role === "super_admin");
      setSuperAdminExists(!!existingSuperAdmin);
      setHasCheckedSuperAdmin(true);
      
      // If current user is kalux2@gmail.com and no super admin exists, show message but don't auto-add
      if (!existingSuperAdmin && !isLoading && 
          currentUserEmail === "kalux2@gmail.com") {
        console.log("No super admin found. You can add yourself as super admin.");
        toast({
          title: "Super Admin Setup",
          description: "No super admin found. You can add yourself by clicking 'Add Admin' with your email and selecting 'Super Admin' role."
        });
      }
    }
  }, [adminUsers, isLoading, currentUserEmail, hasCheckedSuperAdmin, toast]);

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      addAdminMutation.mutate({ 
        emailOrUsername: emailInput.trim(), 
        role: selectedRole 
      });
      setEmailInput("");
      setSelectedRole("admin");
    }
  };

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
          <Select value={selectedRole} onValueChange={(value: "admin" | "super_admin") => setSelectedRole(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
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

      <AdminUsersTable
        admins={adminUsers || []}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onRemoveAdmin={(userId) => removeAdminMutation.mutate(userId)}
        isRemoving={removeAdminMutation.isPending}
        removingId={removeAdminMutation.variables}
      />
    </div>
  );
};
