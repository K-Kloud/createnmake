
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Icons } from '@/components/Icons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Lock } from 'lucide-react';

interface EnhancedProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  fallbackComponent?: ReactNode;
}

export const EnhancedProtectedRoute = ({ 
  children, 
  redirectTo = '/auth',
  requireAdmin = false,
  requireSuperAdmin = false,
  fallbackComponent
}: EnhancedProtectedRouteProps) => {
  const { session, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminAccess();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    if (authLoading || (requireAdmin && adminLoading)) {
      return;
    }

    // Check authentication first
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
        variant: "destructive",
      });
      navigate(redirectTo);
      return;
    }

    // Check admin access if required
    if ((requireAdmin || requireSuperAdmin) && !isAdmin) {
      toast({
        title: "Access denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }

    // TODO: Add super admin check when needed
    if (requireSuperAdmin && !isAdmin) {
      toast({
        title: "Super admin access required",
        description: "This page requires super admin privileges",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }

    setAuthCheckComplete(true);
  }, [session, authLoading, isAdmin, adminLoading, navigate, redirectTo, toast, requireAdmin, requireSuperAdmin]);

  // Show loading state
  if (authLoading || (requireAdmin && adminLoading) || !authCheckComplete) {
    return fallbackComponent || (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Icons.spinner className="mx-auto h-8 w-8 animate-spin text-primary" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {authLoading ? "Verifying authentication..." : "Checking permissions..."}
                </p>
                <p className="text-sm text-muted-foreground">
                  Please wait while we verify your access.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied if no session after auth check
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Access Restricted</h3>
                <p className="text-sm text-muted-foreground">
                  You need to be signed in to view this page.
                </p>
              </div>
              <Button onClick={() => navigate(redirectTo)} className="w-full">
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show admin access denied
  if ((requireAdmin || requireSuperAdmin) && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Admin Access Required</h3>
                <p className="text-sm text-muted-foreground">
                  You don't have the necessary permissions to access this page.
                </p>
              </div>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
