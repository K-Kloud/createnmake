
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, Search, Shield, AlertTriangle } from "lucide-react";
import { useAdminUsers } from "./hooks/useAdminUsers";
import { useAdminMutations } from "./hooks/useAdminMutations";
import { AdminUsersTable } from "./components/AdminUsersTable";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeHtml, isValidEmail, isValidUsername } from "@/utils/security";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const AdminUsersList = () => {
  const [emailInput, setEmailInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "super_admin">("admin");
  const [searchTerm, setSearchTerm] = useState("");
  const [superAdminExists, setSuperAdminExists] = useState(false);
  const [hasCheckedSuperAdmin, setHasCheckedSuperAdmin] = useState(false);
  const [inputError, setInputError] = useState("");
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

  // Check if super admin exists
  useEffect(() => {
    if (adminUsers && !hasCheckedSuperAdmin) {
      const existingSuperAdmin = adminUsers.find(admin => admin.role === "super_admin");
      setSuperAdminExists(!!existingSuperAdmin);
      setHasCheckedSuperAdmin(true);
      
      // Show message if no super admin exists
      if (!existingSuperAdmin && !isLoading) {
        console.log("No super admin found. System requires manual super admin assignment through database.");
        toast({
          title: "Super Admin Setup Required",
          description: "No super admin found. Contact system administrator to assign the first super admin role through the database.",
          variant: "destructive"
        });
      }
    }
  }, [adminUsers, isLoading, hasCheckedSuperAdmin, toast]);

  // Enhanced input validation
  const handleInputChange = (value: string) => {
    const sanitizedValue = sanitizeHtml(value);
    setEmailInput(sanitizedValue);
    
    // Comprehensive validation
    if (sanitizedValue) {
      if (!isValidEmail(sanitizedValue) && !isValidUsername(sanitizedValue)) {
        setInputError("Please enter a valid email address or username (3-50 characters, alphanumeric, underscore, hyphen only)");
      } else if (sanitizedValue.length < 3) {
        setInputError("Input must be at least 3 characters long");
      } else if (sanitizedValue.length > 254) {
        setInputError("Input is too long (max 254 characters)");
      } else {
        setInputError("");
      }
    } else {
      setInputError("");
    }
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailInput.trim()) {
      setInputError("Email or username is required");
      return;
    }
    
    if (inputError) {
      return;
    }
    
    const sanitizedInput = sanitizeHtml(emailInput.trim());
    
    // Additional security check
    if (sanitizedInput.length < 3 || sanitizedInput.length > 254) {
      setInputError("Invalid input length");
      return;
    }
    
    addAdminMutation.mutate({ 
      emailOrUsername: sanitizedInput, 
      role: selectedRole 
    });
    setEmailInput("");
    setSelectedRole("admin");
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Admin operations are logged and monitored. Only super admins can manage other admin accounts. All inputs are sanitized for security.
        </AlertDescription>
      </Alert>

      {/* Warning if no super admin exists */}
      {hasCheckedSuperAdmin && !superAdminExists && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical:</strong> No super admin found in the system. Contact your system administrator to bootstrap the first super admin through the database.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <form onSubmit={handleAddAdmin} className="flex-1 flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder="User email or username"
              value={emailInput}
              onChange={(e) => handleInputChange(e.target.value)}
              className={inputError ? "border-red-500" : ""}
              maxLength={254}
            />
            {inputError && (
              <p className="text-sm text-red-500 mt-1">{inputError}</p>
            )}
          </div>
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
            disabled={!emailInput.trim() || addAdminMutation.isPending || !!inputError}
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
            onChange={(e) => setSearchTerm(sanitizeHtml(e.target.value))}
            className="pl-8"
            maxLength={100}
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
