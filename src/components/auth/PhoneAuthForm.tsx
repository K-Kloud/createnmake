
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface PhoneAuthFormProps {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  onBack: () => void;
  isSignUp?: boolean;
  username?: string;
  setUsername?: (username: string) => void;
}

export const PhoneAuthForm = ({
  isLoading,
  setIsLoading,
  onBack,
  isSignUp = false,
  username = "",
  setUsername = () => {},
}: PhoneAuthFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  // Define the form schemas
  const signUpSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    phoneNumber: z.string().min(8, "Please enter a valid phone number")
  });

  const signInSchema = z.object({
    phoneNumber: z.string().min(8, "Please enter a valid phone number")
  });

  // Use the appropriate schema based on isSignUp flag
  const formSchema = isSignUp ? signUpSchema : signInSchema;

  // Infer the form schema type
  type FormValues = z.infer<typeof formSchema>;

  // Initialize the form with correct default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isSignUp 
      ? { username, phoneNumber: "" }
      : { phoneNumber: "" }
  });

  const handleSendOTP = async (values: FormValues) => {
    setIsLoading(true);
    const phone = values.phoneNumber;
    
    try {
      // Format phone number if needed
      const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
      setPhoneNumber(formattedPhone);
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: isSignUp ? {
          data: {
            username: isSignUp ? values.username : undefined,
          }
        } : undefined
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
      const { error, data } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: verificationCode,
        type: 'sms',
      });

      if (error) throw error;

      // If it's a sign-up, create a profile record
      if (isSignUp && data?.user) {
        // If we have username from the form
        const usernameToUse = isSignUp && form.getValues().username 
          ? form.getValues().username 
          : undefined;

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            username: usernameToUse,
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          // Continue anyway as auth was successful
        }
      }

      toast({
        title: "Success",
        description: isSignUp 
          ? "Account created successfully!" 
          : "Phone number verified successfully",
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSendOTP)} className="space-y-4">
        {isSignUp && (
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Choose a username" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      if (setUsername) setUsername(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="+1234567890" 
                  type="tel"
                  {...field} 
                />
              </FormControl>
              <p className="text-xs text-muted-foreground mt-1">
                Include country code (e.g., +1 for US)
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2 mt-4">
          <Button className="w-full" type="submit" disabled={isLoading}>
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
    </Form>
  );
};
