
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { SocialButtons } from "./SocialButtons";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { PhoneAuthForm } from "./PhoneAuthForm";

export function AuthDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  if (isResetMode) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] glass-card">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>

          <ResetPasswordForm
            email={email}
            setEmail={setEmail}
            isLoading={isLoading}
            onBack={() => setIsResetMode(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  if (isPhoneMode) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] glass-card">
          <DialogHeader>
            <DialogTitle>
              {activeTab === "signin" ? "Phone Sign In" : "Phone Sign Up"}
            </DialogTitle>
            <DialogDescription>
              Enter your phone number to receive a verification code.
            </DialogDescription>
          </DialogHeader>

          <PhoneAuthForm 
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            onBack={() => setIsPhoneMode(false)}
            isSignUp={activeTab === "signup"}
            username={username}
            setUsername={setUsername}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass-card">
        <DialogHeader>
          <DialogTitle>Welcome to Create2Make</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to start creating amazing AI-generated images
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <SocialButtons onPhoneAuth={() => setIsPhoneMode(true)} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Tabs 
            defaultValue="signin" 
            className="w-full"
            onValueChange={(value) => setActiveTab(value as "signin" | "signup")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <SignInForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                isLoading={isLoading}
                onForgotPassword={() => setIsResetMode(true)}
              />
              <div className="mt-4 text-center">
                <button 
                  type="button"
                  onClick={() => setIsPhoneMode(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Sign in with phone number instead
                </button>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <SignUpForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                username={username}
                setUsername={setUsername}
                isLoading={isLoading}
              />
              <div className="mt-4 text-center">
                <button 
                  type="button"
                  onClick={() => setIsPhoneMode(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Sign up with phone number instead
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
