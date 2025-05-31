
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/Icons";
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import { useEffect, useRef } from "react";

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
  const otpRef = useRef<HTMLDivElement>(null);

  // Auto-focus the OTP input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      const firstInput = otpRef.current?.querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (value: string) => {
    if (!isLoading) {
      setVerificationCode(value);
    }
  };

  return (
    <form onSubmit={onVerify} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="verification-code">Enter verification code</Label>
        <p className="text-sm text-muted-foreground">
          We've sent a 6-digit code to {phoneNumber}
        </p>
        <div className="flex justify-center py-4">
          <div ref={otpRef} onClick={() => {
            if (!isLoading) {
              const firstInput = otpRef.current?.querySelector('input');
              if (firstInput) {
                firstInput.focus();
              }
            }
          }}>
            <InputOTP
              maxLength={6}
              value={verificationCode}
              onChange={handleInputChange}
              disabled={isLoading}
              className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
        {isLoading && (
          <p className="text-xs text-center text-muted-foreground">
            Verifying your code...
          </p>
        )}
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
          disabled={isLoading}
        >
          Back to Sign In
        </Button>
      </div>
    </form>
  );
};
