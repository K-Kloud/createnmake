
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SignInFormValues, SignUpFormValues } from "./PhoneAuthTypes";
import { sendWelcomeNotification, sendVerificationNotification } from "@/services/notificationService";

export const usePhoneAuth = (
  isSignUp: boolean,
  setIsLoading: (isLoading: boolean) => void,
  username: string
) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const handleSendOTP = async (phone: string, usernameValue?: string) => {
    setIsLoading(true);
    
    try {
      // Format phone number if needed
      const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
      setPhoneNumber(formattedPhone);
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: isSignUp && usernameValue ? {
          data: {
            username: usernameValue,
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
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();
          
        if (!existingProfile) {
          // Create profile using current authenticated session (RLS policies now allow this)
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: username || data.user.phone || 'user',
              updated_at: new Date().toISOString(),
            });
          
          if (profileError) {
            console.error("Error creating profile:", profileError);
            // Continue anyway as auth was successful
          } else {
            // Send welcome notification for new users
            await sendWelcomeNotification(data.user.id);
          }
        }
      }

      // Send verification notification
      if (data?.user) {
        await sendVerificationNotification(data.user.phone || '', 'verification-code');
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

  const handleSignInSubmit = async (values: SignInFormValues) => {
    await handleSendOTP(values.phoneNumber);
  };

  const handleSignUpSubmit = async (values: SignUpFormValues) => {
    await handleSendOTP(values.phoneNumber, values.username);
  };

  return {
    phoneNumber,
    verificationCode,
    setVerificationCode,
    isVerificationSent,
    handleVerifyOTP,
    handleSignInSubmit,
    handleSignUpSubmit
  };
};
