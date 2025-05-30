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
import { ShieldCheck } from "lucide-react";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Bell } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface UserMenuProps {
  session: any;
  profile: any;
  onShowAuthDialog: () => void;
}

export const UserMenu = ({ session, profile, onShowAuthDialog }: UserMenuProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAdminAccess();
  
  // Special case for kalux2@gmail.com
  const isSpecialAdmin = session?.user?.email === "kalux2@gmail.com";

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
        aria-label="Sign in or register"
      >
        Get Started
      </Button>
    );
  }

  const { unreadCount } = useNotifications();

  return (
    <div className="flex items-center gap-2">
      {/* Add the notification bell for logged-in users */}
      {session && <NotificationBell />}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-8 w-8 cursor-pointer" aria-label="User menu">
            <AvatarImage src={profile?.avatar_url} alt={profile?.username || session.user.email} />
            <AvatarFallback>{(profile?.username?.[0] || session.user.email?.[0])?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => navigate("/dashboard")}>
            Dashboard
          </DropdownMenuItem>
          {(isAdmin || isSpecialAdmin) && (
            <DropdownMenuItem onClick={() => navigate("/admin")}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Admin Panel
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link to="/notifications" className="flex items-center justify-between w-full">
              <span className="flex items-center">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Link>
          </DropdownMenuItem>
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
    </div>
  );
};
