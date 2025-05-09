
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
import QRCode from "qrcode";
import { useEffect } from "react";

interface MFASetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const MFASetup = ({ onComplete, onCancel }: MFASetupProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [factorCreated, setFactorCreated] = useState(false);

  useEffect(() => {
    const setupMFA = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
        });

        if (error) throw error;

        setFactorId(data.id);

        // Generate QR code
        try {
          const qrCodeUrl = await QRCode.toDataURL(data.totp.uri);
          setQrCode(qrCodeUrl);
          setFactorCreated(true);
        } catch (err) {
          console.error("Error generating QR code:", err);
          toast({
            title: "Error generating QR code",
            description: "Please try again later",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error setting up MFA",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    setupMFA();
  }, [toast]);

  const handleVerify = async () => {
    if (!factorId) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({ 
        factorId, 
        code: verifyCode 
      });

      if (error) throw error;

      toast({
        title: "MFA Setup Successful",
        description: "Multi-factor authentication has been enabled for your account",
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
        <CardTitle>Set Up Two-Factor Authentication</CardTitle>
        <CardDescription>
          Scan the QR code with an authenticator app like Google Authenticator or Authy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && !factorCreated ? (
          <div className="flex justify-center py-8">
            <Icons.spinner className="h-8 w-8 animate-spin" />
          </div>
        ) : qrCode ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="border border-border p-2 rounded-lg bg-white">
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Enter the 6-digit code from your authenticator app
              </p>
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
          </div>
        ) : (
          <p>Failed to generate QR code. Please try again.</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
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
            "Verify & Enable"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
