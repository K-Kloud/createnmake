
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
  onSuccess?: () => void;
}

export const SignUpForm = ({ 
  isLoading, 
  email: externalEmail, 
  setEmail: setExternalEmail, 
  password: externalPassword, 
  setPassword: setExternalPassword,
  username: externalUsername,
  setUsername: setExternalUsername,
  onSuccess
}: SignUpFormProps) => {
  const [internalEmail, setInternalEmail] = useState("");
  const [internalPassword, setInternalPassword] = useState("");
  const [internalUsername, setInternalUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    
    const { error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password,
      options: {
        data: {
          username: sanitizedUsername,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Please check your email to confirm your account.",
      });
      // Call the success callback to close the dialog
      onSuccess?.();
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
          disabled={isLoading}
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
          disabled={isLoading}
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
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
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
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
};
