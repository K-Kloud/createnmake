
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendWelcomeNotification } from "@/services/notificationService";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the session to check if user is authenticated after redirect
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (session?.user) {
        try {
          // Check if profile exists
          const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          // Create profile if it doesn't exist
          if (!existingProfile && !profileError) {
            // Extract username from email or use a default
            const username = session.user.email?.split('@')[0] || 'user';
            
            const { error } = await supabase
              .from('profiles')
              .upsert({
                id: session.user.id,
                username,
                avatar_url: session.user.user_metadata.avatar_url,
                updated_at: new Date().toISOString(),
              });

            if (error) throw error;
            
            // Send welcome notification for new users
            await sendWelcomeNotification(session.user.id);
          }
          
          toast({
            title: "Sign in successful",
            description: "Welcome to OpenTeknologies!",
          });
        } catch (error: any) {
          console.error("Error in auth callback:", error);
        }
      }

      // Redirect to dashboard regardless of profile creation result
      navigate("/dashboard");
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Icons.spinner className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
