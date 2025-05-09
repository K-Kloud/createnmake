
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/Icons";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/utils/auth";
import { MFAVerify } from "./MFAVerify";

interface SignInFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isLoading: boolean;
  onForgotPassword: () => void;
}

export const SignInForm = ({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  onForgotPassword,
}: SignInFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [needsMFA, setNeedsMFA] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      // Check if MFA is required
      if (data?.session === null && data?.user === null) {
        // This means MFA is required
        const factors = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        
        if (factors.data.nextLevel === 'aal2' && factors.data.currentLevel === 'aal1' && factors.data.nextFactor) {
          setMfaFactorId(factors.data.nextFactor.id);
          setNeedsMFA(true);
          return;
        }
      }
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      // Force page reload
      window.location.href = '/dashboard';
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMFAComplete = () => {
    toast({
      title: "Welcome back!",
      description: "You have successfully signed in.",
    });
    
    // Force page reload
    window.location.href = '/dashboard';
  };

  if (needsMFA) {
    return (
      <MFAVerify 
        factorId={mfaFactorId} 
        onComplete={handleMFAComplete}
        onCancel={() => setNeedsMFA(false)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button
        type="button"
        variant="link"
        className="px-0 text-sm"
        onClick={onForgotPassword}
      >
        Forgot password?
      </Button>
      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
};
