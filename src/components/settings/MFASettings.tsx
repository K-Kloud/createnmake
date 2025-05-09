
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MFASetup } from "../auth/MFASetup";
import { Shield, ShieldCheck, ShieldX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/Icons";
import { useAuth } from "@/hooks/useAuth";

export const MFASettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMFAStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        
        if (error) throw error;
        
        // If the user has AAL2 factors available, MFA is enabled
        setMfaEnabled(!!data.currentLevel && data.currentLevel === 'aal2');
      } catch (error) {
        console.error("Error checking MFA status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkMFAStatus();
  }, [user]);

  const handleDisableMFA = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      
      if (data.totp && data.totp.length > 0) {
        const factor = data.totp[0];
        const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        
        if (error) throw error;
        
        toast({
          title: "MFA Disabled",
          description: "Two-factor authentication has been disabled for your account",
        });
        setMfaEnabled(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disable MFA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setIsSetupMode(false);
    setMfaEnabled(true);
  };

  if (isSetupMode) {
    return (
      <div className="flex justify-center">
        <MFASetup 
          onComplete={handleSetupComplete} 
          onCancel={() => setIsSetupMode(false)} 
        />
      </div>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account by enabling two-factor authentication
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Icons.spinner className="h-6 w-6 animate-spin" />
          </div>
        ) : mfaEnabled ? (
          <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-green-500" />
              <div>
                <h4 className="font-medium text-green-500">Two-factor authentication is enabled</h4>
                <p className="text-sm text-muted-foreground">
                  Your account is secured with an authenticator app.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
            <div className="flex items-center gap-3">
              <ShieldX className="h-6 w-6 text-yellow-500" />
              <div>
                <h4 className="font-medium text-yellow-500">Two-factor authentication is not enabled</h4>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security by requiring a verification code in addition to your password.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {mfaEnabled ? (
          <Button 
            variant="destructive" 
            onClick={handleDisableMFA} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Disabling...
              </>
            ) : (
              "Disable Two-Factor Authentication"
            )}
          </Button>
        ) : (
          <Button 
            onClick={() => setIsSetupMode(true)} 
            disabled={isLoading}
          >
            Enable Two-Factor Authentication
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
