
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const AdminAccess = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPromoting, setIsPromoting] = useState(false);

  // Check if user is admin
  const { data: adminData, isLoading } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return { isAdmin: false, isSuperAdmin: false, email: null };
      
      const { data, error } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', session.session.user.id)
        .single();

      if (error) {
        return { isAdmin: false, isSuperAdmin: false, email: session.session.user.email };
      }

      return { 
        isAdmin: !!data, 
        isSuperAdmin: data?.role === 'super_admin',
        email: session.session.user.email 
      };
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async () => {
      setIsPromoting(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user || !adminData?.email) {
        throw new Error("You must be logged in to become super admin");
      }

      // Check if any super admin exists
      const { data: existingSuperAdmin } = await supabase
        .from("admin_roles")
        .select("*")
        .eq("role", "super_admin")
        .single();

      if (existingSuperAdmin) {
        // Update current user role to super_admin if already an admin
        if (adminData.isAdmin && !adminData.isSuperAdmin) {
          const { error } = await supabase
            .from("admin_roles")
            .update({ role: "super_admin" })
            .eq("user_id", session.session.user.id);
          
          if (error) throw error;
        } else if (!adminData.isAdmin) {
          throw new Error("Only existing admins can be promoted to super admin when a super admin already exists");
        }
      } else {
        // No super admin exists, add current user as super_admin
        // First check if user already exists in profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", session.session.user.id)
          .single();

        // If profile doesn't exist, create it
        if (!profile) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: session.session.user.id,
              username: adminData.email
            });
          
          if (profileError) throw profileError;
        }

        // Add user as super_admin
        const { error } = await supabase
          .from("admin_roles")
          .insert([{ 
            user_id: session.session.user.id, 
            role: "super_admin" 
          }]);
        
        if (error) throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: "Success",
        description: "You are now a super admin",
      });
      setIsPromoting(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsPromoting(false);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!adminData?.isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-muted-foreground" />
            Admin Access
          </CardTitle>
          <CardDescription>
            Become an administrator to manage users and content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Only existing admins can promote users to admin roles. If no super admin exists yet, you can become the first one.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => promoteMutation.mutate()}
            disabled={isPromoting}
          >
            {isPromoting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShieldAlert className="mr-2 h-4 w-4" />
            )}
            Become Super Admin
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {adminData.isSuperAdmin ? (
            <>
              <ShieldAlert className="h-5 w-5 text-primary" />
              Super Admin Access
            </>
          ) : (
            <>
              <ShieldCheck className="h-5 w-5 text-primary" />
              Admin Access
            </>
          )}
        </CardTitle>
        <CardDescription>
          {adminData.isSuperAdmin 
            ? "You have super administrator privileges. You can manage all users, content, and other admins."
            : "You have administrator privileges. Access the admin dashboard to manage users and content."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {adminData.isSuperAdmin 
            ? "As a super admin, you have full control over the system, including the ability to manage other administrators."
            : "As an admin, you can manage users, content, and system settings through the admin dashboard."}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          className="w-full" 
          onClick={() => navigate('/admin')}
        >
          <ShieldCheck className="mr-2 h-4 w-4" />
          Go to Admin Dashboard
        </Button>
        
        {!adminData.isSuperAdmin && (
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => promoteMutation.mutate()}
            disabled={isPromoting}
          >
            {isPromoting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShieldAlert className="mr-2 h-4 w-4" />
            )}
            Promote to Super Admin
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
