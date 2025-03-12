
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";

interface UserMenuProps {
  session: any;
  profile: any;
  onShowAuthDialog: () => void;
}

export const UserMenu = ({ session, profile, onShowAuthDialog }: UserMenuProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      
      const { data, error } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

      if (error) {
        return false;
      }

      return !!data;
    },
    enabled: !!session?.user?.id,
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/');
  };

  if (!session?.user) {
    return (
      <Button 
        className="bg-primary hover:bg-primary-hover"
        onClick={onShowAuthDialog}
      >
        Get Started
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={profile?.avatar_url} alt={profile?.username || session.user.email} />
          <AvatarFallback>{(profile?.username?.[0] || session.user.email?.[0])?.toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
          Dashboard
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate("/admin")}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Admin Panel
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="text-red-500 focus:text-red-500"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
