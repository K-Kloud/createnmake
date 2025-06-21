
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { validatePassword } from "@/utils/passwordValidation";
import { sanitizeInput } from "@/utils/security";

interface SignUpFormProps {
  isLoading: boolean;
  email?: string;
  setEmail?: (email: string) => void;
  password?: string;
  setPassword?: (password: string) => void;
  username?: string;
  setUsername?: (username: string) => void;
}

export const SignUpForm = ({ 
  isLoading, 
  email: externalEmail, 
  setEmail: setExternalEmail, 
  password: externalPassword, 
  setPassword: setExternalPassword,
  username: externalUsername,
  setUsername: setExternalUsername
}: SignUpFormProps) => {
  const [internalEmail, setInternalEmail] = useState("");
  const [internalPassword, setInternalPassword] = useState("");
  const [internalUsername, setInternalUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Use either external state (if provided) or internal state
  const email = externalEmail !== undefined ? externalEmail : internalEmail;
  const setEmail = setExternalEmail || setInternalEmail;
  const password = externalPassword !== undefined ? externalPassword : internalPassword;
  const setPassword = setExternalPassword || setInternalPassword;
  const username = externalUsername !== undefined ? externalUsername : internalUsername;
  const setUsername = setExternalUsername || setInternalUsername;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || isLoading) return;
    
    // Validate password strength
    if (!validatePassword(password)) {
      toast({
        title: "Weak Password",
        description: "Password must meet all security requirements.",
        variant: "destructive",
      });
      return;
    }
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedUsername = sanitizeInput(username);
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: sanitizedUsername,
          },
        },
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          toast({
            title: "Account exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        } else if (error.message.includes('Invalid email')) {
          toast({
            title: "Invalid email",
            description: "Please enter a valid email address.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Account created successfully!",
          description: "Please check your email to confirm your account before signing in.",
        });
        
        // Clear form
        setEmail("");
        setPassword("");
        setUsername("");
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
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
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={isLoading || isSubmitting}
          placeholder="Enter your username"
        />
      </div>
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
            placeholder="Create a strong password"
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
        <PasswordStrengthIndicator password={password} />
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || isSubmitting}
      >
        {isSubmitting ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
};
