
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/Icons";
import { useToast } from "@/hooks/use-toast";
import { Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { sendWelcomeNotification } from "@/services/notificationService";

interface SocialButtonsProps {
  onPhoneAuth: () => void;
}

export const SocialButtons = ({ onPhoneAuth }: SocialButtonsProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-callback`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        className="w-full"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Continue with Google
      </Button>
      <Button
        className="w-full"
        variant="outline"
        onClick={onPhoneAuth}
      >
        <Phone className="mr-2 h-4 w-4" />
        Continue with Phone
      </Button>
    </div>
  );
};
