import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, Image, History, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UserImages } from "@/components/dashboard/UserImages";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showImages, setShowImages] = useState(false);

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Query for generated images count
  const { data: generatedImagesCount = 0 } = useQuery({
    queryKey: ['generatedImagesCount', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      const { count } = await supabase
        .from('generated_images')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      return count || 0;
    },
    enabled: !!session?.user?.id,
  });

  // Query for likes count
  const { data: likesCount = 0 } = useQuery({
    queryKey: ['likesCount', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      const { count } = await supabase
        .from('image_likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      return count || 0;
    },
    enabled: !!session?.user?.id,
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!session) {
      navigate('/');
    }
  }, [session, navigate]);

  if (!session || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container px-4 py-24 flex-grow">
        <div className="flex flex-col md:flex-row gap-8">
          {/* User Profile Section */}
          <Card className="flex-1 glass-card">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar_url} alt={profile.username} />
                    <AvatarFallback>{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Upload className="h-4 w-4 text-white" />
                  </label>
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </div>
                <h2 className="text-2xl font-bold">{profile.username}</h2>
                <p className="text-gray-400">{session.user.email}</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <div className="flex-[2] grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatsCard
              title="Images Generated"
              value={generatedImagesCount}
              onClick={() => setShowImages(!showImages)}
            />
            <StatsCard
              title="Images Liked"
              value={likesCount}
            />

            {showImages && session.user && (
              <UserImages userId={session.user.id} />
            )}

            <Card className="glass-card col-span-full">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => navigate("/create")}>
                    <Image className="mr-2 h-4 w-4" />
                    Create New Image
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/marketplace")}>
                    <History className="mr-2 h-4 w-4" />
                    View Gallery
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
