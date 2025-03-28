
import { z } from "zod";

// Define type-safe schema interfaces for sign-up flow
export const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  phoneNumber: z.string().min(8, "Please enter a valid phone number")
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

// Define type-safe schema interfaces for sign-in flow
export const signInSchema = z.object({
  phoneNumber: z.string().min(8, "Please enter a valid phone number")
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export interface PhoneAuthFormProps {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  onBack: () => void;
  isSignUp?: boolean;
  username?: string;
  setUsername?: (username: string) => void;
}
