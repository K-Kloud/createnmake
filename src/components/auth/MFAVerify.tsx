
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/Icons";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface MFAVerifyProps {
  factorId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export const MFAVerify = ({ factorId, onComplete, onCancel }: MFAVerifyProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({ 
        factorId, 
        code: verifyCode 
      });

      if (error) throw error;

      toast({
        title: "Verification Successful",
        description: "You have been successfully authenticated",
      });
      onComplete();
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card w-[400px]">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-6">
          <InputOTP 
            maxLength={6} 
            value={verifyCode} 
            onChange={setVerifyCode}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, index) => (
                  <InputOTPSlot key={index} {...slot} index={index} />
                ))}
              </InputOTPGroup>
            )}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Back
        </Button>
        <Button 
          onClick={handleVerify} 
          disabled={isLoading || verifyCode.length !== 6}
        >
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
