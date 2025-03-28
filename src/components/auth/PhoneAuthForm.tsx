
import { useState } from "react";
import { VerificationCodeForm } from "./phone/VerificationCodeForm";
import { PhoneSignInForm } from "./phone/PhoneSignInForm";
import { PhoneSignUpForm } from "./phone/PhoneSignUpForm";
import { usePhoneAuth } from "./phone/usePhoneAuth";
import { PhoneAuthFormProps } from "./phone/PhoneAuthTypes";

export const PhoneAuthForm = ({
  isLoading,
  setIsLoading,
  onBack,
  isSignUp = false,
  username = "",
  setUsername = () => {},
}: PhoneAuthFormProps) => {
  const {
    phoneNumber,
    verificationCode,
    setVerificationCode,
    isVerificationSent,
    handleVerifyOTP,
    handleSignInSubmit,
    handleSignUpSubmit
  } = usePhoneAuth(isSignUp, setIsLoading, username);

  if (isVerificationSent) {
    return (
      <VerificationCodeForm
        phoneNumber={phoneNumber}
        isLoading={isLoading}
        onVerify={handleVerifyOTP}
        onBack={onBack}
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
      />
    );
  }

  // Render the appropriate form based on whether it's sign-up or sign-in
  return isSignUp ? (
    <PhoneSignUpForm
      onSubmit={handleSignUpSubmit}
      isLoading={isLoading}
      onBack={onBack}
      username={username}
      setUsername={setUsername}
    />
  ) : (
    <PhoneSignInForm
      onSubmit={handleSignInSubmit}
      isLoading={isLoading}
      onBack={onBack}
    />
  );
};
