
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sanitizeInput } from "@/utils/security";

interface SignInFormProps {
  isLoading: boolean;
  onForgotPassword: () => void;
  email?: string;
  setEmail?: (email: string) => void;
  password?: string;
  setPassword?: (password: string) => void;
}

export const SignInForm = ({ 
  isLoading, 
  onForgotPassword, 
  email: externalEmail, 
  setEmail: setExternalEmail, 
  password: externalPassword, 
  setPassword: setExternalPassword 
}: SignInFormProps) => {
  const [internalEmail, setInternalEmail] = useState("");
  const [internalPassword, setInternalPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Use either external state (if provided) or internal state
  const email = externalEmail !== undefined ? externalEmail : internalEmail;
  const setEmail = setExternalEmail || setInternalEmail;
  const password = externalPassword !== undefined ? externalPassword : internalPassword;
  const setPassword = setExternalPassword || setInternalPassword;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || isLoading) return;
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid credentials",
            description: "The email or password you entered is incorrect. Please try again.",
            variant: "destructive",
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email not confirmed",
            description: "Please check your email and click the confirmation link before signing in.",
            variant: "destructive",
          });
        } else if (error.message.includes('Too many requests')) {
          toast({
            title: "Too many attempts",
            description: "Too many sign in attempts. Please wait a few minutes and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Unexpected error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading || isSubmitting}
          placeholder="Enter your email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading || isSubmitting}
            placeholder="Enter your password"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading || isSubmitting}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
      <Button
        type="button"
        variant="link"
        className="w-full"
        onClick={onForgotPassword}
        disabled={isLoading || isSubmitting}
      >
        Forgot your password?
      </Button>
    </form>
  );
};
