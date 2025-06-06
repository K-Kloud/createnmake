
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validatePasswordStrength } from "@/utils/passwordValidation";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { sanitizeHtml } from "@/utils/security";

interface SignUpFormProps {
  onToggleMode: () => void;
}

export const SignUpForm = ({ onToggleMode }: SignUpFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(sanitizeHtml(e.target.value));
  };

  const handlePasswordChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    if (newPassword) {
      const validation = await validatePasswordStrength(newPassword);
      setPasswordErrors(validation.errors);
    } else {
      setPasswordErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;

    // Input validation
    if (!email.trim() || !password || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    // Validate password strength
    const passwordValidation = await validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      toast({
        title: "Weak Password",
        description: "Please choose a stronger password.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Clean up any existing auth state before signup
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignore cleanup errors
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: sanitizeHtml(email.trim()),
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive"
          });
          onToggleMode();
        } else {
          toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive"
          });
        }
        return;
      }

      if (data.user && !data.session) {
        toast({
          title: "Check Your Email",
          description: "Please check your email for a confirmation link before signing in.",
        });
      } else if (data.user && data.session) {
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully.",
        });
        // Force page reload for clean state
        window.location.href = '/';
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
        </AlertDescription>
      </Alert>

      <div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
          disabled={loading}
          required
          maxLength={254}
        />
      </div>
      
      <div>
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
          disabled={loading}
          required
          maxLength={128}
        />
        <PasswordStrengthIndicator password={password} errors={passwordErrors} />
      </div>
      
      <div>
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          required
          maxLength={128}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading || passwordErrors.length > 0}>
        {loading ? "Creating Account..." : "Sign Up"}
      </Button>
      
      <div className="text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-sm text-blue-600 hover:underline"
          disabled={loading}
        >
          Already have an account? Sign in
        </button>
      </div>
    </form>
  );
};
