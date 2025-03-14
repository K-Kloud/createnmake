
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminAccess } from "@/hooks/useAdminAccess";

export const AdminAccess = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAdminAccess();

  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Admin Access
        </CardTitle>
        <CardDescription>
          You have administrator privileges. Access the admin dashboard to manage users and content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          As an admin, you can manage users, content, and system settings through the admin dashboard.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => navigate('/admin')}
        >
          <ShieldCheck className="mr-2 h-4 w-4" />
          Go to Admin Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
};
