
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/Icons";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SignInFormValues, signInSchema } from "./PhoneAuthTypes";

interface PhoneSignInFormProps {
  onSubmit: (values: SignInFormValues) => Promise<void>;
  isLoading: boolean;
  onBack: () => void;
}

export const PhoneSignInForm = ({ onSubmit, isLoading, onBack }: PhoneSignInFormProps) => {
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
