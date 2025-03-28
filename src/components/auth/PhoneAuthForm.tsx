
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/Icons";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";

interface PhoneAuthFormProps {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  onBack: () => void;
}

export const PhoneAuthForm = ({
  isLoading,
  setIsLoading,
  onBack,
}: PhoneAuthFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Format phone number if needed
      const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      setIsVerificationSent(true);
      toast({
        title: "Verification code sent",
        description: `We've sent a code to ${formattedPhone}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Format phone number if needed
      const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
      
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: verificationCode,
        type: 'sms',
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Phone number verified successfully",
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerificationSent) {
    return (
      <form onSubmit={handleVerifyOTP} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verification-code">Enter verification code</Label>
          <div className="flex justify-center py-4">
            <InputOTP
              maxLength={6}
              value={verificationCode}
              onChange={setVerificationCode}
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
        
        <div className="space-y-2 mt-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || verificationCode.length !== 6}
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
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full mt-2"
          >
            Back to Sign In
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOTP} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone-number">Phone Number</Label>
        <Input
          id="phone-number"
          type="tel"
          placeholder="+1234567890"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Include country code (e.g., +1 for US)
        </p>
      </div>
      
      <div className="space-y-2 mt-4">
        <Button className="w-full" type="submit" disabled={isLoading || !phoneNumber}>
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Sending code...
            </>
          ) : (
            "Send Verification Code"
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="w-full mt-2"
        >
          Back to Sign In
        </Button>
      </div>
    </form>
  );
};
