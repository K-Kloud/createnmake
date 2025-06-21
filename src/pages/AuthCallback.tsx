
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendWelcomeNotification } from "@/services/notificationService";
import { Icons } from "@/components/Icons"; 

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session to check if user is authenticated after redirect
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          toast({
            title: "Authentication failed",
            description: "There was an error processing your authentication. Please try again.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        const session = data.session;

        if (session?.user) {
          try {
            // Check if profile exists
            const { data: existingProfile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            // Handle profile creation if it doesn't exist
            if (!existingProfile && !profileError?.message?.includes('No rows')) {
              // Extract username from email or user metadata
              const username = session.user.user_metadata?.full_name || 
                              session.user.user_metadata?.name || 
                              session.user.email?.split('@')[0] || 
                              'user';
              
              // Insert profile with the authenticated user
              const { error: insertError } = await supabase
                .from("profiles")
                .insert({
                  id: session.user.id,
                  username,
                  avatar_url: session.user.user_metadata.avatar_url,
                  updated_at: new Date().toISOString(),
                });

              if (insertError) {
                console.error("Profile creation error:", insertError);
                // Don't fail the auth flow for profile creation errors
              } else {
                // Send welcome notification for new users
                try {
                  await sendWelcomeNotification(session.user.id);
                } catch (notificationError) {
                  console.error("Welcome notification error:", notificationError);
                  // Don't fail the auth flow for notification errors
                }
              }
            }
            
            // Determine sign in method for toast message
            const provider = session.user.app_metadata?.provider;
            const signInMethod = provider && provider !== 'email' ? provider : 'email';
            
            toast({
              title: "Sign in successful",
              description: `Welcome to Create2Make! You've signed in with ${signInMethod}.`,
            });
          } catch (error: any) {
            console.error("Error in auth callback:", error);
            // Don't prevent navigation for non-critical errors
            toast({
              title: "Welcome to Create2Make!",
              description: "You've been signed in successfully.",
            });
          }
        } else {
          // No session found, redirect to auth page
          toast({
            title: "Authentication incomplete",
            description: "Please try signing in again.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        // Redirect to dashboard regardless of profile creation result
        navigate("/dashboard");
      } catch (error: any) {
        console.error("Auth callback error:", error);
        toast({
          title: "Authentication error",
          description: "There was an unexpected error. Please try signing in again.",
          variant: "destructive",
        });
        navigate("/auth");
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Icons.spinner className="mx-auto h-8 w-8 animate-spin text-primary" />
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isProcessing ? "Completing authentication..." : "Redirecting..."}
          </p>
          <p className="text-sm text-muted-foreground">
            Please wait while we set up your account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
