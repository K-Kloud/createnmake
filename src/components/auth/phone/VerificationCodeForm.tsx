
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/Icons";
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";

interface VerificationCodeFormProps {
  phoneNumber: string;
  isLoading: boolean;
  onVerify: (e: React.FormEvent) => Promise<void>;
  onBack: () => void;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
}

export const VerificationCodeForm = ({
  phoneNumber,
  isLoading,
  onVerify,
  onBack,
  verificationCode,
  setVerificationCode
}: VerificationCodeFormProps) => {
  return (
    <form onSubmit={onVerify} className="space-y-4">
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
};
