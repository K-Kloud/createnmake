
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, Search } from "lucide-react";
import { useAdminUsers } from "./hooks/useAdminUsers";
import { useAdminMutations } from "./hooks/useAdminMutations";
import { AdminUsersTable } from "./components/AdminUsersTable";

export const AdminUsersList = () => {
  const [emailInput, setEmailInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [superAdminExists, setSuperAdminExists] = useState(false);

  const { data: adminUsers, isLoading } = useAdminUsers();
  const { addAdminMutation, removeAdminMutation } = useAdminMutations();

  // Check if super admin exists
  useEffect(() => {
    if (adminUsers) {
      const existingSuperAdmin = adminUsers.find(admin => admin.role === "super_admin");
      setSuperAdminExists(!!existingSuperAdmin);
      
      // If no super admin exists, automatically add kalux2@gmail.com
      if (!existingSuperAdmin && !isLoading && !addAdminMutation.isPending) {
        addAdminMutation.mutate("kalux2@gmail.com");
      }
    }
  }, [adminUsers, isLoading, addAdminMutation]);

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      addAdminMutation.mutate(emailInput.trim());
      setEmailInput("");
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
