
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/Icons";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const SocialButtons = () => {
  const { toast } = useToast();

  const handleSocialLogin = async (provider: 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) throw error;
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Button
        className="w-full"
        variant="outline"
        onClick={() => handleSocialLogin('google')}
      >
        <Icons.google className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
    </div>
  );
};
