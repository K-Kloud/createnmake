
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";

interface ProfileCardProps {
  profile: {
    avatar_url?: string;
    username?: string;
  } | null;
  userEmail?: string;
  userId?: string;
}

export const ProfileCard = ({ profile, userEmail, userId }: ProfileCardProps) => {
  const navigate = useNavigate();
  const { handleAvatarUpload } = useAvatarUpload(userId);

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
              <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Settings className="h-4 w-4 text-white" />
            </label>
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">{profile?.username}</h2>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate("/settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
